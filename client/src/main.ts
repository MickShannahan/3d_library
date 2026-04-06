import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/scss/style.scss'
import '@mdi/font/css/materialdesignicons.css'
import { logger } from './utils/Logger'

const app = createApp(App)

app.use(router)

const doubleClicks = {}

function doubleClick(id, fn, ...args) {
  if (doubleClicks[id]) return fn(...args)
  doubleClicks[id] = true
  setTimeout(() => delete doubleClicks[id], 250)
}

app.directive('doubleClick', {
  mounted: (el, binding, vnode) => {
    logger.log('registered double click', el)
    el.addEventListener('click', (ev: PointerEvent) => {
      logger.log('double click')
      if (binding.modifiers.stop) ev.stopPropagation()
      if (binding.modifiers.prevent) ev.preventDefault()
      doubleClick(vnode.key, binding.value, binding.arg)
    })
  },
})

app.directive('tooltip', {
  mounted: (el: Element, binding, vnode) => {
    el.style.position = 'relative'
    el.classList.add('glass-popup')
    el.setAttribute('data-tooltip', binding.value)
  },
  updated: (el: Element, binding) => {
    el.setAttribute('data-tooltip', binding.value)
  }
})

app.mount('#app')
