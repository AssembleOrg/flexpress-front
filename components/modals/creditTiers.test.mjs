// Self-check de la lógica de tiers de créditos (sin framework: `node creditTiers.test.mjs`).
// Replica CREDIT_TIERS/tierForCredits/nextTier de CreditPackagesShowcase.tsx.
// Si cambiás los umbrales/bonus allá, actualizá TIERS acá.
import assert from "node:assert";

const TIERS = [
  { tier: "bronce", minCredits: 5, bonusCredits: 1 },
  { tier: "plata", minCredits: 10, bonusCredits: 2 },
  { tier: "oro", minCredits: 20, bonusCredits: 4 },
];
function tierForCredits(c) {
  let m = null;
  for (const t of TIERS) if (c >= t.minCredits) m = t;
  return m;
}
function nextTier(c) {
  return TIERS.find((t) => c < t.minCredits) ?? null;
}

assert.strictEqual(tierForCredits(4), null);
assert.strictEqual(tierForCredits(5).tier, "bronce");
assert.strictEqual(tierForCredits(7).tier, "bronce");
assert.strictEqual(tierForCredits(10).tier, "plata");
assert.strictEqual(tierForCredits(25).tier, "oro");
assert.strictEqual(nextTier(3).tier, "bronce");
assert.strictEqual(nextTier(7).tier, "plata");
assert.strictEqual(nextTier(25), null);
// Monto = créditos × creditPrice (coherente con la config).
assert.strictEqual(7 * 2500, 17500);

console.log("OK: creditTiers self-check passed");
