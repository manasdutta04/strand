/**
 * Strand Gig Worker Seed Demo
 * Creates a demo worker persona (Ravi) with simulated earnings across Indian platforms
 * Shows how the 6-component scoring system calculates reputation score
 * Displays credit eligibility and borrowing capacity
 */

console.log("\n═══════════════════════════════════════════════════════════");
console.log("  Strand Gig Worker Seed Demo - Hackathon Edition");
console.log("═══════════════════════════════════════════════════════════\n");

// Demo worker persona: Ravi (Indian gig worker)
interface DemoWorker {
  name: string;
  totalDeliveries: number;
  totalEarningsUsdc: number;
  platforms: string[];
  accountAgeDays: number;
}

const demoWorker: DemoWorker = {
  name: "Ravi Kumar",
  totalDeliveries: 1166,
  totalEarningsUsdc: 3850.75,
  platforms: ["zomato", "swiggy", "blinkit", "uber_eats"],
  accountAgeDays: 35
};

// Mock work records for Ravi
const mockRecords = [
  {
    platform: "zomato",
    earnedUsdc: 1245.5,
    deliveries: 312,
    onTimeDeliveries: 305,
    ratingSum: 47, // ~95% 5-star
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    platform: "swiggy",
    earnedUsdc: 1103.25,
    deliveries: 298,
    onTimeDeliveries: 291,
    ratingSum: 46, // ~94% 5-star
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    platform: "blinkit",
    earnedUsdc: 897.0,
    deliveries: 356,
    onTimeDeliveries: 350,
    ratingSum: 55, // ~96% 5-star
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    platform: "uber_eats",
    earnedUsdc: 605.0,
    deliveries: 200,
    onTimeDeliveries: 196,
    ratingSum: 37, // ~93% 5-star
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

console.log(`📱 Worker Profile`);
console.log(`  Name: ${demoWorker.name}`);
console.log(`  Account Age: ${demoWorker.accountAgeDays} days`);
console.log(`  Status: New to Strand\n`);

console.log(`📊 Demo Work Records (4 platforms):`);
let totalDeliveries = 0;
let totalEarnings = 0;
let totalOnTimeDeliveries = 0;
let totalRatingSum = 0;

mockRecords.forEach((record, idx) => {
  const onTimePercentage = Math.round((record.onTimeDeliveries / record.deliveries) * 100);
  console.log(`  ${idx + 1}. ${record.platform.toUpperCase()}`);
  console.log(`     - Earnings: $${record.earnedUsdc} USD (₹${Math.round(record.earnedUsdc * 83)} INR)`);
  console.log(`     - Deliveries: ${record.deliveries} (${onTimePercentage}% on-time)`);
  console.log(`     - Rating: ${(record.ratingSum / 10).toFixed(1)}/5 (${record.ratingSum}/50 points)\n`);
  totalDeliveries += record.deliveries;
  totalEarnings += record.earnedUsdc;
  totalOnTimeDeliveries += record.onTimeDeliveries;
  totalRatingSum += record.ratingSum;
});

// Calculate score components using exact on-chain formula (integer math)
const scoreComponents = {
  delivery_volume: Math.min(Math.floor((totalDeliveries / 1000) * 200), 200),
  earnings_consistency: Math.min(
    Math.floor((totalOnTimeDeliveries / totalDeliveries) * 100 * 150 / 100),
    150
  ),
  tenure: Math.min(Math.floor((demoWorker.accountAgeDays / 180) * 150), 150),
  rating_points: Math.min(Math.floor(totalRatingSum / 10), 200), // Convert rating sum to points
  cross_platform: Math.min(demoWorker.platforms.length * 30, 150),
  repayment: 0 // No loans yet
};

const totalScore = Object.values(scoreComponents).reduce((a, b) => a + b, 0);

console.log(`🎯 Score Components (6-Factor Model - Integer Math On-Chain):`);
console.log(`  Delivery Volume:         ${scoreComponents.delivery_volume}/200  (${totalDeliveries} deliveries)`);
console.log(`  Earnings Consistency:    ${scoreComponents.earnings_consistency}/150  (${Math.round((totalOnTimeDeliveries/totalDeliveries)*100)}% on-time)`);
console.log(`  Tenure:                  ${scoreComponents.tenure}/150     (${demoWorker.accountAgeDays} days)`);
console.log(`  Rating Points:           ${scoreComponents.rating_points}/200  (${(totalRatingSum/10).toFixed(1)}/5 avg)`);
console.log(`  Cross Platform:          ${scoreComponents.cross_platform}/150  (${demoWorker.platforms.length} platforms)`);
console.log(`  Repayment History:       ${scoreComponents.repayment}/150  (no loans yet)`);
console.log(`  ────────────────────────────────────`);
console.log(`  TOTAL STRAND SCORE:      ${totalScore}/1000\n`);

// Calculate credit eligibility
const MIN_CREDIT_SCORE = 400;
const creditEligible = totalScore >= MIN_CREDIT_SCORE;
const creditLimitUsdc = creditEligible ? (totalScore - MIN_CREDIT_SCORE) * 10 : 0;
const creditLimitInr = Math.round(creditLimitUsdc * 83);
const aprPercent = creditEligible ? (24 - ((totalScore / 1000) * 12)) : 0;

console.log(`💰 Credit Access Status:`);
console.log(`  Eligible for Credit:     ${creditEligible ? "✅ YES" : "❌ NO"}`);
if (creditEligible) {
  console.log(`  Credit Limit:            $${creditLimitUsdc.toLocaleString()} USD`);
  console.log(`  In Indian Rupees:        ₹${creditLimitInr.toLocaleString()} INR`);
  console.log(`  Interest Rate:           ${aprPercent.toFixed(1)}% APR\n`);

  console.log(`📋 Use Cases (What Ravi Can Borrow For):`);
  if (creditLimitUsdc >= 600) {
    console.log(`  • Bike upgrade/maintenance: ₹30,000-50,000`);
  }
  if (creditLimitUsdc >= 300) {
    console.log(`  • Phone upgrade: ₹15,000-25,000`);
  }
  if (creditLimitUsdc >= 120) {
    console.log(`  • Emergency funds: ₹10,000-50,000`);
  }
  console.log();
} else {
  const pointsNeeded = MIN_CREDIT_SCORE - totalScore;
  console.log(`  Need ${pointsNeeded} more points to unlock credit\n`);
}

// Demo transaction sequence
console.log(`📋 Demo Sequence (What Happens On-Chain):\n`);
console.log(`  1️⃣  Worker registers with 0.1 SOL stake (~$15 USD)`);
console.log(`      → PDA: ["profile", worker_pubkey]`);
console.log(`      → 30-day lock period begins\n`);

console.log(`  2️⃣  Worker uploads 4 earnings PDFs to oracle`);
console.log(`      → Oracle (Ollama/OpenAI/Claude/Gemini) extracts earnings`);
console.log(`      → Creates WorkRecord PDAs: ["work", worker_pubkey, record_id]`);
console.log(`      → Links platforms: ["platform", worker_pubkey, platform_name]\n`);

console.log(`  3️⃣  Score auto-computed (permissionless)`);
console.log(`      → read WorkRecords + PlatformLinks`);
console.log(`      → Apply 6-component integer math formula`);
console.log(`      → Store in ScoreState PDA: ["score", worker_pubkey]\n`);

console.log(`  4️⃣  Worker opens credit line (score ≥ ${MIN_CREDIT_SCORE} required)`);
console.log(`      → PDA: ["credit", worker_pubkey]`);
console.log(`      → Credit limit = (${totalScore} - ${MIN_CREDIT_SCORE}) × $10 = $${creditLimitUsdc}\n`);

console.log(`  5️⃣  Worker borrows $500 (₹41,500) against score`);
console.log(`      → USDC transferred from ProtocolVault to worker`);
console.log(`      → LoanPosition PDA created: ["loan", worker_pubkey]`);
console.log(`      → Interest rate: ${aprPercent.toFixed(1)}% APR\n`);

console.log(`  6️⃣  Worker repays $500 + $${(500 * (aprPercent / 100 / 12)).toFixed(2)} interest (1 month)`);
console.log(`      → USDC returned to vault`);
console.log(`      → LoanPosition updated`);
console.log(`      → repayment score component increases\n`);

// Integration with Indian platforms
console.log(`🌍 India Gig Economy Context:\n`);
console.log(`  Market Size: 12M+ gig workers on Zomato, Swiggy, Blinkit, Ola, Uber`);
console.log(`  Monthly Earnings: ₹15,000-50,000 per worker`);
console.log(`  Problem: Platform-locked reputation (can't carry to new platform)`);
console.log(`  Problem: No credit access (no collateral, no credit history)`);
console.log(`  Strand Solution:`);
console.log(`    • Portable work history on Solana blockchain`);
console.log(`    • Portable reputation score follows worker across platforms`);
console.log(`    • Access to credit without KYC/collateral/documentation`);
console.log(`    • Rates as low as 12% APR (best scores) vs 36-60% alternatives\n`);

// Ravi's 12-month projection
console.log(`📈 Ravi's 12-Month Projection:\n`);
const projectedDeliveries = totalDeliveries + 1500; // ~141 more deliveries/month
const projectedScore = Math.min(
  Math.floor((Math.min(projectedDeliveries, 1000) / 1000) * 200) + 150 + 150 + 200 + 150 + 50, // Assume improvements
  1000
);
const projectedCreditLimit = (projectedScore - MIN_CREDIT_SCORE) * 10;
const projectedInr = Math.round(projectedCreditLimit * 83);

console.log(`  Current: ${totalScore}/1000 score, ₹${creditLimitInr} credit`);
console.log(`  → After 6 months: ~${Math.min(projectedScore - 100, 900)} score, ₹${Math.round((Math.min(projectedScore - 100, 900) - MIN_CREDIT_SCORE) * 10 * 83)} credit`);
console.log(`  → After 12 months: ~${projectedScore} score, ₹${projectedInr} credit\n`);

// Summary
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Demo Summary for ${demoWorker.name}`);
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Total Earnings:    $${totalEarnings.toLocaleString()} USD`);
console.log(`  In INR:            ₹${Math.round(totalEarnings * 83).toLocaleString()}`);
console.log(`  Total Deliveries:  ${totalDeliveries.toLocaleString()}`);
console.log(`  Platforms Used:    ${demoWorker.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")}`);
console.log(`  Strand Score:      ${totalScore}/1000 ✨`);
if (creditEligible) {
  console.log(`  Credit Limit:      $${creditLimitUsdc.toLocaleString()} USD (₹${creditLimitInr.toLocaleString()} INR)`);
  console.log(`  Interest Rate:     ${aprPercent.toFixed(1)}% APR`);
  console.log(`  Status:            🟢 CREDIT READY`);
} else {
  console.log(`  Credit Status:     🟡 BUILDING SCORE (Need ${MIN_CREDIT_SCORE - totalScore} more points)`);
}
console.log(`═══════════════════════════════════════════════════════════\n`);

console.log(`✅ Demo Complete!\n`);
console.log(`This is what Strand enables for India's 12M gig workers:`);
console.log(`  ✓ Portable work history (follows workers across platforms)`);
console.log(`  ✓ Transparent reputation score (6 components, no black box)`);
console.log(`  ✓ Access to credit (without KYC/collateral)\n`);

console.log(`🚀 Next Steps for Full Deployment:\n`);
console.log(`   1. Run: anchor build && anchor deploy --provider.cluster devnet`);
console.log(`   2. Update program IDs in oracle/.env and app/.env.local`);
console.log(`   3. Initialize ProtocolVault on devnet`);
console.log(`   4. Fund vault with 10,000 USDC`);
console.log(`   5. Start oracle: npm run dev:oracle`);
console.log(`   6. Start app: npm run dev:app`);
console.log(`   7. Upload real earnings PDFs and test full flow\n`);

console.log(`📱 Key Features Ready for Demo:\n`);
console.log(`   • Worker registration with SOL stake`);
console.log(`   • Multi-platform earnings submission (4 providers)`);
console.log(`   • Automatic reputation scoring (6 components)`);
console.log(`   • Credit line management and borrowing`);
console.log(`   • Interest calculation (12-24% APR based on score)`);
console.log(`   • INR/USD dual currency display for India market\n`);
