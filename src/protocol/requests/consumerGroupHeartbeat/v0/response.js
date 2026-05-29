const Decoder = require('../../../decoder')

/**
 * ConsumerGroupHeartbeat Response (Version: 0) => throttle_time_ms error_code
 *   error_message member_id member_epoch heartbeat_interval_ms
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   error_message => COMPACT_NULLABLE_STRING
 *   member_id => COMPACT_STRING
 *   member_epoch => INT32
 *   heartbeat_interval_ms => INT32
 */
module.exports = {
  decode: async rawData => {
    const decoder = new Decoder(rawData)
    return {
      throttleTime: decoder.readInt32(),
      errorCode: decoder.readInt16(),
      errorMessage: decoder.readUVarIntString(),
      memberId: decoder.readUVarIntString(),
      memberEpoch: decoder.readInt32(),
      heartbeatInterval: decoder.readInt32(),
    }
  },
}
