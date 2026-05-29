# Charon — Kafka Client for Node.js

> **The maintained fork of KafkaJS.** Drop-in replacement. No code changes.

[![CI](https://github.com/ousiaresearch/charon/workflows/CI/badge.svg)](https://github.com/ousiaresearch/charon/actions)
[![npm](https://img.shields.io/npm/v/@ousia/kafkajs?label=%40ousia%2Fkafkajs)](https://www.npmjs.com/package/@ousia/kafkajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink)](https://github.com/sponsors/ousiaresearch)

KafkaJS was the standard Kafka client for Node.js — 12 million monthly downloads, pure JavaScript, zero native dependencies. In August 2024, its maintainers [stepped down](https://github.com/tulios/kafkajs/issues/1603). Two years later, no successor emerged.

**Charon is that successor.**

---

## Why this fork exists

The original `tulios/kafkajs` hasn't seen a commit since August 2024. 400+ open issues. 10 open PRs, including bugfixes from weeks ago that no one reviewed. 12.2 million monthly npm downloads — all running unmaintained code.

Three takeover attempts failed. Confluent built an alternative — zero adoption. The community tried community forks — they died. Users stay because they need **pure JavaScript**: no native compilation, no platform-specific binaries, no Docker image bloat.

**Charon picks up where KafkaJS left off.** Same API, same protocol, now actively maintained by Ousia Research.

---

## Migration — one line

```diff
- "kafkajs": "^2.2.4"
+ "@ousia/kafkajs": "^3.0.0"
```

```diff
- const { Kafka } = require('kafkajs')
+ const { Kafka } = require('@ousia/kafkajs')
```

**That's it.** No code changes. No API changes. Same protocol, same behavior. Now with a maintainer.

---

## What's new in v3.0.0

- **Node >= 18** (was >= 14)
- **Actively maintained** — PRs reviewed, issues triaged, bugs fixed
- **GitHub Actions CI** — tested against Node 18, 20, 22 on Kafka 2.4 through latest
- **KRaft support** — Kafka 3.3+ without ZooKeeper
- **Modern tooling** — updated dependencies, security audits, dependabot
- **TypeScript types maintained** — no more stale `.d.ts` files

### Bugs fixed in this release

*(To be populated as we merge fixes)*

---

## Sponsors

Charon is maintained by [Ousia Research](https://github.com/ousiaresearch). If your company depends on this library, consider [sponsoring](https://github.com/sponsors/ousiaresearch) to keep it maintained.

| Tier | Price | What you get |
|------|-------|-------------|
| Supporter | $5/mo | Name in README, warm feelings |
| Professional | $25/mo | Priority issue triage, sponsor badge |
| Enterprise | $100/mo | Email support, SLA on critical bugs |
| Partner | $500/mo | Dedicated support channel, roadmap input |

---

## Credits

Charon is a fork of [KafkaJS](https://github.com/tulios/kafkajs), created by [Túlio Ornelas](https://github.com/tulios) and maintained by [Tommy Brunn](https://github.com/Nevon) and the KafkaJS community. We're grateful for the foundation they built.

*"Charon" — the ferryman. Carries your messages across the river.*
