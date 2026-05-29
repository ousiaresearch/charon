# Contributing to Charon

Thanks for helping maintain the Kafka client that 12 million npm users depend
on.

## Getting started

```bash
# Clone and install
git clone https://github.com/ousiaresearch/charon.git
cd charon
yarn install
```

**Requirements:**
- Node.js >= 18
- Yarn (package manager)
- Docker + Docker Compose v2 (for integration tests)

## Running tests

### Unit tests

```bash
# Protocol-level tests (fast, no Kafka needed)
yarn jest --testPathPattern='src/.*\.spec\.js$'
```

### Lint

```bash
yarn lint
```

### Type checks

```bash
yarn test:types
```

### Integration tests (requires Docker)

```bash
# Start Kafka 2.4
docker compose -f docker-compose.2_4.yml up -d

# Run integration tests
yarn jest --testPathPattern='src/.*/__tests__/.*\.spec\.js$' --forceExit

# Stop Kafka when done
docker compose -f docker-compose.2_4.yml down
```

Other Kafka versions available:
- `docker-compose.2_2.yml` — Kafka 2.2
- `docker-compose.2_3.yml` — Kafka 2.3
- `docker-compose.2_4_oauthbearer.yml` — Kafka 2.4 + OAuth

## Project structure

```
src/
├── index.js           # Public API surface
├── admin/             # Topic/partition/ACL management
├── broker/            # Broker connection + request dispatch
├── cluster/           # Cluster discovery + metadata
├── consumer/          # Consumer groups, fetch manager, offset management
│   └── assigners/     # Partition assignment strategies
├── producer/          # Message production, batching, compression
│   └── partitioners/  # Default, Java-compatible, murmur2
├── protocol/          # Kafka wire protocol encoding/decoding
│   ├── requests/      # Request builders
│   ├── message/       # Message format v0/v1
│   ├── messageSet/    # Message set encoding
│   ├── recordBatch/   # Record batch v2 (Kafka 0.11+)
│   └── sasl/          # SASL authentication
├── network/           # TCP connection pool, request queue
├── retry/             # Exponential backoff
├── loggers/           # Pluggable logging
├── instrumentation/   # Event emitters for metrics
└── utils/             # Shared utilities
```

## Pull request process

1. **Open an issue first** unless it's a trivial fix
2. **Write tests** — all PRs need passing tests
3. **Run lint + types** — `yarn lint && yarn test:types`
4. **Keep it focused** — one concern per PR
5. **Update docs** if you change the public API
6. **Be patient** — this is volunteer-maintained

## Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add KRaft support for Kafka 3.3+
fix: prevent consumer crash on rebalance timeout
perf: optimize metadata refresh path
docs: update migration guide for v3
chore: update dev dependencies
```

## Code style

- Prettier for formatting (`yarn format`)
- ESLint for linting (`yarn lint`)
- Existing patterns are law — match what's there
- No `console.log` — use the logger (`this.logger.debug(...)`)

## Questions?

[Open a discussion](https://github.com/ousiaresearch/charon/discussions) or
[file an issue](https://github.com/ousiaresearch/charon/issues/new).
