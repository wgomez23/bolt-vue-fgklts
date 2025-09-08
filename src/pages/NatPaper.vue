<template>
  <div class="bg-black text-white min-h-screen">
    <!-- Hero -->
    <section id="intro" class="border-b border-dark-lighter/50 pt-24 md:pt-32">
      <div class="mx-auto max-w-3xl px-4 pb-16 md:pb-24">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          How Much Is Bitcoin's Security Worth?
        </h1>
        <p class="mt-6 text-lg md:text-xl leading-relaxed text-gray-300">
          Bitcoin's store-of-value narrative is the very thing undermining its security budget. Why Bitcoin is NAT prepared.
        </p>
        <div class="mt-8 text-gray-400 text-sm flex items-center gap-3">
          <span>Learn more</span>
          <span aria-hidden>↓</span>
        </div>

        <!-- Inline TOC (responsive) -->
        <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <a href="#problems" class="rounded-md border border-dark-lighter/50 px-3 py-2 text-center text-gray-300 hover:bg-dark-card/50 transition-colors">Key Problems</a>
          <a href="#solutions" class="rounded-md border border-dark-lighter/50 px-3 py-2 text-center text-gray-300 hover:bg-dark-card/50 transition-colors">Solutions</a>
          <a href="#fallacies" class="rounded-md border border-dark-lighter/50 px-3 py-2 text-center text-gray-300 hover:bg-dark-card/50 transition-colors">Fallacies</a>
          <a href="#conclusion" class="rounded-md border border-dark-lighter/50 px-3 py-2 text-center text-gray-300 hover:bg-dark-card/50 transition-colors">Conclusion</a>
        </div>
      </div>
    </section>

    <!-- Live data overview (placeholder cards to mirror layout) -->
    <section v-if="showNatData" class="border-b border-dark-lighter/50" aria-labelledby="live-data">
      <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 id="live-data" class="text-2xl md:text-3xl font-bold">$NAT data</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Card template -->
          <div class="rounded-lg border border-dark-lighter/50 bg-dark-card/30 p-4 md:p-6">
            <div class="text-sm font-medium text-gray-400">Market Cap</div>
            <div class="mt-3 h-40 rounded-md bg-dark-lighter/20 flex items-center justify-center">
              <Motion :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 2, easing: 'ease-out' }">
                <div class="text-4xl md:text-5xl font-extrabold tabular-nums bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{{ capText }}</div>
              </Motion>
            </div>
          </div>
          <div class="rounded-lg border border-dark-lighter/50 bg-dark-card/30 p-4 md:p-6">
            <div class="text-sm font-medium text-gray-400">Holders</div>
            <div class="mt-3 h-40 rounded-md bg-dark-lighter/20 flex items-center justify-center">
              <Motion :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 2, easing: 'ease-out' }">
                <div class="text-4xl md:text-5xl font-extrabold tabular-nums bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{{ holdersText }}</div>
              </Motion>
            </div>
          </div>
          <div class="rounded-lg border border-dark-lighter/50 bg-dark-card/30 p-4 md:p-6">
            <div class="text-sm font-medium text-gray-400">Supply</div>
            <div class="mt-3 h-40 rounded-md bg-dark-lighter/20 flex items-center justify-center">
              <Motion :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 2, easing: 'ease-out' }">
                <div class="text-4xl md:text-5xl font-extrabold tabular-nums bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{{ supplyText }}</div>
              </Motion>
            </div>
          </div>
          <div class="rounded-lg border border-dark-lighter/50 bg-dark-card/30 p-4 md:p-6">
            <div class="text-sm font-medium text-gray-400">Miner Revenue</div>
            <div class="mt-3 h-40 rounded-md bg-dark-lighter/20"></div>
          </div>
          <div class="rounded-lg border border-dark-lighter/50 bg-dark-card/30 p-4 md:p-6">
            <div class="text-sm font-medium text-gray-400">Miner Revenue / Market Cap</div>
            <div class="mt-3 h-40 rounded-md bg-dark-lighter/20"></div>
          </div>
          <div class="rounded-lg border border-dark-lighter/50 bg-dark-card/30 p-4 md:p-6">
            <div class="text-sm font-medium text-gray-400">Block Size</div>
            <div class="mt-3 h-40 rounded-md bg-dark-lighter/20"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Problems -->
    <section id="problems" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold">Is Bitcoin NAT Worth Securing?</h2>
            <h3 class="mt-6 text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">The Problem</h3>
            <p class="mt-3 text-gray-300">
              The Bitcoin network secures its decentralized ledger through proof-of-work mining, incentivized primarily by block subsidies that halve approximately every four years or 210,000 blocks. As these subsidies diminish, the network's long-term security increasingly relies on transaction fees, which historical data indicates constitute a negligible and volatile portion of miner revenue—often less than 5% of total rewards over the past three years. This trajectory risks insufficient incentives for miners, potentially leading to reduced hash rate, centralization, or vulnerability to attacks as Bitcoin rewards approach zero.
            </p>
            <div class="mt-6">
              <SupplySubsidyChart />
            </div>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">

            <!-- Row 1 -->
            <div class="md:border-t border-dark-lighter/50 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-6 items-start">
                <div class="sm:col-span-5">
                  <h4 class="text-xl font-semibold text-white">Broken fee model (Store of Value vs digital cash)</h4>
                  <p class="mt-2 text-gray-300">
                    Bitcoin's shift to a store of value, rather than a peer-to-peer cash system, suppresses transaction fee revenue—critical as block subsidies halve. The "HODL" mentality reduces on-chain transactions, keeping fees too low to sustain security long-term.
                  </p>
                  <!-- Moved chart here below content -->
                  <div class="mt-4 w-full h-40 md:h-56">
                    <MinerRevenueChart />
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2 -->
            <div class="md:border-t border-dark-lighter/50 pt-6 md:pt-8">
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-6 items-start">
                <div class="sm:col-span-5">
                  <h4 class="text-xl font-semibold text-white">Miner revenue falters implies greater security risks</h4>
                  <p class="mt-2 text-gray-300">
                    Declining miner revenue in Bitcoin, driven by the programmed halving of block subsidies every four years and insufficient growth in transaction fees to offset the shortfall, undermines the network's incentive structure, leading to a reduced hash rate as profit-driven miners scale back operations or exit the ecosystem. This erosion of computational power heightens Bitcoin's vulnerability to several security risks, including:
                  </p>
                  <ul class="mt-2 text-gray-300 list-disc pl-6 space-y-2">
                    <li><strong>51% Attacks</strong>: With a lower overall hash rate, it becomes cheaper for a malicious actor or coalition to amass more than half of the network's mining power, enabling them to rewrite transaction history, execute double-spends by reversing confirmed transactions, censor specific addresses or transactions from being included in blocks, or produce empty blocks to halt network activity and disrupt usability.</li>
                    <li><strong>Increased Centralization</strong>: Diminished revenues may force smaller miners out, concentrating hash power among a few large entities or pools, which raises the risk of coordinated attacks, regulatory capture, or single points of failure that could compromise the network's decentralized ethos.</li>
                    <li><strong>Chain Reorganizations and Orphaned Blocks</strong>: A weaker hash rate slows block propagation and increases the likelihood of competing chains, allowing attackers to orphan honest miners' blocks more easily, wasting resources and potentially leading to longer reorganizations that undermine transaction finality.</li>
                    <li><strong>Bribery and Coercion Vulnerabilities</strong>: Underpaid miners become more susceptible to external incentives, such as bribes from adversaries or coercion by governments, to participate in attacks rather than mine honestly, especially if long-term rewards appear unsustainable.</li>
                  </ul>
                  <!-- Chart inserted directly below security risks list -->
                  <div class="mt-4 w-full h-40 md:h-56">
                    <FeeShareChart />
                  </div>
                </div>
                
              </div>
            </div>

            <!-- Row 3 -->
            <div class="md:border-t border-dark-lighter/50 pt-6 md:pt-8">
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-6 items-start">
                <div class="sm:col-span-5">
                  <h4 class="text-xl font-semibold text-white">Why This Problem Cannot Be Ignored</h4>
                  <p class="mt-2 text-gray-300">
                    As Bitcoin integrates more deeply into the traditional financial system—evidenced by the proliferation of spot ETFs, institutional custody solutions, and regulatory frameworks that treat it as a legitimate asset class—the security budget problem becomes increasingly critical to address, as any vulnerability could trigger cascading failures in interconnected markets, eroding investor confidence and inviting regulatory crackdowns. With trillions in value potentially flowing into Bitcoin through these channels, a declining miner revenue stream risks weakening the network's hash power, exposing it to attacks that could compromise transaction integrity and immutability, thereby undermining its appeal as a reliable store of value or settlement layer for global finance.
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Case Study -->
    <section id="" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20 text-center">
        <h2 class="text-3xl md:text-4xl font-bold">Case Study - 51% Attack on Monero</h2>
        <div class="prose prose-invert mt-6 max-w-3xl mx-auto">
          <p class="text-lg">
            "The Qubic experiment successfully proved Incentives Dictate Consensus: Any Proof of Work blockchain can be attacked and controlled by providing superior economic incentives to its miners." - 
            <a href="https://qubic.org/blog-detail/historic-takeover-complete-qubic-miners-now-secure-monero-network" target="_blank" class="text-blue-400 hover:text-blue-300 underline">Qubic</a>
          </p>
          <!-- Inserted image below the quote -->
          <div class="mt-4" ref="attackRef">
            <!-- AttackNetwork51 component will be rendered here -->
          </div>
          <!-- 51% Attack animation (Motion.dev + SVG) -->
          <div class="mt-8">
            <AttackNetwork51 />
          </div>
        </div>
      </div>
    </section>

    <!-- NAT Solution -->
    <section id="solutions" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">NAT a Problem Anymore</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">The Solution</h3>
            <p class="mt-3 text-gray-300">
              Introducing the Non-Arbitrary Token (NAT), a meta-protocol-derived digital commodity produced natively from Bitcoin's block data patterns, as a <strong>complementary subsidy</strong> token to bolster miner incentives without altering Bitcoin's core infrastructure, OP codes, or consensus rules.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Pioneers began questioning the sustainability of Bitcoin's security model.</h3>
                <p class="mt-2 text-gray-300">The Bitcoin security budget concern is not a contrived narrative engineered to support the value thesis of innovations like NAT; rather, it is a genuine, long-standing debate that has preoccupied the Bitcoin community for well over a decade, with early discussions emerging as far back as the network's formative years around 2010-2015, when pioneers began questioning the sustainability of incentives post-subsidy era.</p>
              </article>
              <article>
                <h3 class="text-xl font-semibold text-white">Existing Proposed Solutions</h3>
                <p class="mt-2 text-gray-300">
                  <strong>On-chain scaling enhancements</strong>: Increasing block size limits to accommodate more transactions and foster a robust fee market, reducing block times for higher throughput.
                  <br><br>
                  <strong>Consensus mechanism shifts</strong>: Transitioning from Proof-of-Work to alternatives like Proof-of-Stake or Proof-of-Authority, though these raise centralization and trust concerns that clash with Bitcoin's foundational principles.
                  <br><br>
                  <strong>Monetary policy alterations</strong>: Implementing tail emission to introduce perpetual low-level inflation beyond the 21 million cap for ongoing miner rewards; introducing demurrage fees to tax holdings and redistribute funds to security; or burning dormant coins (e.g., those attributed to Satoshi Nakamoto) to reduce supply and justify new issuance, despite ethical and property rights controversies.
                </p>
              </article>
              <article>
                <h3 class="text-xl font-semibold text-white">Additional Network Subsidy (NEW)</h3>
                <p class="mt-2 text-gray-300">By providing a perpetual, inflationary yet difficulty-adjusted subsidy that increases overall miner profitability, encouraging greater participation and investment in hash rate without altering any of the core design principles or economic foundations to Bitcoin itself, fostering long-term network resilience as Bitcoin's traditional subsidy wanes.</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What the NAT? -->
    <section id="fallacies-duplicate" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Three-column layout: sidebar + content + animation -->
        <div class="grid grid-cols-1 md:grid-cols-4">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">What the NAT?</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">How it Works</h3>
            <p class="mt-3 text-gray-300">
              Using the Digital Matter Theory (DMT) framework, $NAT issues rewards to miners that adjust with Bitcoin’s difficulty. Emissions are tied to the Bits field, which encodes difficulty. As hash power increases, difficulty rises, Bits falls, and $NAT issuance declines. This inverse link aligns supply with network security and energy use, creating a market-driven supplement to miner subsidies that strengthens Bitcoin’s economic resilience while preserving proof-of-work integrity.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Meta-protocols On Bitcoin</h3>
                <p class="mt-2 text-gray-300">
                  Meta-protocols in the context of Bitcoin are secondary layers or frameworks built atop the Bitcoin blockchain that leverage its existing data structures, such as block headers and transaction outputs, to create new functionalities, assets, or incentive mechanisms without altering Bitcoin’s core code. 
                </p>
              </article>
              
              <article>
                <h3 class="text-xl font-semibold text-whitet">Ordinals</h3>
                <p class="mt-2 text-gray-300">
                  The Ordinal Protocol, built on Bitcoin, assigns unique identities to individual satoshis by tracking their mining order, using SegWit and Taproot to embed data like text or images as inscriptions. This enables the creation of distinct digital assets, such as NFTs or tokens, validated by Bitcoin’s decentralized network.
                </p>
              </article>
              
              <article>
                <h3 class="text-xl font-semibold text-white">TAP Protocol</h3>
                <p class="mt-2 text-gray-300">
                  The TAP Protocol enhances Bitcoin’s Ordinals by providing a flexible framework for complex token issuance models, such as the Digital Matter Theory based Non-Arbitrary Tokens (NATs). This is achieved through structured inscriptions that are validated by a decentralized indexer network, allowing for sophisticated, rule-based token logic.
                </p>
              </article>
              
              <article>
                <h3 class="text-xl font-semibold text-white">DMT/NAT</h3>
                <p class="mt-2 text-gray-300">
                  The Digital Matter Theory (DMT) protocol creates non-arbitrary tokens by treating Bitcoin’s blockchain data as a thermodynamically secured substrate for deriving digital commodities that are generated through inscriptions that tie token issuance to the occurrence of patterns within Bitcoin blocks.
                </p>
              </article>
            </div>
          </div>
          <!-- Animated stack (right column, visible on all screens) -->
          <div class="block md:pl-8 mt-10 md:mt-0">
            <StackAnimation />
          </div>
        </div>
      </div>
    </section>

    <!-- Bitcoin is NAT Source Data -->
    <section id="new-section" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Bitcoin is NAT Source Data</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Bits Field</h3>
            <p class="mt-3 text-gray-300">
              The token's value proposition ties to Bitcoin's "bits" field in block headers, a compact 32-bit representation of mining difficulty (target hash). Difficulty adjusts every 2016 blocks based on hashpower. As hashpower rises, the bits value decreases (inverse relationship), reflecting network strength. $NAT positions itself as a quantifiable measure of this difficulty, making it "non-arbitrary" unlike typical tokens.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Impact on Difficulty</h3>
                <p class="mt-2 text-gray-300">
                  As network hash power increases, the target decreases (more leading zeros), which reduces s (smaller exponent) and c (coefficient), leading to a numerically smaller Bits value. 
                  <br>Hash Power ↑ → Difficulty ↑ → Target ↓ → Bits Numerical Value ↓
                </p>
                <div class="mt-4 p-4 bg-dark-card/30 rounded-md space-y-4">
                  <p class="font-mono text-center text-lg">$NAT = bits = s × 2²⁴ + c</p>
                  <div class="p-3 bg-yellow-900/30 border-l-4 border-yellow-500">
                    <p class="text-yellow-200 text-sm">
                      This is "inverse" because as hash power grows exponentially (from MH/s in 2009 to ZH/s in 2025), the Bits value trends downward (from ~487 million to ~370 million in decimal).
                    </p>
                    <div class="mt-3 pt-3 border-t border-yellow-800/50">
                      <p class="text-yellow-100 text-sm font-medium mb-2">For a concrete example:</p>
                      <ul class="text-yellow-200/90 text-xs space-y-1.5 list-disc list-inside break-all" style="overflow-wrap: anywhere;">
                        <li>Target = 0x00000000000404cb000000000000000000000000000000000000000000000000 (256-bit)</li>
                        <li>s = 27 (0x1b in hex, as it's the adjusted byte size/exponent)</li>
                        <li>c = 0x0404cb (coefficient after shifting)</li>
                        <li>Bits = 27×2²⁴ + 0x0404cb = 0x1b0404cb</li>
                        <li>Convert hexadecimal to decimal: 0x1b0404cb = 453248203 or 453,248,203 $NAT</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              
              <article>
                <h3 class="text-xl font-semibold text-whitet">Invoking Bits Value Using Digital Matter Theory & TAP Protocol</h3>
                <div class="space-y-6 text-gray-300 mt-4">
                  <div>
                    <h4 class="font-semibold text-white">1. Pattern Registration - Ordinals</h4>
                    <p>Pattern: <code class="bg-gray-800 px-1.5 py-0.5 rounded">dmt.11.element</code></p>
                    <p>Inscription ID: <a href="https://ordinals.com/inscription/63b5bd2e28c043c4812981718e65d202ab8f68c0f6a1834d9ebea49d8fac7e62i0" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">
                      <code class="bg-gray-800 px-1.5 py-0.5 rounded text-xs break-all hover:bg-gray-700 transition-colors">63b5bd2e28c043c4812981718e65d202ab8f68c0f6a1834d9ebea49d8fac7e62i0</code>
                    </a></p>
                  </div>

                  <div>
                    <h4 class="font-semibold text-white">2. Protocol Syntax - TAP</h4>
                    <pre class="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm mt-2"><code>{
  "p": "tap",
  "op": "dmt-deploy",
  "elem": "63b5bd2e28c043c4812981718e65d202ab8f68c0f6a1834d9ebea49d8fac7e62i0",
  "tick": "nat",
  "dt": "n"
}</code></pre>
                    <p class="mt-2">Inscription ID: <a href="https://ordinals.com/inscription/4d967af36dcacd7e6199c39bda855d7b1b37268f4c8031fed5403a99ac57fe67i0" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">
                      <code class="bg-gray-800 px-1.5 py-0.5 rounded text-xs break-all hover:bg-gray-700 transition-colors">4d967af36dcacd7e6199c39bda855d7b1b37268f4c8031fed5403a99ac57fe67i0</code>
                    </a></p>
                  </div>

                  <div>
                    <h4 class="font-semibold text-white">3. Execution Miner Redirect Child Inscription - DMT/NAT</h4>
                    <pre class="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm mt-2"><code>{
  "p": "tap",
  "op": "reward",
  "type": "miner",
  "block": "885588"
}</code></pre>
                    <p class="mt-2">Inscription ID: <a href="https://ordinals.com/inscription/9c33ddf46e6cefec2924b366d9994d1c0880efa98004471da18f154a239597edi0" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">
                      <code class="bg-gray-800 px-1.5 py-0.5 rounded text-xs break-all hover:bg-gray-700 transition-colors">9c33ddf46e6cefec2924b366d9994d1c0880efa98004471da18f154a239597edi0</code>
                    </a></p>
                  </div>
                </div>
              </article>
              
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NAT Another Aircoin -->
    <section id="fallacies" class="pb-20">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">NAT Another Aircoin</h2>
            <img
              :src="zerovalueUrl"
              alt="Zero Value"
              class="mt-4 rounded-md border border-dark-lighter/50 cursor-zoom-in"
              @click="openLightbox(zerovalueUrl)"
            />
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">First Principles</h3>
            <p class="mt-3 text-gray-300">
              For NAT to fulfill its mission as a complementary subsidy to the Bitcoin mining network, it must overcome skepticism about its core fundamental value proposition. Only then can its value rise in a trajectory comparable to Bitcoin’s original subsidy reward.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Why $NAT Inevitably Increases The Security Budget</h3>
                <p class="mt-2 text-gray-300">Reducing to fundamental economic and game-theoretic truths, we can evaluate $NAT's viability as a self-reinforcing subsidy. Start with basics: Value derives from belief, utility, and scarcity; incentives drive behavior; networks grow via adoption loops.</p>
              </article>

              <article>
                <h3 class="text-xl font-semibold text-white">Principle 1: Belief Creates Value (Market-Driven Subsidy)</h3>
                <p class="mt-2 text-gray-300">
                  <ul class="list-disc pl-5 space-y-2 text-gray-300">
                    <li>Tokens like BTC gain value through collective belief in their utility (e.g., store of value, medium of exchange).</li>
                    <li>For $NAT: If people believe it solves Bitcoin's subsidy problem, they buy/hold it. This increases demand, raising price and market cap.</li>
                    <li>Result: Each $NAT mined becomes worth more in dollars, effectively boosting miners' total rewards per block (BTC subsidy + fees + $NAT value).</li>
                    <li>Defense: This is not circular; it's bootstrapped like BTC itself. Early BTC had no value until belief in its scarcity and decentralization grew adoption. $NAT leverages Bitcoin's existing network effects—its tie to blocks ensures perpetual issuance tied to real activity.</li>
                  </ul>
                </p>
              </article>

              <article>
                <h3 class="text-xl font-semibold text-white">Principle 2: Incentives Align Miners and Holders</h3>
                <div class="mt-2 text-gray-300">
                  <ul class="list-disc pl-5 space-y-2">
                    <li>Miners seek profit maximization. If $NAT's value rises, mining becomes more lucrative, attracting more hashpower.</li>
                    <li>Holders benefit: Higher hashpower increases Bitcoin's security, enhancing BTC's value proposition, which indirectly supports $NAT (as it's Bitcoin-native).</li>
                    <li>Feedback Loop: More belief → higher $NAT price → higher miner rewards → more hashpower → stronger Bitcoin security → more belief in $NAT as a solution.</li>
                    <li>Defense: This mirrors Bitcoin's halving dynamics but adds an uncapped layer. Unlike fees (volatile and dependent on usage), $NAT's value can scale with market sentiment, potentially outpacing halvings. This decouples security from fees alone. If adoption reaches BTC-like levels, it could multiply the budget exponentially, making attacks costlier.</li>
                  </ul>
                </div>
              </article>

              <article>
                <h3 class="text-xl font-semibold text-white">Principle 3: Non-Arbitrary Scarcity and Utility</h3>
                <div class="mt-2 text-gray-300">
                  <ul class="list-disc pl-5 space-y-2">
                    <li>Scarcity alone isn't enough (e.g., many tokens fail). $NAT's utility is anchoring to Bitcoin's difficulty (bits field), making it a proxy for network health.</li>
                    <li>Inverse Property: As difficulty rises (bits decreases), $NAT's narrative strengthens—it's "harder to mine," akin to BTC's halving scarcity story.</li>
                    <li>Defense: This grounds $NAT in verifiable, on-chain data, reducing arbitrariness. Users can audit issuance via Bitcoin explorers, building trust. If Bitcoin thrives, $NAT supply remains predictable, but its value can grow unbounded via demand.</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NAT Another Premine -->
    <section id="NAT Another Premine" class="pb-20">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">NAT Another Premine</h2>
            <img
              :src="premineUrl"
              alt="Premine"
              class="mt-4 rounded-md border border-dark-lighter/50 cursor-zoom-in"
              @click="openLightbox(premineUrl)"
            />
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Distribution Lore</h3>
            <p class="mt-3 text-gray-300">
              The $NAT token was first distributed through a fair mint system. This meant anyone could participate on a first-come, first-served (FCFS) basis — no pre-mines, no reserved allocations — keeping the launch open and decentralized in line with Bitcoin’s ethos.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Launch Details</h3>
                <ul class="mt-2 text-gray-300 list-disc pl-5 space-y-2">
                  <li><strong>Date:</strong> November 20, 2023</li>
                  <li><strong>Method:</strong> Anyone could mint $NAT by inscribing JSON data into a Bitcoin transaction, which claimed a Bitcoin block.</li>
                  <li><strong>Starting point:</strong> Block 817,706, which meant all past blocks up to that point (817,706 blocks) plus all new blocks (created every ~10 minutes) were available to claim.</li>
                  <li><strong>Participation:</strong> Over 20,000 people joined, minting all available Bitcoin blocks in just 7 days, paying over $5M in Bitcoin network fees.</li>
                </ul>
                <div class="mt-3">
                  <p class="text-gray-300 font-semibold">Inscription format:</p>
                  <pre class="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm mt-2"><code>{
  "p": "tap",
  "op": "dmt-mint",
  "tick": "nat",
  "blk": ""
}</code></pre>
                  <p class="mt-2 text-gray-300">The "blk" value told the system which block was being claimed. Each block contained a bits value that determined how many $NAT tokens were minted (usually 350–450M $NAT per block).</p>
                </div>
              </article>

              <article>
                <h3 class="text-xl font-semibold text-white">Post Blockout Distribution</h3>
                <p class="mt-2 text-gray-300">
                  <ul class="list-disc pl-5 space-y-2 text-gray-300">
                    <li>The FCFS minting method continued unchanged until block 885,588.</li>
                    <li>After that, the system switched to a miner-redirect model: instead of open minting, Bitcoin miners automatically receive newly generated $NAT with each block.</li>
                    <li>Result: Each $NAT mined becomes worth more in dollars, effectively boosting miners' total rewards per block (BTC subsidy + fees + $NAT value).</li>
                    <li>To secure this change, the original deployment inscriptions were burned to Satoshi’s address, making the rules permanent.</li>
                    <li>The system is further backed by TRAC Network validators, ensuring decentralized enforcement.</li>
                  </ul>
                </p>
              </article>

            </div>
          </div>
        </div>
      </div>
    </section>

        <!-- Blockout -->
        <section id="solutions" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20 text-center">
        <h2 class="text-3xl md:text-4xl font-bold">BLOCKOUT</h2>
        <div class="prose prose-invert mt-6 max-w-3xl mx-auto">
          <p class="text-lg">
            This event — where every available Bitcoin block was claimed — became known as the “blockout.” You can view the current distribution of holders at
            <a href="https://www.tapalytics.xyz/token/dmt-nat" target="_blank" class="text-blue-400 hover:text-blue-300 underline">TAPALYTICS</a>
          </p>
          <StaggeredGrid />
        </div>
      </div>
    </section>

    <!-- NATstoppable Force -->
    <section class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">NATstoppable Force</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Aligning With Bitcoin Ethos</h3>
            <p class="mt-3 text-gray-300">
              Aligning $NAT with Bitcoin’s ethos requires open-source, peer-to-peer indexing and validation to preserve the value of both systems. These measures ensure $NAT operates as an unstoppable extension of Bitcoin’s resilient architecture, propagating securely and autonomously while remaining impervious to interference or shutdown.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">The Three Pillars of Bitcoin's Ethos</h3>
                <ul class="mt-2 text-gray-300 space-y-4 text-left">
                  <li>
                    <span class="block font-bold text-white text-l md:text-1xl">Decentralization</span>
                    <span>No single entity controls the network, enabling trustless, peer-to-peer interactions.</span>
                    <div class="mt-4 rounded-md border border-dark-lighter/50 bg-transparent overflow-hidden h-52 md:h-72">
                      <DecentralizationNetwork />
                    </div>
                  </li>
                  <li>
                    <span class="block font-bold text-white text-l md:text-1xl">Censorship Resistance</span>
                    <span>Transactions cannot be stopped or altered, protecting financial sovereignty without intermediaries.</span>
                    <div class="mt-4 rounded-md border border-dark-lighter/50 bg-transparent overflow-hidden h-52 md:h-72">
                      <CensorshipResistance />
                    </div>
                  </li>
                  <li>
                    <span class="block font-bold text-white text-l md:text-1xl">Transparency</span>
                    <span>An open-source, auditable blockchain ensures verifiable integrity, making Bitcoin a secure and enduring store of value.</span>
                    <div class="mt-4 rounded-md border border-dark-lighter/50 bg-transparent overflow-hidden h-52 md:h-72">
                      <TransparencyReveal />
                    </div>
                  </li>
                </ul>
              </article>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NAT The End Of The Story -->
    <section class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">NAT The End Of The Story</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Application of Bitcoin Ethos To All of Crypto</h3>
            <p class="mt-3 text-gray-300">
              A successful NAT = precursor to a non-arbitrary crypto era with Bitcoin at the center of the digital universe (<strong>Activate God Mode</strong>)
            </p>
          </aside>

          <!-- Main content (replaced with Motion.dev Smooth Tabs) -->
          <div class="md:col-span-2 md:pl-8">
            <article>
                <h3 class="text-xl font-semibold text-white">Digital Matter Theory Interchain Application</h3>
                <p class="mt-2 text-gray-300">
                  To convert the Digital Matter Theory (DMT) framework into an accessible client for developers deploying smart contracts or building apps on other chains like Solana and Ethereum, we can develop a cross-chain SDK or library that abstracts DMT logic while leveraging oracles for secure Bitcoin data access. This introduces a new fundamental primitive of non-arbitrary tokens that can propagate across all of crypto, where token trait generation ties to Bitcoin's immutable substrate, essentially converting Bitcoin into an arbiter of digital reality.
                </p>
                <br></br>
              </article>
              <article>
                <h3 class="text-xl font-semibold text-white">Who Would Find This Useful?</h3>
                <p class="mt-2 text-gray-300">
                  Developers and creators who leverage non-arbitrary token creation, gain the most value when their designs require immutable, physics-like rules to govern feedback loops, as DMT's thermodynamically secured properties imbue digital assets with intrinsic scarcity and trust, ensuring robust, tamper-resistant dynamics that more closely align with real-world expectations.
                </p>
                <br></br>
              </article>
            <SmoothTabs :tabs="natEndTabs" />
          </div>
        </div>
      </div>
    </section>

 

    <!-- NATwork Effect -->
    <section class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">NATwork Effect</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Symbiotic Relationship</h3>
            <p class="mt-3 text-gray-300">
              The proliferation of the DMT ecosystem, must be tightly aligned with $NAT’s growth to ensure a symbiotic relationship that enhances both the ecosystem’s adoption and $NAT’s economic viability. This will be achieved through mechanisms like fee-based buy-and-burn strategies that redirect DMT-generated revenue to increase $NAT’s scarcity, thereby reinforcing Bitcoin’s security budget, fostering community trust, and creating a self-reinforcing cycle where expanded DMT use cases amplify $NAT’s fundamental value and utility as a core alignment tool.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Multi-chain Integration Leads To The Formation Of Bitcoin’s Export Economy</h3>
                <p class="mt-2 text-gray-300">
                  Assume a theoretical mature non-arbitrary token market achieves parity with the existing arbitrary digital asset market's on-chain volume. This parallel market embeds fees (0.05%, 0.1%, 0.25%) on transactions, with proceeds exported to the Bitcoin mining network in the form of $NAT buy-and-burn as compensation for utilizing Bitcoin's immutable data layer to generate assets on other chains.
                </p>
                <p class="mt-2 text-gray-300">
                  The simulated tariff export values (in USD) per year and fee rate are calculated as: Tariff = Annual Volume × Fee Rate. This represents the potential value redirected to the Bitcoin network (based on real on-chain volume data).
                </p>
                
                <!-- Tariff Export Table -->
                <div class="mt-4 overflow-x-auto">
                  <table class="min-w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr class="bg-dark-card/40 text-gray-200">
                        <th class="px-4 py-3 font-semibold">Year</th>
                        <th class="px-4 py-3 font-semibold">Non-Bitcoin Volume (USD)</th>
                        <th class="px-4 py-3 font-semibold">Tariff at 0.05% (USD)</th>
                        <th class="px-4 py-3 font-semibold">Tariff at 0.1% (USD)</th>
                        <th class="px-4 py-3 font-semibold">Tariff at 0.25% (USD)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-dark-lighter/40">
                      <tr>
                        <td class="px-4 py-3">2021</td>
                        <td class="px-4 py-3">$12.5 trillion</td>
                        <td class="px-4 py-3">$6.25 billion</td>
                        <td class="px-4 py-3">$12.5 billion</td>
                        <td class="px-4 py-3">$31.25 billion</td>
                      </tr>
                      <tr>
                        <td class="px-4 py-3">2022</td>
                        <td class="px-4 py-3">$7.63 trillion</td>
                        <td class="px-4 py-3">$3.815 billion</td>
                        <td class="px-4 py-3">$7.63 billion</td>
                        <td class="px-4 py-3">$19.075 billion</td>
                      </tr>
                      <tr>
                        <td class="px-4 py-3">2023</td>
                        <td class="px-4 py-3">$6.06 trillion</td>
                        <td class="px-4 py-3">$3.03 billion</td>
                        <td class="px-4 py-3">$6.06 billion</td>
                        <td class="px-4 py-3">$15.15 billion</td>
                      </tr>
                      <tr>
                        <td class="px-4 py-3">2024</td>
                        <td class="px-4 py-3">$25.71 trillion</td>
                        <td class="px-4 py-3">$12.855 billion</td>
                        <td class="px-4 py-3">$25.71 billion</td>
                        <td class="px-4 py-3">$64.275 billion</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="bg-dark-card/40 text-gray-100 font-semibold">
                        <td class="px-4 py-3">Total</td>
                        <td class="px-4 py-3">$51.9 trillion</td>
                        <td class="px-4 py-3">$25.95 billion</td>
                        <td class="px-4 py-3">$51.9 billion</td>
                        <td class="px-4 py-3">$129.75 billion</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <!-- Sources / Footnote -->
                <p class="mt-3 text-xs text-gray-400 leading-relaxed">
                  Sources: 
                  <span class="whitespace-normal">
                    Chainalysis. (2021–2025). Crypto Crime Reports. Retrieved from 
                    <a href="https://www.chainalysis.com/blog/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-300">chainalysis.com/blog</a> and 
                    <a href="https://go.chainalysis.com" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-300">go.chainalysis.com</a>; 
                    Glassnode. (2025). On-Chain Market Intelligence Reports. Retrieved from 
                    <a href="https://insights.glassnode.com/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-300">insights.glassnode.com</a> and 
                    <a href="https://glassnode.com/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-300">glassnode.com</a>; 
                    CoinDesk. (2024). Crypto Crime Amounted to Over $24B in 2023: Chainalysis. Retrieved from 
                    <a href="https://www.coindesk.com/markets/2024/01/18/crypto-crime-amounted-to-over-24b-in-2023-chainalysis/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-300">coindesk.com</a>.
                  </span>
                </p>
              </article>

              <article>
                <h3 class="text-xl font-semibold text-white">Proof of Concept (NATwheel)</h3>
                <p class="mt-2 text-gray-300">
                  To prove this models efficacy, applications built using DMT as a substrate for asset issuance must align incentives and sustain Bitcoin's ecosystem through the implementation of a tariff mechanism as described above. This creates a powerful flywheel as DMT applications proliferate and scale, the tariffs amplify $NAT's scarcity and utility, reinforcing Bitcoin's security budget, driving cross-chain adoption, and establishing a self-sustaining loop that elevates the overall on-chain economy through trustless, value-returning primitives.
                </p>
                <p class="mt-2 text-gray-300">
                  First DMT based app executing on this coming soon to Solana...
                </p>
                <div class="mt-6">
                  <NATworkFlywheel />
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

       <!-- Are you NAT Entertained? -->
       <section id="conclusion" class="border-b border-dark-lighter/50">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <!-- Two-column layout: sidebar + content -->
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Sidebar -->
          <aside class="md:pr-8 md:border-r border-dark-lighter/50 pb-10 md:pb-0 md:sticky md:top-20 self-start">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Are you NAT Entertained?</h2>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Conclusion</h3>
            <p class="mt-3 text-gray-300">
              Supporting Bitcoin’s long-term viability is a challenge we must solve today, as it is critical to onboarding billions into the digital store of wealth.
            </p>
          </aside>

          <!-- Main content -->
          <div class="md:col-span-2 md:pl-8">
            <div class="space-y-8">
              <article>
                <h3 class="text-xl font-semibold text-white">Untapped Substrate</h3>
                <p class="mt-2 text-gray-300">
                  $NAT addresses one of Bitcoin’s most pressing sustainability challenges by realigning miner incentives and helping to offset the declining security budget—thus supporting the long-term viability of the network. It introduces a novel mechanism for digital asset creation that enhances the value proposition of Proof-of-Work (PoW) chains by leveraging the thermodynamically preserved properties within block data to create new digital substance. This opens the door to a wide range of new applications that reference this previously untapped substrate, enabling the creation of derivative products in a multi-chain economy that can return value to the Bitcoin network—reinforcing its efforts to preserve and strengthen the immutability of the information stored in it.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Image Lightbox Overlay -->
    <div v-if="lightboxSrc" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" @click="closeLightbox">
      <img :src="lightboxSrc!" alt="Expanded image" class="max-w-[92vw] max-h-[92vh] rounded-lg shadow-2xl" @click.stop />
    </div>

    <ScrollProgressBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Motion } from '@motionone/vue'
import { animate } from 'motion'
import ScrollProgressBar from '../components/ScrollProgressBar.vue'
import zerovalueUrl from '../assets/zerovalue.png'
import premineUrl from '../assets/premine.png'
import StackAnimation from '../components/StackAnimation.vue'
import StaggeredGrid from '../components/StaggeredGrid.vue'
import SupplySubsidyChart from '../components/SupplySubsidyChart.vue'
import MinerRevenueChart from '../components/MinerRevenueChart.vue'
import FeeShareChart from '../components/FeeShareChart.vue'
import DecentralizationNetwork from '../components/DecentralizationNetwork.vue'
import AttackNetwork51 from '../components/AttackNetwork51.vue'
import CensorshipResistance from '../components/CensorshipResistance.vue'
import TransparencyReveal from '../components/TransparencyReveal.vue'
import SmoothTabs from '../components/SmoothTabs.vue'
import NATworkFlywheel from '../components/NATworkFlywheel.vue'

// Live data: Market Cap (reuse Home.vue logic)
// Image Lightbox state/handlers
const lightboxSrc = ref<string | null>(null)
function openLightbox(src: string) { lightboxSrc.value = src }
function closeLightbox() { lightboxSrc.value = null }
function onKeydown(e: KeyboardEvent) { if (e.key === 'Escape') closeLightbox() }
onMounted(() => { window.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown) })

