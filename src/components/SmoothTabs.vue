<template>
  <div class="w-full">
    <!-- Tabs header -->
    <div ref="tablistRef" role="tablist" aria-label="Section Tabs"
         class="relative isolate shimmer-border rounded-full bg-dark-card/30 p-1.5 flex flex-nowrap overflow-x-auto gap-1 md:justify-center justify-start snap-x snap-mandatory no-scrollbar fade-edges scroll-px-2 border border-primary/60">
      <!-- Solid gradient outline fallback as a real element (ensures visibility on Safari/Firefox) -->
      <div class="tab-outline absolute inset-0 rounded-full pointer-events-none" aria-hidden="true" />
      <!-- Animated indicator behind the active tab -->
      <Motion
        tag="div"
        class="absolute top-1.5 bottom-1.5 left-0 rounded-full bg-orange-500/15 border border-orange-400/40 pointer-events-none"
        :animate="{ x: indicatorX, width: indicatorW }"
        :transition="{ duration: 0.35, easing: cubicBezier(0.22, 1, 0.36, 1) }"
        :style="{ zIndex: 0 }"
      />

      <!-- Tab buttons -->
      <button
        v-for="(t, i) in tabs"
        :key="`tab-${i}`"
        role="tab"
        :aria-selected="activeIndex === i"
        :tabindex="activeIndex === i ? 0 : -1"
        @click="setActive(i)"
        @keydown.right.prevent="focusNext()"
        @keydown.left.prevent="focusPrev()"
        class="relative z-10 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium transition-colors select-none whitespace-nowrap inline-flex items-center justify-center text-center snap-start"
        :class="activeIndex === i ? 'text-orange-400' : 'text-gray-300 hover:text-white'"
      >
        {{ t.title }}
      </button>
    </div>

    <!-- Content -->
    <div class="mt-6 rounded-lg border border-primary/50 bg-dark-card/30 p-4 md:p-6 h-96 md:h-[32rem] overflow-hidden relative">
      <Motion
        :key="activeIndex"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, easing: 'ease-out' }"
        class="h-full"
      >
        <div ref="contentRef" class="prose prose-invert max-w-none h-full overflow-y-auto pr-2 overscroll-contain space-y-4">
          <h3 class="text-xl font-semibold text-white mb-2">{{ tabs[activeIndex]?.title }}</h3>
          <template v-for="(block, idx) in activeContentBlocks" :key="idx">
            <ul v-if="block.type === 'list'" class="list-disc pl-6 space-y-2 text-gray-300">
              <li
                v-for="(item, i) in block.items"
                :key="i"
                class="leading-relaxed"
                v-html="formatListItemHtml(item)"
              />
            </ul>
            <p v-else class="text-gray-300 leading-relaxed">
              <template v-for="(part, j) in block.parts" :key="j">
                <a
                  v-if="part.type === 'link'"
                  :href="part.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:text-blue-300 underline"
                >{{ part.text }}</a>
                <span v-else v-html="formatTextPartHtml(part.text, j === 0)"></span>
              </template>
            </p>
          </template>
        </div>
      </Motion>
      <!-- Scroll hint overlay -->
      <div v-if="showScrollHint" class="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div class="h-12 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="flex justify-center items-center -mt-8 pb-1">
          <Motion
            tag="div"
            class="text-xs text-gray-300/90 bg-black/40 px-2 py-1 rounded-full border border-dark-lighter/50"
            :animate="{ y: [0, -14, 0, -6, 0], opacity: [0.85, 1, 0.9, 0.95, 0.9], scale: [1, 1.04, 1, 1.02, 1] }"
            :transition="{ duration: 2.0, easing: cubicBezier(0.22, 1, 0.36, 1), repeat: Infinity }"
          >
            Scroll to read more ↓
          </Motion>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount, watch, computed } from 'vue'
import { Motion } from '@motionone/vue'
import { cubicBezier } from 'motion'

interface TabItem {
  title: string
  content: string
}

const props = defineProps<{ tabs: TabItem[]; initialIndex?: number }>()

const activeIndex = ref(props.initialIndex ?? 0)
const tablistRef = ref<HTMLElement | null>(null)
const indicatorX = ref(0)
const indicatorW = ref(0)

