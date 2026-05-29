// KIP-848: ConsumerGroupHeartbeat API (Key: 68)
//
// Request:
//   group_id => COMPACT_STRING
//   member_id => COMPACT_STRING
//   member_epoch => INT32
//   instance_id => COMPACT_NULLABLE_STRING
//   rack_id => COMPACT_NULLABLE_STRING
//   rebalance_timeout_ms => INT32
//
// Response:
//   throttle_time_ms => INT32
//   error_code => INT16
//   error_message => COMPACT_NULLABLE_STRING
//   member_id => COMPACT_STRING
//   member_epoch => INT32
//   heartbeat_interval_ms => INT32

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
 */
module.exports = ({
  groupId,
  memberId,
  memberEpoch,
  instanceId = null,
  rackId = null,
  rebalanceTimeoutMs,
}) => ({
  apiKey,
  apiVersion: 0,
  apiName: 'ConsumerGroupHeartbeat',
  encode: async () => {
    return new Encoder()
      .writeUVarIntString(groupId)
      .writeUVarIntString(memberId)
      .writeInt32(memberEpoch)
      .writeUVarIntString(instanceId)
      .writeUVarIntString(rackId)
      .writeInt32(rebalanceTimeoutMs)
  },
})