// Toggle for NAT live data section (hidden by default)
const showNatData = ref(false)

// Live data: Market Cap (reuse Home.vue logic)
const natEndTabs = [
  {
    title: 'Metaverse & Gaming',
    content:
      'The earliest implementation of Digital Matter Theory (DMT), Bitmap, showcases how non-arbitrary Bitcoin blockchain data can be used to generate digital land. Bitmap is a protocol that leverages Ordinals to inscribe individual Bitcoin blocks as unique, non-fungible assets, each block representing a district composed of parcels. These parcels inherit their uniqueness from the immutable, thermodynamically secured data of the block itself. The transaction data within each block shapes the topography, transforming raw blockchain information into a procedurally generated digital landscape.\n\nBy further using the substrate data embedded in each block, additional layers of the virtual ecosystem can be built under the same tamper-proof, verifiable rules. This enables features such as resource distribution, landscapes that evolve with underlying patterns, or in gaming contexts,the probabilistic appearance of a world boss in specific locations. All of these elements inherit the trustless, immutable qualities of Bitcoin, ensuring consistent and fair digital environments free from the arbitrary parameters that dominate most virtual worlds today.'
  },
  {
    title: 'AI',
    content:
      "Stanford's \"Generative Agents\" initiative, led by researchers at the Human-Centered Artificial Intelligence (HAI) institute, simulated 25 AI agents in a virtual town (\"Smallville\") using large language models (LLMs) to generate human-like behaviors based on predefined personality traits (e.g., Big Five model: openness, conscientiousness, extraversion, agreeableness, neuroticism). Agents formed memories, planned actions, and interacted socially/economically, demonstrating emergent behaviors like information diffusion and relationship formation.\n\nhttps://hai.stanford.edu/news/ai-agents-simulate-1052-individuals-personalities-with-impressive-accuracy\n\nFor non-arbitrary variables to apply to this experiment and others like it, assign each agent a unique Bitcoin block in the form of a UNAT (Unique Non-Arbitrary Token) as its foundational \"DNA\". Then extract non-arbitrary patterns from block header data:\n\n- Bits field (e.g., 386,018,193 from block 912,962): Encodes mining difficulty; use its value to derive \"openness\" trait (higher difficulty → higher openness, reflecting adaptability to \"harsh\" environments).\n- Nonce (e.g., 3,182,121,568): A random-like value solved via proof-of-work; map its digits or parity to \"extraversion\".\n- Merkle Root (hash string, e.g., starting with \"d9\"): Convert hex to numerical values or entropy measures for \"agreeableness\" (higher entropy → lower agreeableness, simulating \"complex\" interpersonal dynamics).\n- Timestamp and Tx Count (e.g., Sep 03, 2025, 3:31:42 AM; 1,663 txs): Use epoch time components for \"conscientiousness\" (e.g., minute/second for punctuality proxy) and tx count for \"neuroticism\" (higher volume → higher neuroticism, reflecting \"stressful\" block activity).\n\nResult: Each agent possesses a verifiably unique, non-arbitrary personality that is queryable on the blockchain and linked to a distinct \"DNA\" signature. This prevents duplication and ensures full traceability. These features reduce bias in trait assignment, lending to greater credibility to the personality's influence in AI psychology research. Additionally, the uniqueness of each agent better reflects the genetic and environmental diversity found in humans, supporting more robust and statistically meaningful analyses comparable to real-world studies."
  },
  {
    title: 'Digital Art',
    content:
      'NatCats is a pioneering digital art collection consisting of 8,064 unique pixelated cat artworks minted on the Bitcoin blockchain using the Ordinals and TAP protocols, launched in February 2024 as the first generative art project under DMT\'s UNAT framework. Each NatCat is autonomously generated from Bitcoin\'s raw block data, rendered as generative SVGs without human intervention, creating collectible profile picture (PFP)-style cats that vary in traits like color, pose, and features based on the blockchain\'s non-arbitrary inputs. As a fair-mint project, it allowed for open participation via inscriptions, with no pre-mines, and has achieved significant traction, including over 600 BTC in trading volume.\n\nOne of the key features enabled by the UNAT standard is the non-arbitrary expansion of the NatCats supply, triggered by the recurrence of a specific pattern defined by the DMT protocol. In NatCats’ case, this pattern is "3b" in the bits field. Throughout Bitcoin’s history, this pattern has only appeared during four difficulty adjustment periods—each spanning 2,016 blocks—resulting in the current total supply of NatCats.\n\nFuture generations of NatCats will be created only when this rare "3b" pattern naturally reappears, entirely independent of the original creator (EV). This mechanism permanently aligns NatCats with the ongoing production of new Bitcoin blocks, enabling the collection to grow autonomously. As a result, new and potentially rare traits may emerge over time—introduced not by human discretion, but by blockchain-native randomness. This ensures NatCats will continue evolving indefinitely, even long after the original creator is gone.'
  },
  {
    title: 'Prediction Markets',
    content:
      'By anchoring the virtual dimension to non-arbitrary patterns found in Bitcoin’s on-chain data, a new class of trustless, verifiable events can emerge—such as spawning a world boss, triggering dynamic weather systems, or unlocking rare in-game assets. These events act as provable triggers within virtual environments, enabling the creation of a powerful new prediction market. Since all outcomes are based on publicly accessible, immutable blockchain data, they inherit Bitcoin’s security guarantees—ensuring tamper-proof execution and complete independence from centralized control.\n\nThese events are not predictable in advance, because:\n- Block data is only known after mining.\n- Bitcoin’s mining process is probabilistic and external to any virtual platform.\n\nThis framework enables users to speculate on the occurrence or outcome of these blockchain-driven events. Since the triggers are provably random and outside the influence of any participant (including the event creators), the resulting markets are inherently fair and transparent. By aligning virtual outcomes with naturally emergent patterns in Bitcoin, DMT provides a robust foundation for decentralized forecasting, enabling long-term, self-sustaining ecosystems where meaningful digital events unfold autonomously and remain verifiable on-chain.'
  },
  {
    title: 'DeFi',
    content:
      'Digital Matter Theory (DMT) can revolutionize DeFi yield mechanics by enabling the creation of non-arbitrary yield-bearing assets, where returns such as staking rewards or lending interest are dynamically calibrated based on Bitcoin\'s immutable blockchain data patterns. This reduces arbitrary inflation risks, enhancing economic resilience, and fostering more sustainable, trustless protocol incentives for applications like automated market makers or liquidity pools.'
  }
]
const API_URL = 'https://mscribe.io/api/tokens/all'
const token = ref<any | null>(null)
const usdValue = ref<number | null>(null)
const marketCapUsd = ref(0)

