import { createRouter, createWebHistory } from 'vue-router'
import HomeOverview from './views/HomeOverview.vue'
import SpotsOverview from './views/SpotsOverview.vue'
import SmartRecommend from './views/SmartRecommend.vue'
import RouteDetail from './views/RouteDetail.vue'
import TripResult from './views/TripResult.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: HomeOverview },
    { path: '/spots', component: SpotsOverview },
    { path: '/recommend', component: SmartRecommend },
    { path: '/route', component: RouteDetail },
    { path: '/result', component: TripResult },
  ],
})

export default router

