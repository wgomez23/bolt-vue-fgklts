/**
 * Shared content data for NATpaper page
 * Used by both NatPaper.vue (interactive) and NatPaperPrint.vue (print-optimized)
 */

export interface TabItem {
  title: string
  content: string
}

/**
 * DMT Interchain Application tabs content
 */
export const dmtInterchainTabs: TabItem[] = [
  {
    title: 'Metaverse & Gaming',
    content:
      'The earliest implementation of Digital Matter Theory (DMT), Bitmap, showcases how non-arbitrary Bitcoin blockchain data can be used to generate digital land. Bitmap is a protocol that leverages Ordinals to inscribe individual Bitcoin blocks as unique, non-fungible assets, each block representing a district composed of parcels. These parcels inherit their uniqueness from the immutable, thermodynamically secured data of the block itself. The transaction data within each block shapes the topography, transforming raw blockchain information into a procedurally generated digital landscape.\n\nBy further using the substrate data embedded in each block, additional layers of the virtual ecosystem can be built under the same tamper-proof, verifiable rules. This enables features such as resource distribution, landscapes that evolve with underlying patterns, or in gaming contexts, the probabilistic appearance of a world boss in specific locations. All of these elements inherit the trustless, immutable qualities of Bitcoin, ensuring consistent and fair digital environments free from the arbitrary parameters that dominate most virtual worlds today.'
  },
  {
    title: 'AI',
    content:
      "Stanford's \"Generative Agents\" initiative, led by researchers at the Human-Centered Artificial Intelligence (HAI) institute, simulated 25 AI agents in a virtual town (\"Smallville\") using large language models (LLMs) to generate human-like behaviors based on predefined personality traits (e.g., Big Five model: openness, conscientiousness, extraversion, agreeableness, neuroticism). Agents formed memories, planned actions, and interacted socially/economically, demonstrating emergent behaviors like information diffusion and relationship formation.\n\nhttps://arxiv.org/abs/2304.03442\n\nFor non-arbitrary variables to apply to this experiment and others like it, assign each agent a unique Bitcoin block in the form of a UNAT (Unique Non-Arbitrary Token) as its foundational \"DNA\". Then extract non-arbitrary patterns from block header data:\n\n- Bits field (e.g., 386,018,193 from block 912,962): Encodes mining difficulty; use its value to derive \"openness\" trait (higher difficulty → higher openness, reflecting adaptability to \"harsh\" environments).\n- Nonce (e.g., 3,182,121,568): A random-like value solved via proof-of-work; map its digits or parity to \"extraversion\".\n- Merkle Root (hash string, e.g., starting with \"d9\"): Convert hex to numerical values or entropy measures for \"agreeableness\" (higher entropy → lower agreeableness, simulating \"complex\" interpersonal dynamics).\n- Timestamp and Tx Count (e.g., Sep 03, 2025, 3:31:42 AM; 1,663 txs): Use epoch time components for \"conscientiousness\" (e.g., minute/second for punctuality proxy) and tx count for \"neuroticism\" (higher volume → higher neuroticism, reflecting \"stressful\" block activity).\n\nResult: Each agent possesses a verifiably unique, non-arbitrary personality that is queryable on the blockchain and linked to a distinct \"DNA\" signature. This prevents duplication and ensures full traceability. These features reduce bias in trait assignment, lending to greater credibility to the experiment's findings."
  },
  {
    title: 'Digital Art',
    content:
      "NatCats is a pioneering digital art collection consisting of 8,064 unique pixelated cat artworks minted on the Bitcoin blockchain using the Ordinals and TAP protocols, launched in February 2024 as the first generative art project under DMT's UNAT framework. Each NatCat is autonomously generated from Bitcoin's raw block data, rendered as generative SVGs without human intervention, creating collectible profile picture (PFP)-style cats that vary in traits like color, pose, and features based on the blockchain's non-arbitrary inputs. As a fair-mint project, it allowed for open participation via inscriptions, with no pre-mines, and has achieved significant traction, including over 600 BTC in trading volume.\n\nOne of the key features enabled by the UNAT standard is the non-arbitrary expansion of the NatCats supply, triggered by the recurrence of a specific pattern defined by the DMT protocol. In NatCats' case, this pattern is \"3b\" in the bits field. Throughout Bitcoin's history, this pattern has only appeared during four difficulty adjustment periods, each spanning 2,016 blocks, resulting in the current total supply of NatCats.\n\nFuture generations of NatCats will be created only when this rare \"3b\" pattern naturally reappears, entirely independent of the original creator (EV). This mechanism permanently aligns NatCats with the ongoing production of new Bitcoin blocks, enabling the collection to grow autonomously. As a result, new and potentially rare traits may emerge over time, introduced not by human discretion, but by blockchain-native randomness. This ensures NatCats will continue evolving indefinitely, even long after the original creator is gone."
  },
  {
    title: 'Prediction Markets',
    content:
      "By anchoring the virtual dimension to non-arbitrary patterns found in Bitcoin's on-chain data, a new class of trustless, verifiable events can emerge, such as spawning a world boss, triggering dynamic weather systems, or unlocking rare in-game assets. These events act as provable triggers within virtual environments, enabling the creation of a powerful new prediction market. Since all outcomes are based on publicly accessible, immutable blockchain data, they inherit Bitcoin's security guarantees, ensuring tamper-proof execution and complete independence from centralized control.\n\nThese events are not predictable in advance, because:\n- Block data is only known after mining.\n- Bitcoin's mining process is probabilistic and external to any virtual platform.\n\nThis framework enables users to speculate on the occurrence or outcome of these blockchain-driven events. Since the triggers are provably random and outside the influence of any participant (including the event creators), the resulting markets are inherently fair and transparent. By aligning virtual outcomes with naturally emergent patterns in Bitcoin, DMT provides a robust foundation for decentralized forecasting, enabling long-term, self-sustaining ecosystems where meaningful digital events unfold autonomously and remain verifiable on-chain."
  },
  {
    title: 'DeFi',
    content:
      'Digital Matter Theory (DMT) can revolutionize DeFi yield mechanics by enabling the creation of non-arbitrary yield-bearing assets, where returns such as staking rewards or lending interest are dynamically calibrated based on Bitcoin\'s immutable blockchain data patterns. This reduces arbitrary inflation risks, enhancing economic resilience, and fostering more sustainable, trustless protocol incentives for applications like automated market makers or liquidity pools.'
  }
]

