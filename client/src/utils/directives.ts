import type { App } from 'vue'
import { generateId } from './GenerateId'
import { logger } from './Logger'

// ─── Double-click directive ───────────────────────────────────────────────────
const doubleClicks: Record<string, boolean> = {}

function fireDoubleClick(id: string, fn: (...args: any[]) => any, ...args: any[]) {
  if (doubleClicks[id]) return fn(...args)
  doubleClicks[id] = true
  setTimeout(() => delete doubleClicks[id], 250)
}

const doubleClickDirective = {
  mounted(el: HTMLElement, binding: any, vnode: any) {
    logger.log('registered double click', el)
    el.addEventListener('click', (ev: PointerEvent) => {
      logger.log('double click')
      if (binding.modifiers.stop) ev.stopPropagation()
      if (binding.modifiers.prevent) ev.preventDefault()
      fireDoubleClick(vnode.key, binding.value, binding.arg)
    })
  },
}

// ─── Tooltip directive ────────────────────────────────────────────────────────
function positionTooltip(tooltip: HTMLElement, el: HTMLElement) {
  tooltip.style.position = 'fixed'

  // offsetWidth/offsetHeight are unaffected by CSS transform:scale(0),
  // so we get the real dimensions even before .show is applied.
  const tw = tooltip.offsetWidth
  const th = tooltip.offsetHeight
  const elementBounds = el.getBoundingClientRect()

  const padding = 12
  const gap = 8

  let left = elementBounds.left + elementBounds.width / 2 - tw / 2
  let top = elementBounds.top - th - gap

  left = Math.max(padding, left)
  left = Math.min(window.innerWidth - tw - padding, left)

  if (top < padding) {
    top = elementBounds.bottom + gap
  }

  tooltip.style.top = top + 'px'
  tooltip.style.left = left + 'px'
}

const tooltipDirective = {
  mounted(el: HTMLElement, binding: any) {
    let tooltip: HTMLElement | null = null

    const mouseEnterListener = () => {
      if (tooltip) tooltip.remove()

      tooltip = document.createElement('span')
      tooltip.classList.add('glass-popup')
      tooltip.innerHTML = binding.value
      document.body.appendChild(tooltip)

      positionTooltip(tooltip, el)
      tooltip.classList.add('show')

        ; (el as any)._tooltipEl = tooltip
    }

    const mouseLeaveListener = () => {
      tooltip?.classList.remove('show')
    }

    el.addEventListener('mouseenter', mouseEnterListener)
    el.addEventListener('mouseleave', mouseLeaveListener)

      ; (el as any)._tooltipCleanup = { mouseEnterListener, mouseLeaveListener }
  },

  updated(el: HTMLElement, binding: any) {
    // Update content and reposition if currently visible
    const tooltip: HTMLElement | null = (el as any)._tooltipEl ?? null
    if (!tooltip) return
    tooltip.innerHTML = binding.value
    positionTooltip(tooltip, el)
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any)._tooltipCleanup
    if (cleanup) {
      el.removeEventListener('mouseenter', cleanup.mouseEnterListener)
      el.removeEventListener('mouseleave', cleanup.mouseLeaveListener)
    }
    const tooltip: HTMLElement | null = (el as any)._tooltipEl ?? null
    tooltip?.remove()
    delete (el as any)._tooltipCleanup
    delete (el as any)._tooltipEl
  },
}

// ─── Register all directives ──────────────────────────────────────────────────
export function registerDirectives(app: App) {
  app.directive('doubleClick', doubleClickDirective)
  app.directive('tooltip', tooltipDirective)
}
