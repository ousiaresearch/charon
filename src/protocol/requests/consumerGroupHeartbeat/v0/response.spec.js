const Encoder = require('../../../encoder')
const Decoder = require('../../../decoder')
const apiKeys = require('../../apiKeys')

describe('ConsumerGroupHeartbeat v0', () => {
  const createRequest = require('./request')
  const response = require('./response')

  test('request encodes correctly', async () => {
    const req = createRequest({
      groupId: 'test-group',
      memberId: '',
      memberEpoch: 0,
      instanceId: null,
      rackId: null,
      rebalanceTimeoutMs: 45000,
    })

    expect(req.apiKey).toBe(apiKeys.ConsumerGroupHeartbeat)
    expect(req.apiVersion).toBe(0)
    expect(req.apiName).toBe('ConsumerGroupHeartbeat')
  })

  test('response decodes correctly', async () => {
    const encoder = new Encoder()
      .writeInt32(100) // throttleTime
      .writeInt16(0) // errorCode
      .writeUVarIntString(null) // errorMessage
      .writeUVarIntString('member-1') // memberId
      .writeInt32(5) // memberEpoch
      .writeInt32(5000) // heartbeatInterval

    const decoded = await response.decode(encoder.buffer)
    expect(decoded).toEqual({
      throttleTime: 100,
      errorCode: 0,
      errorMessage: null,
      memberId: 'member-1',
      memberEpoch: 5,
      heartbeatInterval: 5000,
    })
  })

  test('response decodes error correctly', async () => {
    const encoder = new Encoder()
      .writeInt32(50)
      .writeInt16(110) // FENCED_MEMBER_EPOCH
      .writeUVarIntString('Member epoch fenced')
      .writeUVarIntString('member-old')
      .writeInt32(-1) // memberEpoch
      .writeInt32(0)

    const decoded = await response.decode(encoder.buffer)
    expect(decoded.errorCode).toBe(110)
    expect(decoded.errorMessage).toBe('Member epoch fenced')
    expect(decoded.memberEpoch).toBe(-1)
  })
})
