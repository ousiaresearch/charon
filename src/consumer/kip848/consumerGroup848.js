/**
 * KIP-848 Consumer Group Protocol Coordinator
 *
 * Extends the classic ConsumerGroup and replaces the JoinGroup/SyncGroup/Heartbeat
 * dance with a single ConsumerGroupHeartbeat RPC (KIP-848).
 *
 * Kafka 4.0+ brokers drive assignment — no client-side leader election,
 * no stop-the-world rebalances. The broker sends assignment updates via
 * heartbeat responses with bumped member epochs.
 *
 * All fetch pipeline logic (seek offsets, replica preference, offset recovery,
 * stale metadata detection) is inherited from ConsumerGroup unchanged.
 */

const ConsumerGroup = require('../consumerGroup')
const { KafkaJSError } = require('../../errors')

const PRIVATE = {
  HEARTBEAT: Symbol('private:ConsumerGroup848:heartbeat'),
  RECONCILE: Symbol('private:ConsumerGroup848:reconcile'),
}

module.exports = class ConsumerGroup848 extends ConsumerGroup {
  /**
   * KIP-848: Join the consumer group by sending initial heartbeat with epoch 0.
   * The broker responds with memberId, memberEpoch, and initial assignment.
   *
   * Replaces the classic [PRIVATE.JOIN] → [PRIVATE.SYNC] sequence.
   */
  async joinAndSync() {
    const startJoin = Date.now()

    return this.retrier(async bail => {
      try {
        this.coordinator = await this.cluster.findGroupCoordinator({
          groupId: this.groupId,
        })

        const response = await this.coordinator.consumerGroupHeartbeat({
          groupId: this.groupId,
          memberId: this.memberId || '',
          memberEpoch: this.memberEpoch || 0,
          instanceId: null,
          rackId: this.rackId,
          rebalanceTimeoutMs: this.rebalanceTimeout,
          subscribedTopicNames: this.topicsSubscribed,
        })

        this.memberId = response.memberId
        this.memberEpoch = response.memberEpoch
        this.heartbeatInterval = response.heartbeatInterval || this.sessionTimeout / 3
        this.lastHeartbeat = Date.now()

        // Process assignment via the same reconciliation path classic uses
        await this[PRIVATE.RECONCILE](response)

        const memberAssignment = this.assigned().reduce(
          (result, { topic, partitions }) => ({ ...result, [topic]: partitions }),
          {}
        )

        const payload = {
          groupId: this.groupId,
          memberId: this.memberId,
          leaderId: this.memberId, // KIP-848: no leader — everyone reports self
          isLeader: false, // Broker drives assignment
          memberAssignment,
          groupProtocol: 'consumer',
          duration: Date.now() - startJoin,
        }

        this.instrumentationEmitter.emit(
          require('../instrumentationEvents').events.GROUP_JOIN,
          payload
        )
        this.logger.info('Consumer has joined the group (KIP-848)', payload)
      } catch (e) {
        if (e.type === 'FENCED_MEMBER_EPOCH' || e.type === 'UNKNOWN_MEMBER_ID') {
          this.memberId = ''
          this.memberEpoch = 0
          throw new KafkaJSError(e)
        }
        bail(e)
      }
    })
  }

  /**
   * KIP-848: Send heartbeat via ConsumerGroupHeartbeat.
   * Replaces the classic heartbeat() that used Heartbeat RPC + sharedPromiseTo.
   */
  async heartbeat() {
    const { groupId, memberId, memberEpoch } = this
    const now = Date.now()

    if (!memberId || now < (this.lastHeartbeat || 0) + (this.heartbeatInterval || 3000)) {
      return
    }

    const payload = {
      groupId,
      memberId,
      groupGenerationId: memberEpoch,
    }

    try {
      const response = await this.coordinator.consumerGroupHeartbeat({
        groupId,
        memberId,
        memberEpoch,
        instanceId: null,
        rackId: this.rackId,
        rebalanceTimeoutMs: this.rebalanceTimeout,
        subscribedTopicNames: this.topicsSubscribed,
      })

      this.lastHeartbeat = Date.now()
      this.instrumentationEmitter.emit(
        require('../instrumentationEvents').events.HEARTBEAT,
        payload
      )

      // Broker assigned new partitions (memberEpoch bumped)
      if (response.memberEpoch > memberEpoch) {
        this.logger.info('KIP-848 rebalance: new assignment from broker', {
          groupId,
          oldEpoch: memberEpoch,
          newEpoch: response.memberEpoch,
        })
        this.memberEpoch = response.memberEpoch
        await this[PRIVATE.RECONCILE](response)
      }

      this.heartbeatInterval = response.heartbeatInterval || this.heartbeatInterval
    } catch (e) {
      // FENCED_MEMBER_EPOCH or UNKNOWN_MEMBER_ID → rejoin
      if (e.type === 'FENCED_MEMBER_EPOCH' || e.type === 'UNKNOWN_MEMBER_ID') {
        this.memberId = null
        this.memberEpoch = 0
      }
      throw e
    }
  }

  /**
   * KIP-848: Leave the group gracefully.
   */
  async leave() {
    const { groupId, memberId } = this
    if (memberId) {
      try {
        await this.coordinator.leaveGroup({ groupId, memberId })
      } catch (_) {
        // Best effort
      }
      this.memberId = null
      this.memberEpoch = 0
    }
  }

  /**
   * KIP-848: No leader election — broker drives assignment.
   */
  isLeader() {
    return false
  }

  /**
   * Process broker assignment and reconcile partitions.
   *
   * Uses the same SubscriptionState + OffsetManager machinery as the classic
   * ConsumerGroup's [PRIVATE.SYNC], adapted for KIP-848's assignment format
   * (topicId UUIDs → partition arrays).
   *
   * @param {object} response Heartbeat response with optional assignment
   */
  async [PRIVATE.RECONCILE](response) {
    const assignment = response.assignment || []

    // Convert {topicId, partitions} to the format SubscriptionState expects
    // In KIP-848 v1, topicId is a UUID. The broker may also return topic names
    // if the client negotiated appropriately. For initial support, we treat
    // topicId as a topic name and let metadata resolve UUIDs later.
    const currentMemberAssignment = []

    if (assignment.length > 0) {
      await this.cluster.refreshMetadata()

      for (const { topicId, partitions } of assignment) {
        currentMemberAssignment.push({
          topic: topicId,
          partitions: [...new Set(partitions)],
        })
      }
    }

    // Keep track of partitions per subscribed topic (for stale assignment detection)
    this.partitionsPerSubscribedTopic = this.generatePartitionsPerSubscribedTopic()

    // Reconcile discovered topics
    const arrayDiff = require('../../utils/arrayDiff')
    const assignedTopics = currentMemberAssignment.map(({ topic }) => topic)
    const topicsNotSubscribed = arrayDiff(assignedTopics, this.topicsSubscribed)

    if (topicsNotSubscribed.length > 0) {
      this.instrumentationEmitter.emit(
        require('../instrumentationEvents').events.RECEIVED_UNSUBSCRIBED_TOPICS,
        {
          groupId: this.groupId,
          generationId: this.memberEpoch,
          memberId: this.memberId,
          assignedTopics,
          topicsSubscribed: this.topicsSubscribed,
          topicsNotSubscribed,
        }
      )
    }

    // Remove unsubscribed topics
    const safeAssignment = arrayDiff(assignedTopics, topicsNotSubscribed)
    const filteredAssignment = currentMemberAssignment.filter(({ topic }) =>
      safeAssignment.includes(topic)
    )

    // Check consumer awareness of assigned partitions
    for (const { topic, partitions: assignedPartitions } of filteredAssignment) {
      const knownPartitions = this.partitionsPerSubscribedTopic.get(topic)
      if (knownPartitions) {
        const isAwareOfAll = assignedPartitions.every(p => knownPartitions.includes(p))
        if (!isAwareOfAll) {
          await this.cluster.refreshMetadata()
          this.partitionsPerSubscribedTopic = this.generatePartitionsPerSubscribedTopic()
          break
        }
      }
    }

    this.topics = filteredAssignment.map(({ topic }) => topic)
    this.subscriptionState.assign(filteredAssignment)

    // Wire up the offset manager (same as classic ConsumerGroup.[PRIVATE.SYNC])
    const OffsetManager = require('../offsetManager')
    this.offsetManager = new OffsetManager({
      cluster: this.cluster,
      topicConfigurations: this.topicConfigurations,
      instrumentationEmitter: this.instrumentationEmitter,
      memberAssignment: filteredAssignment.reduce(
        (acc, { topic, partitions }) => ({ ...acc, [topic]: partitions }),
        {}
      ),
      autoCommit: this.autoCommit,
      autoCommitInterval: this.autoCommitInterval,
      autoCommitThreshold: this.autoCommitThreshold,
      coordinator: this.coordinator,
      groupId: this.groupId,
      generationId: this.memberEpoch,
      memberId: this.memberId,
    })
  }
}