/**
 * Table of Contents sections for the NATpaper
 */
export const tocSections = [
  { id: 'intro', title: 'Introduction' },
  { id: 'preface', title: 'Bitcoin is NAT Certain' },
  { id: 'problems', title: 'Key Problems' },
  { id: 'solutions', title: 'NAT Solution' },
  { id: 'fallacies-duplicate', title: 'How It Works' },
  { id: 'new-section', title: 'Bits Field' },
  { id: 'fallacies', title: 'First Principles' },
  { id: 'NAT Another Premine', title: 'Distribution' },
  { id: 'ecosystem', title: 'Bitcoin Ethos Alignment' },
  { id: 'dmt-interchain', title: 'DMT Interchain Applications' },
  { id: 'natwork-effect', title: 'NATwork Effect' },
  { id: 'conclusion', title: 'Conclusion' },
  { id: 'oath', title: 'The Oath' }
]

/**
 * NAT comparison table data - market cap milestones
 */
export const natComparisonTable = [
  {
    marketCap: '$50M',
    additionalUsd: '$50',
    feeComparison: 'Negligible (1.5% of fees)',
    subsidyComparison: 'Minimal (0.01% of subsidy)'
  },
  {
    marketCap: '$500M',
    additionalUsd: '$500',
    feeComparison: 'Minor boost (15% of fees)',
    subsidyComparison: 'Negligible (0.1% of subsidy)'
  },
  {
    marketCap: '$1B',
    additionalUsd: '$1,000',
    feeComparison: 'Approaches fees (30% of fees)',
    subsidyComparison: 'Minor (0.3% of subsidy)'
  },
  {
    marketCap: '$3B',
    additionalUsd: '$3,000',
    feeComparison: 'Near parity (89% of fees)',
    subsidyComparison: 'Small (0.8% of subsidy)'
  },
  {
    marketCap: '$6B',
    additionalUsd: '$6,000',
    feeComparison: 'Exceeds fees (177% of fees; surpasses typical tx revenue)',
    subsidyComparison: 'Modest (1.7% of subsidy)'
  },
  {
    marketCap: '$100B',
    additionalUsd: '$100,000',
    feeComparison: 'Significant (29× fees; dwarfs tx revenue)',
    subsidyComparison: '~1/3 of subsidy (28% of subsidy)'
  },
  {
    marketCap: '$350B',
    additionalUsd: '$350,000',
    feeComparison: 'Massive (103× fees; far exceeds tx revenue)',
    subsidyComparison: 'Matches subsidy (99% of subsidy; doubles total rewards)'
  }
]