const getTotalAvailable = (max: string, left: string) => {
  const balance = BigInt(max) - BigInt(left)
  return balance.toString()
}

// Animated Market Cap text
const capText = ref<string>('$0.00')
const lastCap = ref(0)

// Animated Holders text
const holdersText = ref<string>('0')
const holdersCount = ref(0)
const lastHolders = ref(0)

// Animated Supply text
const supplyText = ref<string>('0')
const supplyCount = ref(0)
const lastSupply = ref(0)
const supplyUnit = ref<'T' | 'B' | ''>('')

// Ease-in-out cubic for smooth accelerate then decelerate
const easeInOutCubic = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const formatLargeCurrency = (value: number) => {
  if (!isFinite(value) || value <= 0) return '$0'

  // Under $1M: show K with no decimals (rounded to nearest 1K)
  if (value < 1_000_000) {
    const thousands = Math.round(value / 1_000)
    if (thousands <= 0) return '$0'
    return `$${thousands.toLocaleString('en-US')}K`
  }

  // Helper to format with up to 2 decimals and trim trailing zeros
  const withSuffix = (val: number, divisor: number, suffix: string) => {
    const num = val / divisor
    let str = num.toFixed(2)
    str = str.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
    return `$${str}${suffix}`
  }

  if (value >= 1e12) return withSuffix(value, 1e12, 'T')
  if (value >= 1e9) return withSuffix(value, 1e9, 'B')
  return withSuffix(value, 1e6, 'M')
}

