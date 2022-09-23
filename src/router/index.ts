import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory('/exam-mob/'),
  routes: [
    {
      path: '/explain',
      name: 'explain',
      component: () => import('@/views/explain/index.vue')
    },
    {
      path: '/protocol',
      name: 'protocol',
      component: () => import('@/views/protocol/index.vue')
    },
    {
      path: '/faceVerification',
      name: 'faceVerification',
      component: () => import('@/views/faceVerification/index.vue')
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
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('@/views/record/index.vue')
    },
    {
      path: '/onlyPc',
      name: 'onlyPc',
      component: () => import('@/views/onlyPc/index.vue')
    },
  ]
})

export default router