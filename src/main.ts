import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Access} from './utils/constants'
const app = createApp(App);
app.mixin(Access);
app.mount('#app')
