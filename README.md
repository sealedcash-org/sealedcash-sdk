# SealedCash TypeScript SDK

The official, framework-independent TypeScript client for the SealedCash API.
SealedCash is a non-custodial privacy protocol on Robinhood Chain. This SDK
only prepares and reads wallet-owned API intents; it never holds private keys,
submits transactions, or claims that an unavailable privacy component is ready.

Official organization: [sealedcash-org](https://github.com/sealedcash-org)  
Repository: [sealedcash-sdk](https://github.com/sealedcash-org/sealedcash-sdk)  
Support: [support@sealedcash.com](mailto:support@sealedcash.com)

## Install

```sh
npm install @sealedcash/sdk
```

## Usage

```ts
import { SealedCashClient } from "@sealedcash/sdk";

const client = new SealedCashClient({
  baseUrl: process.env.SEALEDCASH_API_URL ?? "http://localhost:3000/api",
});

const status = await client.getPrivacyStatus();
if (!status.executionAvailable) {
  console.info("Privacy execution is not currently available.");
}

const challenge = await client.createWalletChallenge("0x1111111111111111111111111111111111111111");
// Sign challenge.message in the user's wallet, then submit the signature:
// await client.createWalletSession(challenge.challengeId, signature);
```

The client uses `credentials: "include"` by default so browser sessions can be
used without exposing session cookies to application code. Override `fetch`,
headers, or credentials for a server-side integration.

## Architecture

The SDK is intentionally small: `SealedCashClient` builds HTTP requests,
`validation.ts` rejects malformed addresses, amounts, commitments, and expiry
values before a network call, and the exported interfaces mirror the current
API contract. It has no React dependency and uses the platform Fetch API.

## Local setup and environment

```sh
cp .env.example .env
npm ci
npm run typecheck
npm test
```

| Variable | Required | Local example | Purpose |
| --- | --- | --- | --- |
| `SEALEDCASH_API_URL` | No | `http://localhost:3000/api` | API origin passed to `SealedCashClient` |

The sample environment file contains placeholders for local development only.
The library does not read environment variables automatically.

## Capability and status

This package supports reading protocol readiness and privacy balance, creating
and cancelling wallet-owned privacy preparation intents, wallet challenge and
session calls, and creating, signing, reading, and cancelling private route
intents. It does not claim that proving, relaying, settlement, or execution is
available: callers must check `getPrivacyStatus()` and each response's
`executionAvailable` value. No method moves funds by itself.

## Scope and safety

The API creates unsigned preparation and route intents. A preparation response
does not move funds. Applications must present the returned signing payload to
the wallet and independently verify network, recipient, amount, expiry, and
fees before signing. The SDK does not include a prover, relayer, wallet
adapter, or cryptographic key management.

## Tests and development

```sh
npm ci
npm test
npm run build
```

## License

MIT © SealedCash contributors