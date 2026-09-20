import test from "node:test";
import assert from "node:assert/strict";
import { SealedCashClient, SealedCashError, SealedCashValidationError } from "../dist/index.js";

const address = "0x1111111111111111111111111111111111111111";
const uuid = "00000000-0000-4000-8000-000000000001";

test("creates a validated privacy preparation request", async () => {
  let call;
  const client = new SealedCashClient({
    baseUrl: "http://localhost:3000/api/",
    fetch: async (url, init) => {
      call = { url, init };
      return new Response(JSON.stringify({ id: uuid, status: "draft" }), { status: 201 });
    }
  });
  await client.createPrivacyPreparation({ inputToken: address, inputAmount: "1000", idempotencyKey: uuid });
  assert.equal(call.url, "http://localhost:3000/api/privacy/deposits");
  assert.equal(call.init.method, "POST");
  assert.deepEqual(JSON.parse(call.init.body), { inputToken: address, inputAmount: "1000", idempotencyKey: uuid });
});

test("rejects malformed route input before network access", async () => {
  const client = new SealedCashClient({ baseUrl: "http://localhost:3000/api", fetch: async () => { throw new Error("network"); } });
  assert.throws(() => client.createPrivateRoute({
    inputToken: address, inputAmount: "0", outputToken: address, minimumOutputAmount: "1",
    maximumTotalFeeBps: 10, destinationCommitment: `0x${"00".repeat(32)}`, expiresAt: new Date().toISOString()
  }), SealedCashValidationError);
});

test("turns API errors into typed errors", async () => {
  const client = new SealedCashClient({
    baseUrl: "http://localhost:3000/api",
    fetch: async () => new Response(JSON.stringify({ error: "Wallet authentication required" }), { status: 401 })
  });
  await assert.rejects(() => client.getPrivacyBalance(), (error) => {
    assert.ok(error instanceof SealedCashError);
    assert.equal(error.status, 401);
    return true;
  });
});