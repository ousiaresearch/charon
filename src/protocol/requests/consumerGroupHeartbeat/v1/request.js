// ConsumerGroupHeartbeat v1 adds:
//   Request: subscribed_topic_names (COMPACT_ARRAY<COMPACT_STRING>)
//   Response: assignment (COMPACT_ARRAY of TopicPartitions)

const Encoder = require('../../../encoder')
const { ConsumerGroupHeartbeat: apiKey } = require('../../apiKeys')

/**
 * @param {object} options
 * @param {string} options.groupId
 * @param {string} options.memberId
 * @param {number} options.memberEpoch
 * @param {string|null} [options.instanceId]
 * @param {string|null} [options.rackId]
 * @param {number} options.rebalanceTimeoutMs
 * @param {string[]} [options.subscribedTopicNames]
 */
module.exports = ({
  groupId,
  memberId,
  memberEpoch,
  instanceId = null,
  rackId = null,
  rebalanceTimeoutMs,
  subscribedTopicNames = [],
}) => ({
  apiKey,
  apiVersion: 1,
  apiName: 'ConsumerGroupHeartbeat',
  encode: async () => {
    return new Encoder()
      .writeUVarIntString(groupId)
      .writeUVarIntString(memberId)
      .writeInt32(memberEpoch)
      .writeUVarIntString(instanceId)
      .writeUVarIntString(rackId)
      .writeInt32(rebalanceTimeoutMs)
      .writeUVarIntArray(
        subscribedTopicNames.map(t => new Encoder().writeUVarIntString(t)),
        'object'
      )
  },
})