/**
 * Tariff export table data
 */
export const tariffExportTable = [
  {
    year: '2021',
    volume: '$12.5 trillion',
    tariff005: '$6.25 billion',
    tariff01: '$12.5 billion',
    tariff025: '$31.25 billion'
  },
  {
    year: '2022',
    volume: '$7.63 trillion',
    tariff005: '$3.815 billion',
    tariff01: '$7.63 billion',
    tariff025: '$19.075 billion'
  },
  {
    year: '2023',
    volume: '$6.06 trillion',
    tariff005: '$3.03 billion',
    tariff01: '$6.06 billion',
    tariff025: '$15.15 billion'
  },
  {
    year: '2024',
    volume: '$25.71 trillion',
    tariff005: '$12.855 billion',
    tariff01: '$25.71 billion',
    tariff025: '$64.275 billion'
  }
]

/**
 * BRC20 vs DMT comparison table data
 */
export const brc20VsDmtTable = [
  {
    category: 'Onchain Dependency',
    brc20: 'Fully reliant on Bitcoin\'s main chain for all operations: inscriptions for minting ("mint" ops), transfers ("transfer" inscriptions), and trading (bundled tx).',
    dmt: 'Uses Bitcoin for initial asset genesis (e.g., referencing "bits" field), but offloads minting, trading, and transfers to other chains (e.g., Solana), limiting Bitcoin to data reads.'
  },
  {
    category: 'Network Bloat Impact',
    brc20: 'High: Embeds large data payloads, bloating UTXO set by 10–20% during peaks and causing mempool backlogs (>300,000 unconfirmed tx).',
    dmt: 'Low: Minimal writes on Bitcoin (occasional inscriptions). Offloading reduces bloat; if scaled, could shrink UTXO growth by avoiding persistent data‑heavy tx.'
  },
  {
    category: 'Fee and Congestion Effects',
    brc20: 'Drove average fees to >50 sat/vB in late 2023; non‑monetary tx accounted for 36% of 2023 fees, totaling >5,000 BTC in cumulative BRC20 fees since March 2023.',
    dmt: 'Lowers fees natively on Bitcoin, stabilizing the network for monetary usage while harnessing fees from other execution layers to deliver back to Bitcoin in the form of a $NAT buyback to increase the value of the $NAT subsidy for miners.'
  },
  {
    category: 'Scalability and Mitigation Potential',
    brc20: 'Limited: All activity stays on Bitcoin, exacerbating congestion without Layer 2 solutions; no inherent offloading.',
    dmt: 'High: Hybrid model preserves Bitcoin as secure substrate but shifts volume off‑chain, reducing concerns drastically while maintaining non‑arbitrary value through data references.'
  },
  {
    category: 'Overall Network Benefits',
    brc20: 'Neutral to negative: Increases miner fees short‑term but risks long‑term usability and centralization from bloat.',
    dmt: 'Positive: Minimal footprint enhances scalability, with potential economic boosts (e.g., tariffs funding miner subsidies via $NAT).'
  }
]

/**
 * ESR/AOI benchmark table data
 */
export const esrBenchmarkTable = [
  {
    metric: 'Global Generation',
    description: 'Total electricity produced worldwide',
    benchmark: '30,856 TWh',
    target: 'N/A (exogenous variable)'
  },
  {
    metric: 'Global Consumption',
    description: 'End-user electricity demand',
    benchmark: '~27,000 TWh (2023)',
    target: 'N/A (exogenous variable)'
  },
  {
    metric: 'Surplus Energy',
    description: 'Generation minus consumption (incl. losses)',
    benchmark: '~3,856 TWh',
    target: 'N/A (exogenous variable)'
  },
  {
    metric: 'Bitcoin Consumption',
    description: 'Network\'s annual energy use',
    benchmark: '186 TWh',
    target: 'Scale to >50% of surplus'
  },
  {
    metric: 'Energy Security Ratio (ESR)',
    description: 'Bitcoin / Surplus',
    benchmark: '0.048 (4.8%)',
    target: '>0.5 (50%) for attack resistance'
  },
  {
    metric: 'Attack Opportunity Index (AOI)',
    description: '1 − ESR',
    benchmark: '0.952 (95.2%)',
    target: '<0.5 (minimize vulnerability)'
  },
  {
    metric: 'Bitcoin Security Intensity (BSI)',
    description: 'Annualized miner revenue / Market Cap',
    benchmark: '0.0088 (0.88%)',
    target: '>0.01 (1%) for robust defense'
  }
]
