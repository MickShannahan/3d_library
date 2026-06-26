import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('../views/CreateView.vue')
    },
    {
      path: '/browse',
      name: 'browse',
      component: () => import('../views/BrowseView.vue'),
      redirect: { name: 'browse-models' },
      children: [
        {
          path: 'models',
          name: 'browse-models',
          component: () => import('../views/BrowseModelsView.vue')
        },
        {
          path: 'authors',
          name: 'browse-authors',
          component: () => import('../views/BrowseAuthorsView.vue')
        }
      ]
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue')
    },
    {
      path: '/print-preview',
      name: 'print preview',
      component: () => import('../views/PrintPreview.vue')
    },
    {
      path: '/print-order/:id',
      name: 'print-order',
      component: () => import('../views/PrintOrderView.vue')
    }
  ],
})

export default router
