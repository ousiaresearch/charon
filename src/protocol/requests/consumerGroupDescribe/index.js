// KIP-848: ConsumerGroupDescribe API (Key: 69)
//
// Request (Version: 0):
//   group_ids => COMPACT_ARRAY<COMPACT_STRING>
//   include_authorized_operations => BOOLEAN
//
// Response (Version: 0):
//   throttle_time_ms => INT32
//   groups => COMPACT_ARRAY<DescribedGroup>
//   DescribedGroup => error_code (INT16) error_message (COMPACT_NULLABLE_STRING)
//     group_id (COMPACT_STRING) group_state (INT8) group_epoch (INT32)
//     assignment_epoch (INT32) members (COMPACT_ARRAY<Member>)
//   Member => member_id (COMPACT_STRING) instance_id (COMPACT_NULLABLE_STRING)
//     rack_id (COMPACT_NULLABLE_STRING) member_epoch (INT32) client_id (COMPACT_STRING)
//     client_host (COMPACT_STRING) subscribed_topic_names (COMPACT_ARRAY<COMPACT_STRING>)
//     subscribed_topic_regex (COMPACT_NULLABLE_STRING) assignment (TopicPartitions)

const Encoder = require('../../encoder')
const Decoder = require('../../decoder')
const { ConsumerGroupDescribe: apiKey } = require('../apiKeys')

/**
 * Decode TopicPartitions from the response
 * TopicPartitions => topic_id (UUID/COMPACT_STRING) partitions (COMPACT_ARRAY<INT32>)
 */
function decodeTopicPartitions(decoder) {
  const assignmentLength = decoder.readUVarInt()
  const assignment = []

  if (assignmentLength > 0) {
    for (let i = 0; i < assignmentLength - 1; i++) {
      const topicId = decoder.readUVarIntString()
      const partitionsLength = decoder.readUVarInt()
      const partitions = []
      if (partitionsLength > 0) {
        for (let j = 0; j < partitionsLength - 1; j++) {
          partitions.push(decoder.readInt32())
        }
      }
      assignment.push({ topicId, partitions })
    }
  }

  return assignment
}

const response = {
  decode: async rawData => {
    const decoder = new Decoder(rawData)
    const result = {
      throttleTime: decoder.readInt32(),
    }

    // Decode groups array
    const groupsLength = decoder.readUVarInt()
    const groups = []

    if (groupsLength > 0) {
      for (let i = 0; i < groupsLength - 1; i++) {
        const group = {
          errorCode: decoder.readInt16(),
          errorMessage: decoder.readUVarIntString(),
          groupId: decoder.readUVarIntString(),
          groupState: decoder.readInt8(),
          groupEpoch: decoder.readInt32(),
          assignmentEpoch: decoder.readInt32(),
        }

        // Decode members
        const membersLength = decoder.readUVarInt()
        const members = []
        if (membersLength > 0) {
          for (let j = 0; j < membersLength - 1; j++) {
            const member = {
              memberId: decoder.readUVarIntString(),
              instanceId: decoder.readUVarIntString(),
              rackId: decoder.readUVarIntString(),
              memberEpoch: decoder.readInt32(),
              clientId: decoder.readUVarIntString(),
              clientHost: decoder.readUVarIntString(),
            }

            // Subscribed topic names
            const topicNamesLength = decoder.readUVarInt()
            const subscribedTopicNames = []
            if (topicNamesLength > 0) {
              for (let k = 0; k < topicNamesLength - 1; k++) {
                subscribedTopicNames.push(decoder.readUVarIntString())
              }
            }
            member.subscribedTopicNames = subscribedTopicNames

            // Subscribed topic regex
            member.subscribedTopicRegex = decoder.readUVarIntString()

            // Assignment
            member.assignment = decodeTopicPartitions(decoder)

            // Tagged fields per member
            decoder.readTaggedFields()
            members.push(member)
          }
        }
        group.members = members

        // Authorized operations
        group.authorizedOperations = decoder.readInt32()

        // Tagged fields per group
        decoder.readTaggedFields()
        groups.push(group)
      }
    }
    result.groups = groups

    // Top-level tagged fields
    decoder.readTaggedFields()
    return result
  },
}

const versions = {
  0: ({ groupIds, includeAuthorizedOperations = false }) => {
    const request = () => ({
      apiKey,
      apiVersion: 0,
      apiName: 'ConsumerGroupDescribe',
      encode: async () => {
        return new Encoder()
          .writeUVarIntArray(
            groupIds.map(id => new Encoder().writeUVarIntString(id)),
            'object'
          )
          .writeBoolean(includeAuthorizedOperations)
      },
    })

    return { request: request(), response }
  },
}

module.exports = {
  versions: Object.keys(versions),
  protocol: ({ version }) => versions[version],
}
