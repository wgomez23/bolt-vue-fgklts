import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import NatPaper from '../pages/NatPaper.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/natpaper', name: 'natpaper', component: NatPaper },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
