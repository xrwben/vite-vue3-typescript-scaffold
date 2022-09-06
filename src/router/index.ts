import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/explain'
    },
    {
      path: '/explain',
      name: 'explain',
      component: () => import('@/views/explain/index.vue')
    },
    {
      path: '/answer',
      name: 'answer',
      component: () => import('@/views/answer/index.vue')
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('@/views/analysis/index.vue')
    }
  ]
})

export default router