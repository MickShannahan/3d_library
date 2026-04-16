import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/scss/style.scss'
import '@mdi/font/css/materialdesignicons.css'
import { registerDirectives } from './utils/directives'

const app = createApp(App)

app.use(router)
registerDirectives(app)

app.mount('#app')