// Parse active tab content into paragraph and list blocks.
// A block is considered a list if all non-empty lines start with "- ".
type ParagraphPart =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string }

type ContentBlock =
  | { type: 'paragraph'; parts: ParagraphPart[] }
  | { type: 'list'; items: string[] }

const activeContentBlocks = computed<ContentBlock[]>(() => {
  const raw = props.tabs[activeIndex.value]?.content ?? ''
  const blocks = raw.split(/\n\s*\n/).filter(Boolean)
  const result: ContentBlock[] = []

  const pushParagraph = (text: string) => {
    const normalized = text.replace(/\n+/g, ' ')
    const urlRegex = /(https?:\/\/[^\s)]+)(?=[)\s]|$)/g
    const parts: ParagraphPart[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = urlRegex.exec(normalized)) !== null) {
      const start = match.index
      const end = start + match[0].length
      if (start > lastIndex) {
        parts.push({ type: 'text', text: normalized.slice(lastIndex, start) })
      }
      const href = match[0]
      const replacements: Record<string, string> = {
        'https://hai.stanford.edu/news/ai-agents-simulate-1052-individuals-personalities-with-impressive-accuracy': 'Stanford',
        'https://arxiv.org/abs/2304.03442': 'arXiv'
      }
      const linkText = replacements[href] ?? href
      parts.push({ type: 'link', text: linkText, href })
      lastIndex = end
    }
    if (lastIndex < normalized.length) {
      parts.push({ type: 'text', text: normalized.slice(lastIndex) })
    }
    result.push({ type: 'paragraph', parts })
  }

  for (const blk of blocks) {
    const lines = blk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    let i = 0
    // Gather intro paragraph lines until first list item
    const intro: string[] = []
    while (i < lines.length && !lines[i].startsWith('- ')) {
      intro.push(lines[i])
      i++
    }
    if (intro.length) {
      pushParagraph(intro.join(' '))
    }

    // If we have list items, collect contiguous list items into a single list
    if (i < lines.length && lines[i].startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].replace(/^\-\s*/, ''))
        i++
      }
      result.push({ type: 'list', items })
    }

    // Any remaining lines after the list become another paragraph
    if (i < lines.length) {
      pushParagraph(lines.slice(i).join(' '))
    }
  }

  return result
})

// Helpers: safe-escape HTML then bold specific labels
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')

const listLabelRegex = /^(Bits\s*Field|Bits\s*field|Nonce|Merkle\s*Root|Timestamp|Tx\s*Count)\s*:/
const listKeywordRegex = /(Bits\s*Field|Bits\s*field|Nonce|Merkle\s*Root|Timestamp|Tx\s*Count)/g

function formatListItemHtml(item: string): string {
  const escaped = escapeHtml(item.trim())
  const withLeading = escaped.replace(listLabelRegex, '<strong>$1:</strong> ')
  return withLeading.replace(listKeywordRegex, '<strong>$1</strong>')
}

function formatTextPartHtml(text: string, isFirstPart: boolean): string {
  let escaped = escapeHtml(text)
  if (isFirstPart) {
    escaped = escaped.replace(/^\s*Result:\s*/, (m: string) => `<strong>${m.trim()}</strong> `)
  }
  return escaped
}

