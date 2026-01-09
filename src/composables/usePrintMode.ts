import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable to detect if the app is in print mode.
 * Print mode is active when:
 * - The current route is '/natpaper-print'
 * - OR the query param '?print=true' is present
 */
export function usePrintMode() {
  const route = useRoute()

  const isPrintMode = computed(() => {
    return route.path === '/natpaper-print' || route.query.print === 'true'
  })

  return {
    isPrintMode
  }
}