// Format holders count with 1 decimal K/M/B/T (e.g., 25.0K)
const formatCompactCount = (value: number) => {
  if (!isFinite(value) || value <= 0) return '0'
  if (value < 1_000) return Math.round(value).toLocaleString('en-US')
  if (value < 1_000_000) return (value / 1_000).toFixed(1) + 'K'
  if (value < 1_000_000_000) return (value / 1_000_000).toFixed(1) + 'M'
  if (value < 1_000_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B'
  return (value / 1_000_000_000_000).toFixed(1) + 'T'
}

// Format supply using computed unit with no decimals (e.g., 375T, 950B)
const formatSupplyCount = (value: number, unit: 'T' | 'B' | '' = '') => {
  if (!isFinite(value) || value <= 0) return '0'
  if (unit === 'T') return Math.round(value) + 'T'
  if (unit === 'B') return Math.round(value) + 'B'
  return Math.round(value).toLocaleString('en-US')
}

// No subscriptions needed; we animate using onUpdate callbacks

// Fetch NAT market cap (same endpoint and params as Home.vue)
onMounted(async () => {
  // Skip fetching if section is hidden
  if (!showNatData.value) return
  try {
    const request = await fetch(API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        ticker: 'dmt-nat',
        limit: 1,
        offset: 0,
        latest_deployed: 0,
        isGetHolders: 1
      })
    })
    const response = await request.json()
    token.value = response?.deployments?.[0] ?? null
    usdValue.value = response?.usd_value ?? null
    if (token.value) {
      token.value.totalSupply = getTotalAvailable(token.value.max, token.value.mintLeft)
      token.value.marketcap = token.value.floor_price * token.value.totalSupply
      if (usdValue.value) {
        // Convert sats to USD using the same approach as Home.vue/MissionSection
        marketCapUsd.value = (token.value.marketcap * usdValue.value) / 100_000_000
      }
      holdersCount.value = Number(token.value.holders ?? 0)
      // Derive supply value and unit from the raw totalSupply string using BigInt
      const rawSupply = (token.value.totalSupply ?? '0').toString()
      try {
        const big = BigInt(rawSupply)
        if (rawSupply.length > 12) {
          supplyUnit.value = 'T'
          supplyCount.value = Number(big / 1_000_000_000_000n)
        } else if (rawSupply.length > 9) {
          supplyUnit.value = 'B'
          supplyCount.value = Number(big / 1_000_000_000n)
        } else {
          supplyUnit.value = ''
          supplyCount.value = Number(rawSupply)
        }
      } catch {
        supplyUnit.value = ''
        supplyCount.value = 0
      }
    }
  } catch (error) {
    console.log(error)
  }
})

