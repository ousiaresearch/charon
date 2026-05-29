# Migrating from tulios/kafkajs to @ousiaresearch/kafkajs (Charon)

Charon is a drop-in replacement for KafkaJS. No code changes required beyond
your npm install command.

## Quick start

```bash
npm uninstall kafkajs
npm install @ousiaresearch/kafkajs
```

Then update your imports:

```diff
- const { Kafka } = require('kafkajs')
+ const { Kafka } = require('@ousiaresearch/kafkajs')
```

Or with ES modules:

```diff
- import { Kafka } from 'kafkajs'
+ import { Kafka } from '@ousiaresearch/kafkajs')
```

## API compatibility

**100% compatible.** The public API is identical to `tulios/kafkajs` v2.2.4.
All method signatures, event names, error types, and configuration options are
unchanged.

## What's different

| Original (kafkajs 2.2.4) | Charon (@ousia/kafkajs) |
|---------------------------|-------------------------|
| Node >= 14                | Node >= 18              |
| Azure Pipelines CI        | GitHub Actions CI        |
| No updates since Aug 2024 | Actively maintained      |
| 400+ open issues          | Being triaged and fixed  |
| 10 unreviewed PRs         | Merged and released      |
| Unmaintained dependencies | Dependabot-managed       |

## What's been fixed (v3.0.0)

- **Bugfixes merged from upstream PRs:**
  - Fix scheduleAt negative calculation preventing timer corruption
  - Fix targetedTopics crash when a topic is deleted (#1622)
  - Multi-consumer same groupId with different topics fix
  - Log `warn` instead of `error` when rebalancing (noise reduction)
  - Fix negative timeout in `scheduleCheckPendingRequests`
  - Broken anchor links in documentation (#1758)

- **Performance:**
  - `groupMessagesPerPartition` ~600x faster for large batches
  - `arrayDiff` O(n+m) via Set instead of O(n×m)

- **Protocol:**
  - Added `THROTTLING_QUOTA_EXCEEDED` (Kafka error code 89, retriable)

- **Consumer:**
  - Idle consumer no longer burns CPU with 10ms polling loop

## Node.js version

Charon v3.x requires **Node.js >= 18**. The original KafkaJS supported Node 14+,
which [reached end-of-life in April 2024](https://nodejs.org/en/about/previous-releases).
If you're still on Node 14–16, upgrade your runtime first.

## Why Charon?

KafkaJS stopped receiving updates in August 2024 — the maintainers [stepped
down](https://github.com/tulios/kafkajs/issues/1603). Two years later, 12.2
million monthly npm downloads are running unmaintained code with 400+ open
issues. No community fork gained adoption.

Charon carries the torch. Same client, active maintenance, continuous
improvement.

## Support

- [GitHub Issues](https://github.com/ousiaresearch/charon/issues)
- [GitHub Sponsors](https://github.com/sponsors/ousiaresearch) — support
  ongoing maintenance
