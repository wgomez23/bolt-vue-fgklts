<template>
  <div class="print-page bg-white text-black min-h-screen">
    <!-- PDF Header -->
    <header class="print-header border-b-2 border-gray-300 pb-4 mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">NATpaper</h1>
          <p class="text-sm text-gray-600">natgmi.com</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          <p>Generated: {{ generatedDate }}</p>
        </div>
      </div>
    </header>

    <!-- Table of Contents -->
    <nav id="toc" class="mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h2 class="text-2xl font-bold mb-4 text-gray-900">Table of Contents</h2>
      <ol class="grid grid-cols-2 gap-2 text-sm">
        <li v-for="(section, index) in tocSections" :key="section.id">
          <a
            :href="'#print-' + section.id"
            class="text-blue-600 hover:underline"
          >
            {{ index + 1 }}. {{ section.title }}
          </a>
        </li>
      </ol>
    </nav>

    <!-- Section 1: Introduction -->
    <section id="print-intro" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2">
        How Much Is Bitcoin's Security Worth?
      </h2>
      <p class="text-lg text-gray-700 leading-relaxed">
        Bitcoin's store-of-value narrative is the very thing undermining its security budget. Why Bitcoin is NAT prepared.
      </p>
    </section>

    <!-- Section 2: Bitcoin is NAT Certain (Preface - EXPANDED) -->
    <section id="print-preface" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        Bitcoin is NAT Certain
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Introduction</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          Bitcoin, at its core, is not merely a technological artifact or a digital currency; it is a profound cultural and philosophical construct that challenges humanity's longstanding conceptions of value, trust, and power. Born from the ashes of the 2008 global financial crisis, Bitcoin emerged as Satoshi Nakamoto's audacious response to centralized fiat systems, encoded in a pseudonymous whitepaper that blended cryptography with a vision of decentralized sovereignty.
        </p>
        <p>
          Since then Bitcoin's interpretive value has taken many forms, shaped by collective narratives, power dynamics, and evolving societal needs. It is less a fixed "thing" than a mirror reflecting our anxieties about authority and freedom. Value in Bitcoin does not derive solely from utility or scarcity (though these are foundational); it arises from how we imbue it with meaning. However, the underlying unifier must be identified as Bitcoin's ability to consume energy to maintain network security. This energetic commitment is the bedrock upon which all interpretations of Bitcoin's value rest.
        </p>
        <p>
          To effectively track the status of energy consumption in relation to the preservation of network security, new metrics need to be utilized that provide a dynamic lens to assess whether Bitcoin's energetic foundation remains robust against evolving threats, ensuring that its decentralized sovereignty and interpretive value can endure as societal needs and power dynamics continue to shift.
        </p>
        <p>
          <strong>The Bitcoin Security Intensity (BSI)</strong> is a critical metric that quantifies the proportion of Bitcoin's market capitalization actively defended by miner revenue, calculated as the annualized miner revenue (block subsidies plus fees) divided by the market cap.
        </p>
        
        <!-- BSI Equation -->
        <div class="my-6 p-4 bg-gray-100 rounded-lg text-center">
          <div class="font-mono text-lg">
            <strong>BSI</strong> = Miner Revenue (annualized) / Market Cap
          </div>
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-8">Energy Security Ratio for Proof-of-Work Systems (ESR)</h4>
        <p>
          Bitcoin's proof-of-work consensus relies on significant energy consumption to secure its network against 51% attacks, where an adversary could control the majority of the hash rate. To assess this vulnerability, we use the Energy Security Ratio (ESR), defined as Bitcoin's energy consumption divided by the global electricity surplus. This surplus represents the energy pool available for potential attacks, assuming equivalent mining efficiency.
        </p>
        <p>Using 2024 data as a benchmark:</p>
        <ul class="list-disc pl-6 space-y-1">
          <li><strong>30,856 TWh</strong>: Global electricity generation</li>
          <li><strong>27,000 TWh</strong>: 2023 Global electricity consumption</li>
          <li><strong>3,856 TWh</strong>: Global electricity surplus</li>
          <li><strong>186 TWh</strong>: Bitcoin's annualized energy footprint</li>
        </ul>

        <!-- ESR Equation -->
        <div class="my-6 p-4 bg-gray-100 rounded-lg text-center">
          <div class="font-mono text-lg">
            <strong>ESR</strong> = Bitcoin Energy Consumption / Global Electricity Surplus
          </div>
          <p class="mt-2 text-sm">For 2024: ESR ≈ 186 / 3,856 ≈ 0.048 (4.8%)</p>
        </div>

        <p>
          The <strong>Attack Opportunity Index (AOI)</strong>, defined as 1 - ESR ≈ 0.952 (95.2%), indicates that 95.2% of the surplus could theoretically be redirected to attack the network. To enhance security, Bitcoin's energy use must exceed 50% of the surplus (>1,928 TWh), making attacks infeasible by dominating available resources.
        </p>

        <!-- ESR vs AOI Pie Chart -->
        <div class="my-6 h-56 border border-gray-200 rounded-lg overflow-hidden chart-container">
          <EsrAoiPieChart :print-mode="true" />
        </div>

        <!-- ESR Benchmark Table -->
        <div class="my-6 overflow-x-auto">
          <table class="min-w-full text-sm border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-3 py-2 border-b text-left">Metric</th>
                <th class="px-3 py-2 border-b text-left">Description</th>
                <th class="px-3 py-2 border-b text-left">2024 Benchmark</th>
                <th class="px-3 py-2 border-b text-left">Target</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in esrBenchmarkTable" :key="row.metric" class="odd:bg-white even:bg-gray-50">
                <td class="px-3 py-2 border-b font-medium">{{ row.metric }}</td>
                <td class="px-3 py-2 border-b">{{ row.description }}</td>
                <td class="px-3 py-2 border-b">{{ row.benchmark }}</td>
                <td class="px-3 py-2 border-b">{{ row.target }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-8">Why the Existing Economic Model Fails</h4>
        <p>
          The existing economic model of Bitcoin, centered on miner revenue from block subsidies and transaction fees, is structurally inadequate to drive the Energy Security Ratio (ESR) to a level where the Attack Opportunity Index (AOI) falls below 50%, thereby ensuring absolute security against 51% attacks.
        </p>
        <p>
          The BSI has dropped to 0.88% in 2025, a significant decline from historical levels (e.g., 3.9% in 2014). This metric reflects the proportion of Bitcoin's valuation actively defended by miners. The current block subsidy of 3.125 BTC, post the 2024 halving, combined with stagnant fee growth, has eroded miner revenue.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-8">Who Will Foot the Bill for Security?</h4>
        <p>
          Without sustainable monetary incentives in Bitcoin's security model, nation-states may become the most likely actors to sustain it. The United States, already has a vested interest in maintaining Bitcoin's security to support a dollar-centric financial reset and can absorb costs by treating Bitcoin mining as a strategic investment.
        </p>
        <p>
          In this scenario, the United States will likely prioritize security to protect their BTC holdings and dollar stability, driving energy consumption toward dominance of the global surplus. This could stabilize the Energy Security Ratio (ESR), reducing the Attack Opportunity Index (AOI) below 50%, but <strong>at the cost of losing Bitcoin's decentralized ethos.</strong>
        </p>

        <!-- Bitcoin Timeline -->
        <div class="my-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 text-center">Bitcoin Timeline</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <img src="/src/assets/ponzi.png" alt="Bitcoin centralized by nation states" class="w-full rounded-lg border border-gray-300" />
              <p class="text-sm text-gray-600 mt-2 italic">Bitcoin centralized by nation states</p>
            </div>
            <div class="text-center">
              <img src="/src/assets/subsidy.png" alt="Bitcoin decentralized" class="w-full rounded-lg border border-gray-300" />
              <p class="text-sm text-gray-600 mt-2 italic">Bitcoin decentralized</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Key Problems -->
    <section id="print-problems" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        Is Bitcoin NAT Worth Securing?
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">The Problem</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          The Bitcoin network secures its decentralized ledger through proof-of-work mining, incentivized primarily by block subsidies that halve approximately every four years or 210,000 blocks. As these subsidies diminish, the network's long-term security increasingly relies on transaction fees, which historical data indicates constitute a negligible and volatile portion of miner revenue, often less than 5% of total rewards over the past three years.
        </p>

        <!-- Supply & Subsidy Chart -->
        <div class="my-6 h-72 border border-gray-200 rounded-lg overflow-hidden chart-container">
          <SupplySubsidyChart :print-mode="true" />
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Broken Fee Model (Store of Value vs Digital Cash)</h4>
        <p>
          Bitcoin's growing adoption as a store of value, rather than a peer-to-peer electronic cash system as originally envisioned, exacerbates the security budget issue by suppressing transaction fee revenue, which is critical to sustaining miner incentives as block subsidies halve every four years.
        </p>

        <!-- Miner Revenue Chart -->
        <div class="my-6 h-56 border border-gray-200 rounded-lg overflow-hidden chart-container">
          <MinerRevenueChart :print-mode="true" />
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Miner Revenue Declining Implies Greater Security Risks</h4>
        <p>
          Declining miner revenue in Bitcoin, driven by the programmed halving of block subsidies every four years and insufficient growth in transaction fees to offset the shortfall, undermines the network's incentive structure, leading to a reduced cost to attack as profit-driven miners scale back operations or exit the ecosystem.
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>51% Attacks</strong>: With a lower overall hash rate, it becomes cheaper for a malicious actor to amass more than half of the network's mining power.</li>
          <li><strong>Increased Centralization</strong>: Diminished revenues may force smaller miners out, concentrating hash power among a few large entities.</li>
          <li><strong>Chain Reorganizations</strong>: A weaker hash rate slows block propagation and increases the likelihood of competing chains.</li>
          <li><strong>Bribery and Coercion Vulnerabilities</strong>: Underpaid miners become more susceptible to external incentives.</li>
        </ul>

        <!-- Fee Share Chart -->
        <div class="my-6 h-56 border border-gray-200 rounded-lg overflow-hidden chart-container">
          <FeeShareChart :print-mode="true" />
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Why This Problem Cannot Be Ignored</h4>
        <p>
          As Bitcoin integrates more deeply into the traditional financial system, evidenced by the proliferation of spot ETFs, institutional custody solutions, and regulatory frameworks that treat it as a legitimate asset class, the security budget problem becomes increasingly critical to address.
        </p>
      </div>
    </section>

    <!-- Section 4: NAT Solution -->
    <section id="print-solutions" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        NAT a Problem Anymore
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">The Solution</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          Introducing the Non-Arbitrary Token (NAT), a meta-protocol-derived digital commodity produced natively from Bitcoin's block data patterns, as a <strong>complementary subsidy</strong> token to bolster miner incentives without altering Bitcoin's core infrastructure, OP codes, or consensus rules.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Pioneers Began Questioning The Sustainability</h4>
        <p>
          The Bitcoin security budget concern is not a contrived narrative engineered to support the value thesis of innovations like NAT; rather, it is a genuine, long-standing debate that has preoccupied the Bitcoin community for well over a decade.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Additional Network Subsidy (NEW)</h4>
        <p>
          By providing a perpetual, inflationary yet difficulty-adjusted subsidy that increases overall miner profitability, encouraging greater participation and investment in hash rate without altering any of the core design principles or economic foundations to Bitcoin itself.
        </p>

        <!-- NAT Comparison Table -->
        <div class="my-6 overflow-x-auto">
          <table class="min-w-full text-sm border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-3 py-2 border-b text-left">$NAT Market Cap</th>
                <th class="px-3 py-2 border-b text-left">Additional USD/Block</th>
                <th class="px-3 py-2 border-b text-left">vs BTC Fees (~$3,390)</th>
                <th class="px-3 py-2 border-b text-left">vs BTC Subsidy (~$353,125)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in natComparisonTable" :key="row.marketCap" class="odd:bg-white even:bg-gray-50">
                <td class="px-3 py-2 border-b font-medium">{{ row.marketCap }}</td>
                <td class="px-3 py-2 border-b">{{ row.additionalUsd }}</td>
                <td class="px-3 py-2 border-b">{{ row.feeComparison }}</td>
                <td class="px-3 py-2 border-b">{{ row.subsidyComparison }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Section 5: How It Works -->
    <section id="print-fallacies-duplicate" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        What the NAT?
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">How it Works</h3>
      
      <div class="flex gap-6">
        <!-- Left column: Text content -->
        <div class="flex-1 prose prose-lg max-w-none text-gray-700 space-y-4">
          <p>
            Using the Digital Matter Theory (DMT) framework, $NAT issues rewards to miners that adjust with Bitcoin's difficulty. Emissions are tied to the Bits field, which encodes difficulty. As hash power increases, difficulty rises, Bits falls, and $NAT issuance declines.
          </p>

          <h4 class="text-xl font-semibold text-gray-900 mt-6">Meta-protocols On Bitcoin</h4>
        <p>
          Meta-protocols in the context of Bitcoin are secondary layers or frameworks built on top of the Bitcoin blockchain that leverage its existing data structures, such as block headers and transaction outputs, to create new functionalities, assets, or incentive mechanisms without altering Bitcoin's core code.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Ordinals</h4>
        <p>
          The Ordinals Protocol, built on Bitcoin, assigns unique identities to individual satoshis by tracking their mining order, using SegWit and Taproot to embed data like text or images as inscriptions.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">TAP Protocol</h4>
        <p>
          The TAP Protocol enhances Bitcoin's Ordinals by providing a flexible framework for complex token issuance models, such as the Digital Matter Theory based Non-Arbitrary Tokens (NATs).
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">DMT/NAT</h4>
        <p>
          The Digital Matter Theory (DMT) protocol creates non-arbitrary tokens by treating Bitcoin's blockchain data as a thermodynamically secured substrate for deriving digital commodities.
        </p>
        </div>
        <!-- Right column: Lego blocks stack -->
        <div class="w-48 flex-shrink-0">
          <div class="flex flex-col space-y-2">
            <!-- NAT (top) -->
            <div class="h-16 rounded bg-emerald-300 text-black flex items-center justify-center gap-2 shadow-md border-t-4 border-emerald-400">
              <img src="/src/assets/nat1.png" alt="NAT" class="h-6 w-6" />
              <span class="font-semibold text-sm">NAT</span>
            </div>
            <!-- DMT -->
            <div class="h-16 rounded text-white flex items-center justify-center shadow-md border-t-4 border-gray-600 bg-gray-700">
              <span class="font-semibold text-sm">DMT</span>
            </div>
            <!-- TAP Protocol -->
            <div class="h-16 rounded bg-fuchsia-500 text-white flex items-center justify-center gap-2 shadow-md border-t-4 border-fuchsia-400">
              <img src="/src/assets/tap.png" alt="TAP" class="h-6 w-6" />
              <span class="font-semibold text-sm">TAP Protocol</span>
            </div>
            <!-- Ordinals -->
            <div class="h-16 rounded bg-gray-800 text-white flex items-center justify-center gap-2 shadow-md border-t-4 border-gray-700">
              <img src="/src/assets/ordinals.png" alt="Ordinals" class="h-6 w-6" />
              <span class="font-semibold text-sm">Ordinals</span>
            </div>
            <!-- Bitcoin (bottom) -->
            <div class="h-16 rounded bg-orange-500 text-white flex items-center justify-center gap-2 shadow-md border-t-4 border-orange-400">
              <img src="/src/assets/bitcoin.png" alt="Bitcoin" class="h-6 w-6" />
              <span class="font-semibold text-sm">Bitcoin</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: Bits Field -->
    <section id="print-new-section" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        Bitcoin is NAT Source Data
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Bits Field</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          The token's value proposition ties to Bitcoin's "bits" field in block headers, a compact 32-bit representation of mining difficulty (target hash). Difficulty adjusts every 2016 blocks based on hashpower. As hashpower rises, the bits value decreases (inverse relationship), reflecting network strength.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Impact on Difficulty</h4>
        <p>
          As network hash power increases, the target decreases (more leading zeros), which reduces s (smaller exponent) and c (coefficient), leading to a numerically smaller Bits value.
        </p>

        <!-- Bits vs Hashrate Chart -->
        <div class="my-6 h-80 border border-gray-200 rounded-lg overflow-hidden chart-container">
          <BitsVsHashrateChart :print-mode="true" />
        </div>

        <div class="my-4 p-4 bg-gray-100 rounded-lg text-center font-mono">
          Hash Power ↑ → Difficulty ↑ → Target ↓ → Bits Numerical Value ↓
        </div>
        <div class="my-4 p-4 bg-gray-100 rounded-lg text-center font-mono">
          $NAT = bits = s × 2²⁴ + c
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Invoking Bits Value Using DMT & TAP Protocol</h4>
        <div class="space-y-4">
          <div>
            <p class="font-semibold">1. Pattern Registration - Ordinals</p>
            <p>Pattern: <code class="bg-gray-200 px-1 rounded">dmt.11.element</code></p>
          </div>
          <div>
            <p class="font-semibold">2. Protocol Syntax - TAP</p>
            <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{
  "p": "tap",
  "op": "dmt-deploy",
  "elem": "63b5bd2e28c043c4812981718e65d202ab8f68c0f6a1834d9ebea49d8fac7e62i0",
  "tick": "nat",
  "dt": "n"
}</pre>
          </div>
          <div>
            <p class="font-semibold">3. Execution Miner Redirect</p>
            <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{
  "p": "tap",
  "op": "reward",
  "type": "miner",
  "block": "885588"
}</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: First Principles -->
    <section id="print-fallacies" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        NAT Another Aircoin
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">First Principles</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          For NAT to fulfill its mission as a complementary subsidy to the Bitcoin mining network, it must overcome skepticism about its core fundamental value proposition.
        </p>

        <!-- Zero Value Image -->
        <div class="my-6">
          <img src="/src/assets/zerovalue.png" alt="Zero Value" class="w-full max-w-lg mx-auto rounded-lg border border-gray-300" />
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Principle 1: Belief Creates Value</h4>
        <ul class="list-disc pl-6 space-y-1">
          <li>Tokens like BTC gain value through collective belief in their utility.</li>
          <li>For $NAT: If people believe it solves Bitcoin's subsidy problem, they buy/hold it.</li>
          <li>Result: Each $NAT mined becomes worth more in dollars, boosting miners' total rewards.</li>
        </ul>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Principle 2: Incentives Align Miners and Holders</h4>
        <ul class="list-disc pl-6 space-y-1">
          <li>Miners seek profit maximization. If $NAT's value rises, mining becomes more lucrative.</li>
          <li>Holders benefit: Higher hashpower increases Bitcoin's security.</li>
          <li>Feedback Loop: More belief → higher $NAT price → higher miner rewards → more hashpower.</li>
        </ul>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Principle 3: Non-Arbitrary Scarcity and Utility</h4>
        <ul class="list-disc pl-6 space-y-1">
          <li>$NAT's utility is anchoring to Bitcoin's difficulty (bits field), making it a proxy for network health.</li>
          <li>Inverse Property: As difficulty rises (bits decreases), $NAT's narrative strengthens.</li>
        </ul>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Principle 4: Thermodynamic Alignment</h4>
        <ul class="list-disc pl-6 space-y-1">
          <li>Bitcoin mining converts physical energy into digital security (hashpower).</li>
          <li>$NAT, as a Bitcoin-native asset, inherits this thermodynamic grounding.</li>
        </ul>
      </div>
    </section>

    <!-- Section 8: Distribution -->
    <section id="print-NAT Another Premine" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        NAT Another Premine
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Distribution Lore</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          The $NAT token was first distributed through a fair mint system. This meant anyone could participate on a first-come, first-served (FCFS) basis, no pre-mines, no reserved allocations, keeping the launch open and decentralized in line with Bitcoin's ethos.
        </p>

        <!-- Premine Image -->
        <div class="my-6">
          <img src="/src/assets/premine.png" alt="Premine" class="w-full max-w-lg mx-auto rounded-lg border border-gray-300" />
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Launch Details</h4>
        <ul class="list-disc pl-6 space-y-1">
          <li><strong>Date:</strong> November 20, 2023</li>
          <li><strong>Method:</strong> Anyone could mint $NAT by inscribing JSON data into a Bitcoin transaction.</li>
          <li><strong>Starting point:</strong> Block 817,709</li>
          <li><strong>Participation:</strong> Over 20,000 people joined, minting all available blocks in 7 days.</li>
        </ul>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Post Blockout Distribution</h4>
        <ul class="list-disc pl-6 space-y-1">
          <li>The FCFS minting method continued until block 885,588.</li>
          <li>After that, the system switched to a miner-redirect model.</li>
          <li>Bitcoin miners automatically receive newly generated $NAT with each block.</li>
        </ul>
      </div>
    </section>

    <!-- Section 9: Bitcoin Ethos Alignment -->
    <section id="print-ecosystem" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        NATstoppable Force
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Aligning With Bitcoin Ethos</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          Aligning $NAT with Bitcoin's ethos requires open-source, peer-to-peer indexing and validation to preserve the value of both systems.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">The Three Pillars of Bitcoin's Ethos</h4>
        
        <div class="mt-4">
          <p class="font-bold text-lg">Decentralization</p>
          <p><strong>Bitcoin:</strong> No single entity controls the network, enabling trustless, peer-to-peer interactions.</p>
          <p><strong>$NAT:</strong> The TAP Protocol's reliance on Bitcoin's Ordinals Protocol ensures that asset creation and management occur without a central authority.</p>
        </div>

        <div class="mt-4">
          <p class="font-bold text-lg">Censorship Resistance</p>
          <p><strong>Bitcoin:</strong> Transactions cannot be stopped or altered, protecting financial sovereignty.</p>
          <p><strong>$NAT:</strong> By leveraging Bitcoin's proof-of-work security, TAP ensures that NAT transactions are resistant to censorship.</p>
        </div>

        <div class="mt-4">
          <p class="font-bold text-lg">Transparency</p>
          <p><strong>Bitcoin:</strong> An open-source, auditable blockchain ensures verifiable integrity.</p>
          <p><strong>$NAT:</strong> TAP's use of Bitcoin's immutable blockchain as a data root provides full transparency in asset issuance.</p>
        </div>
      </div>
    </section>

    <!-- Section 10: DMT Interchain Applications (ALL TABS EXPANDED) -->
    <section id="print-dmt-interchain" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        NAT The End Of The Story
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Digital Matter Theory Interchain Application</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          To convert the Digital Matter Theory (DMT) framework into an accessible client for developers deploying smart contracts or building apps on other chains like Solana and Ethereum, we can develop a cross-chain SDK or library that abstracts DMT logic while leveraging oracles for secure Bitcoin data access.
        </p>

        <!-- Orbiting Crypto Logos -->
        <div class="my-8 flex justify-center">
          <div class="relative w-64 h-64">
            <img src="/src/assets/bitcoin.png" alt="Bitcoin" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 object-contain" />
            <img src="/src/assets/ethereum.png" alt="Ethereum" class="absolute w-12 h-12 object-contain" style="top: 0; left: 50%; transform: translateX(-50%);" />
            <img src="/src/assets/solana.png" alt="Solana" class="absolute w-12 h-12 object-contain" style="top: 25%; right: 0;" />
            <img src="/src/assets/bnb.png" alt="BNB" class="absolute w-12 h-12 object-contain" style="bottom: 25%; right: 0;" />
            <img src="/src/assets/Cardano.png" alt="Cardano" class="absolute w-12 h-12 object-contain" style="bottom: 0; left: 50%; transform: translateX(-50%);" />
            <img src="/src/assets/tron.png" alt="Tron" class="absolute w-12 h-12 object-contain" style="bottom: 25%; left: 0;" />
            <img src="/src/assets/dogecoin.png" alt="Dogecoin" class="absolute w-12 h-12 object-contain" style="top: 25%; left: 0;" />
          </div>
        </div>
        <p class="text-center text-sm text-gray-500 italic">A successful NAT = precursor to a non-arbitrary crypto era</p>

        <!-- Expanded Tabs Content -->
        <div v-for="(tab, index) in dmtInterchainTabs" :key="tab.title" class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 class="text-xl font-bold text-gray-900 mb-3">
            {{ index + 1 }}. {{ tab.title }}
          </h4>
          <div class="text-gray-700 whitespace-pre-line">{{ tab.content }}</div>
        </div>
      </div>
    </section>

    <!-- Section 11: NATwork Effect -->
    <section id="print-natwork-effect" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        NATwork Effect
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Symbiotic Relationship</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          The proliferation of the DMT ecosystem must be tightly aligned with $NAT's growth to ensure a symbiotic relationship that enhances both the ecosystem's adoption and $NAT's economic viability.
        </p>

        <!-- NATwork Flywheel -->
        <div class="my-8 flex justify-center">
          <div class="relative w-full max-w-lg h-64">
            <!-- Bitcoin Gear (top-left) -->
            <div class="absolute left-[5%] top-0">
              <div class="relative w-28 h-28">
                <img src="/src/assets/gear1.png" alt="Bitcoin gear" class="w-full h-full object-contain" />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">₿</div>
                </div>
              </div>
            </div>
            <!-- Dollar Gear (top-right) -->
            <div class="absolute right-[5%] top-0">
              <div class="relative w-28 h-28">
                <img src="/src/assets/gear2.png" alt="Dollar gear" class="w-full h-full object-contain" />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">$</div>
                </div>
              </div>
              <p class="text-xs text-center text-gray-600 mt-1">Web3 App</p>
            </div>
            <!-- NAT Logo (bottom-center) -->
            <div class="absolute left-1/2 -translate-x-1/2 bottom-0">
              <img src="/src/assets/nat1.png" alt="NAT" class="w-24 h-24 object-contain" />
            </div>
            <!-- Arrow: Bitcoin -> Dollar (horizontal) -->
            <svg class="absolute top-10 left-[30%] w-[40%] h-8" viewBox="0 0 100 20">
              <defs>
                <marker id="arrowhead1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                </marker>
              </defs>
              <line x1="0" y1="10" x2="90" y2="10" stroke="#10B981" stroke-width="2" marker-end="url(#arrowhead1)" />
            </svg>
            <!-- Arrow: Dollar -> NAT (diagonal from Dollar down to NAT) -->
            <svg class="absolute top-[30%] left-[48%] w-[35%] h-24" viewBox="0 0 100 80">
              <defs>
                <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                </marker>
              </defs>
              <line x1="85" y1="10" x2="10" y2="70" stroke="#10B981" stroke-width="2" marker-end="url(#arrowhead2)" />
            </svg>
          </div>
        </div>
        <p class="text-center text-sm text-gray-500 italic">NATwork Flywheel: Bitcoin → $NAT → Web3 Applications</p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Multi-chain Integration: Bitcoin's Export Economy</h4>
        <p>
          Assume a theoretical mature non-arbitrary token market achieves parity with the existing arbitrary digital asset market's on-chain volume. This parallel market embeds fees (0.05%, 0.1%, 0.25%) on transactions, with proceeds exported to the Bitcoin mining network.
        </p>

        <!-- Tariff Export Table -->
        <div class="my-6 overflow-x-auto">
          <table class="min-w-full text-sm border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-3 py-2 border-b text-left">Year</th>
                <th class="px-3 py-2 border-b text-left">Non-Bitcoin Volume</th>
                <th class="px-3 py-2 border-b text-left">Tariff @ 0.05%</th>
                <th class="px-3 py-2 border-b text-left">Tariff @ 0.1%</th>
                <th class="px-3 py-2 border-b text-left">Tariff @ 0.25%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tariffExportTable" :key="row.year" class="odd:bg-white even:bg-gray-50">
                <td class="px-3 py-2 border-b">{{ row.year }}</td>
                <td class="px-3 py-2 border-b">{{ row.volume }}</td>
                <td class="px-3 py-2 border-b">{{ row.tariff005 }}</td>
                <td class="px-3 py-2 border-b">{{ row.tariff01 }}</td>
                <td class="px-3 py-2 border-b">{{ row.tariff025 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">BRC20 vs DMT Comparison</h4>
        <div class="my-6 overflow-x-auto">
          <table class="min-w-full text-sm border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-3 py-2 border-b text-left">Category</th>
                <th class="px-3 py-2 border-b text-left">BRC20</th>
                <th class="px-3 py-2 border-b text-left">DMT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in brc20VsDmtTable" :key="row.category" class="odd:bg-white even:bg-gray-50">
                <td class="px-3 py-2 border-b font-medium">{{ row.category }}</td>
                <td class="px-3 py-2 border-b">{{ row.brc20 }}</td>
                <td class="px-3 py-2 border-b">{{ row.dmt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Section 12: Conclusion -->
    <section id="print-conclusion" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-2 text-gray-900 border-b-2 border-orange-500 pb-2">
        Are you NAT Entertained?
      </h2>
      <h3 class="text-xl font-semibold text-orange-600 mb-4">Conclusion</h3>
      
      <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
        <p>
          Supporting Bitcoin's long-term viability is a challenge we must solve today, as it is critical to onboarding billions into the digital store of wealth.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Untapped Substrate</h4>
        <p>
          The integration of multi-chain mechanisms, exemplified by the $NAT token and Digital Matter Theory (DMT) protocol, represents a transformative step toward addressing Bitcoin's sustainability and security challenges.
        </p>
        <p>
          The Bitcoin Security Intensity (BSI), currently at 0.88% in 2025, underscores the urgent need to bolster miner revenue relative to Bitcoin's growing market cap.
        </p>
        <p>
          To secure Bitcoin's role as the foundation of a global monetary system, we must optimize both BSI and ESR. The target is to elevate BSI above 1% through innovative incentives like $NAT while driving ESR beyond 50%.
        </p>

        <h4 class="text-xl font-semibold text-gray-900 mt-6">Call To Action</h4>
        <p>
          In the shadow of centralized powers that seek to control the flow of value and information, we, the architects and advocates of NAT, draw inspiration from the genesis of Bitcoin. NAT emerges as a steadfast guardian of this legacy, extending Bitcoin's core principles into new frontiers.
        </p>
      </div>
    </section>

    <!-- Section 13: The Oath -->
    <section id="print-oath" class="print-section mb-8">
      <h2 class="text-3xl font-bold mb-4 text-center text-orange-600 border-b-2 border-orange-500 pb-2">
        The Oath of Unity In Preservation Of Bitcoin's Ethos
      </h2>
      
      <div class="prose prose-lg max-w-none text-gray-700">
        <p class="text-lg leading-relaxed">
          Rooted in Satoshi Nakamoto's vision of a decentralized and trustless world, we join with all who share this conviction to advance innovation in harmony with Bitcoin's core principles. With unwavering commitment, we work to strengthen its resilient network and uphold NAT as a unifying beacon. Not to divide, but to realign and empower the true guardians of decentralization. Our purpose is not separation but solidarity, ensuring that Bitcoin's ethos of sovereignty and freedom endures, ethically, inclusively, and for generations to come.
        </p>
      </div>
    </section>

    <!-- Bitcoin-NAT Connection Visual -->
    <section class="print-section mb-8">
      <div class="flex justify-center items-center gap-8 py-8">
        <img src="/src/assets/bitcoin.png" alt="Bitcoin" class="w-24 h-24 object-contain" />
        <div class="flex flex-col items-center">
          <div class="w-32 h-1 bg-gradient-to-r from-orange-500 to-white"></div>
          <p class="text-xs text-gray-500 mt-1">Secured by</p>
        </div>
        <img src="/src/assets/nat1.png" alt="NAT" class="w-24 h-24 object-contain" />
      </div>
    </section>

    <!-- Footer -->
    <footer class="print-footer border-t-2 border-gray-300 pt-4 mt-12 text-center text-sm text-gray-500">
      <p>NATpaper - natgmi.com</p>
      <p class="mt-1">This document was generated from the interactive NATpaper at natgmi.com/natpaper</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  tocSections,
  dmtInterchainTabs,
  natComparisonTable,
  tariffExportTable,
  brc20VsDmtTable,
  esrBenchmarkTable
} from '../data/natpaperContent'
import MinerRevenueChart from '../components/MinerRevenueChart.vue'
import FeeShareChart from '../components/FeeShareChart.vue'
import SupplySubsidyChart from '../components/SupplySubsidyChart.vue'
import BitsVsHashrateChart from '../components/BitsVsHashrateChart.vue'
import EsrAoiPieChart from '../components/EsrAoiPieChart.vue'

const generatedDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

onMounted(() => {
  setTimeout(() => {
    (window as any).pdfReady = true
    console.log('PDF Ready: true')
  }, 1000)
})
</script>

<style scoped>
.print-page {
  max-width: 210mm;
  margin: 0 auto;
  padding: 15mm;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.print-section {
  margin-bottom: 2rem;
}

/* Avoid breaking inside tables, code blocks, and charts */
table, pre, .chart-container {
  break-inside: avoid;
  page-break-inside: avoid;
}

@media print {
  .print-page {
    max-width: none;
    margin: 0;
    padding: 10mm;
  }

  @page {
    size: A4;
    margin: 15mm 12mm;

    @top-center {
      content: "NATpaper - natgmi.com";
      font-size: 9pt;
      color: #666;
    }

    @bottom-center {
      content: counter(page);
      font-size: 9pt;
      color: #666;
    }
  }

  a {
    color: #2563eb !important;
    text-decoration: underline !important;
  }

  table {
    font-size: 8pt;
  }

  h2, h3, h4 {
    break-after: avoid;
  }
}

@media screen {
  .print-page {
    background: white;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