// Collect current tab button elements from the tablist container
const buttons = ref<HTMLButtonElement[]>([])
const collectButtons = () => {
  const list = tablistRef.value
  if (!list) return
  buttons.value = Array.from(list.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[]
}

const measure = (index = activeIndex.value) => {
  const list = tablistRef.value
  const btn = buttons.value[index]
  if (!list || !btn) return
  indicatorX.value = btn.offsetLeft - list.scrollLeft
  indicatorW.value = btn.offsetWidth
}

const setActive = async (i: number) => {
  if (i === activeIndex.value) return
  activeIndex.value = i
  await nextTick()
  // Reset scroll for new tab content
  if (contentRef.value) contentRef.value.scrollTop = 0
  measure(i)
  checkOverflow()
  // Ensure active tab is visible in small viewports
  buttons.value[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

const focusNext = () => {
  const next = (activeIndex.value + 1) % props.tabs.length
  buttons.value[next]?.focus()
  setActive(next)
}

const focusPrev = () => {
  const prev = (activeIndex.value - 1 + props.tabs.length) % props.tabs.length
  buttons.value[prev]?.focus()
  setActive(prev)
}

const handleResize = () => measure()

// Scrollable content handling
const contentRef = ref<HTMLElement | null>(null)
let currentContentEl: HTMLElement | null = null
const showScrollHint = ref(false)
const checkOverflow = () => {
  const el = contentRef.value
  if (!el) return
  const canScroll = el.scrollHeight > el.clientHeight
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
  showScrollHint.value = canScroll && !atBottom
}
const onContentScroll = () => checkOverflow()
const attachContentScroll = () => {
  const el = contentRef.value
  if (currentContentEl && currentContentEl !== el) {
    currentContentEl.removeEventListener('scroll', onContentScroll)
  }
  if (el && currentContentEl !== el) {
    el.addEventListener('scroll', onContentScroll, { passive: true })
    currentContentEl = el
  }
}

onMounted(async () => {
  await nextTick()
  collectButtons()
  measure()
  window.addEventListener('resize', handleResize)
  tablistRef.value?.addEventListener('scroll', handleResize, { passive: true })
  // content scroll listeners
  attachContentScroll()
  checkOverflow()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  tablistRef.value?.removeEventListener('scroll', handleResize)
  currentContentEl?.removeEventListener('scroll', onContentScroll)
})

// If tabs prop changes size, re-measure after DOM updates
watch(() => props.tabs.length, async () => {
  await nextTick()
  collectButtons()
  measure()
  checkOverflow()
})

// Re-check on active index changes (e.g., external prop change) just in case
watch(activeIndex, async () => {
  await nextTick()
  attachContentScroll()
  checkOverflow()
})
</script>

<style scoped>
/* No additional styles; Tailwind classes handle visuals */
/* Shimmering outline for tab header */
.shimmer-border {
  position: relative;
  /* Subtle static edge so border exists even if animations are off */
  box-shadow: inset 0 0 0 1px rgba(255, 149, 0, 0.2);
  border: 1px solid rgba(255, 149, 0, 0.18);
}
.shimmer-border::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 2px; /* border thickness */
  border-radius: 9999px; /* full pill */
  /* Narrow moving highlight for SHIMMER (not glow) */
  background: linear-gradient(90deg,
    rgba(255,149,0,0.0) 0%,
    rgba(255,149,0,0.0) 40%,
    rgba(255,149,0,0.95) 50%,
    rgba(255,149,0,0.0) 60%,
    rgba(255,149,0,0.0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 4.6s linear infinite;
  pointer-events: none;
  z-index: 5; /* ensure border sits above fade edges and indicator */
  /* mask out the center to leave only the border */
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Hide scrollbars for a cleaner look on small screens */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Subtle gradient fade at horizontal edges to hint overflow */
.fade-edges { position: relative; }
/* Use only ::after here so we don't conflict with shimmer-border::before */
.fade-edges::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1; /* keep below shimmering border */
  background-repeat: no-repeat;
  background-image:
    linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0)),
    linear-gradient(to left, rgba(0,0,0,0.7), rgba(0,0,0,0));
  background-size: 20px 100%, 20px 100%;
  background-position: left center, right center;
  border-radius: 9999px;
}

/* Real element fallback for orange outline (some browsers mishandle ::before masking) */
.tab-outline {
  z-index: 2; /* above fade edges, below buttons (which are z-10) */
  /* Remove heavy shadows to avoid glow; rely on sliding highlight */
  /* Animated gradient stroke look */
  background: linear-gradient(90deg,
    rgba(255,149,0,0.0) 0%,
    rgba(255,149,0,0.0) 40%,
    rgba(255,149,0,0.95) 50%,
    rgba(255,149,0,0.0) 60%,
    rgba(255,149,0,0.0) 100%
  );
  background-size: 200% 100%;
  border-radius: 9999px;
  animation: shimmer 4.6s linear infinite;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  padding: 2px; /* create the hollow center */
}
</style>
