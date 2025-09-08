import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { Access } from './utils/constants'

const app = createApp(App)
app.mixin(Access)
app.use(router)
app.mount('#app')
