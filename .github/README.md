# Charon

> The maintained fork of KafkaJS — a modern Apache Kafka client for Node.js.
> Pure JavaScript, zero native dependencies. Drop-in replacement for KafkaJS.

## What is this?

KafkaJS was the standard Kafka client for Node.js — 12 million monthly downloads. Its maintainers stepped down in August 2024. No maintained successor emerged until now.

**Charon** picks up where KafkaJS left off. Same API, same wire protocol. Now with a maintainer.

## Migration from KafkaJS

```bash
npm uninstall kafkajs
npm install @ousia/kafkajs
```

```js
// before
const { Kafka } = require('kafkajs')

// after
const { Kafka } = require('@ousia/kafkajs')
```

No other code changes needed.

## Sponsorship

If your company depends on Charon, consider [sponsoring](https://github.com/sponsors/ousiaresearch) Ousia Research to keep it maintained.

## Credits

Charon is built on [KafkaJS](https://github.com/tulios/kafkajs) by Túlio Ornelas and Tommy Brunn. Licensed under MIT.

*"Charon" — the ferryman of the river Styx. Your messages cross safely.*
