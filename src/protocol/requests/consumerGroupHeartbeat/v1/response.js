const Decoder = require('../../../decoder')

/**
 * ConsumerGroupHeartbeat Response (Version: 1) => throttle_time_ms error_code
 *   error_message member_id member_epoch heartbeat_interval_ms assignment
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   error_message => COMPACT_NULLABLE_STRING
 *   member_id => COMPACT_STRING
 *   member_epoch => INT32
 *   heartbeat_interval_ms => INT32
 *   assignment => COMPACT_ARRAY<TopicPartitions> where:
 *     TopicPartitions => topic_id (UUID) partitions (COMPACT_ARRAY<INT32>)
 */
module.exports = {
  decode: async rawData => {
    const decoder = new Decoder(rawData)
    const response = {
      throttleTime: decoder.readInt32(),
      errorCode: decoder.readInt16(),
      errorMessage: decoder.readUVarIntString(),
      memberId: decoder.readUVarIntString(),
      memberEpoch: decoder.readInt32(),
      heartbeatInterval: decoder.readInt32(),
    }

    // Decode the assignment: COMPACT_ARRAY of TopicPartitions
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

    response.assignment = assignment

    // Read tagged fields
    decoder.readTaggedFields()
    return response
  },
}