// Animate the number when the USD value is computed
watch(marketCapUsd, (val) => {
  if (val && val > 0) {
    const from = Number.isFinite(lastCap.value) ? lastCap.value : 0
    const to = val
    const controls = animate(0, 1, {
      duration: 3,
      onUpdate: (p: number) => {
        const eased = easeInOutCubic(p)
        const current = from + (to - from) * eased
        capText.value = formatLargeCurrency(current)
      }
    })
    controls.finished.finally(() => {
      lastCap.value = to
      capText.value = formatLargeCurrency(to)
    })
  }
})

// Animate Holders when value is set
watch(holdersCount, (val) => {
  if (val && val > 0) {
    const from = Number.isFinite(lastHolders.value) ? lastHolders.value : 0
    const to = val
    const controls = animate(0, 1, {
      duration: 3,
      delay: .5,
      onUpdate: (p: number) => {
        const eased = easeInOutCubic(p)
        const current = from + (to - from) * eased
        holdersText.value = formatCompactCount(current)
      }
    })
    controls.finished.finally(() => {
      lastHolders.value = to
      holdersText.value = formatCompactCount(to)
    })
  }
})

// Animate Supply when value is set
watch(supplyCount, (val) => {
  if (val && val > 0) {
    const from = Number.isFinite(lastSupply.value) ? lastSupply.value : 0
    const to = val
    const controls = animate(0, 1, {
      duration: 3,
      delay: 1,
      onUpdate: (p: number) => {
        const eased = easeInOutCubic(p)
        const current = from + (to - from) * eased
        supplyText.value = formatSupplyCount(current, supplyUnit.value)
      }
    })
    controls.finished.finally(() => {
      lastSupply.value = to
      supplyText.value = formatSupplyCount(to, supplyUnit.value)
    })
  }
})


// No cleanup required for animate onUpdate once finished
</script>
