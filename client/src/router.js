import { createRouter, createWebHashHistory } from 'vue-router'
import { authGuard } from '@bcwdev/auth0provider-client'

function loadPage(page) {
  return () => import(`./pages/${page}.vue`)
}

function loadComponent(component) {
  return () => import(`./components/${component}.vue`)
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: loadPage('HomePage')
  },
  {
    path: '/about',
    name: 'About',
    component: loadPage('AboutPage')
  },
  {
    path: '/account',
    name: 'Account',
    component: loadPage('AccountPage'),
    beforeEnter: authGuard
  },
  // 3D Library Routes
  {
    path: '/library',
    name: 'Library',
    component: loadComponent('ModelBrowser')
  },
  {
    path: '/models/:id',
    name: 'ModelDetail',
    component: loadComponent('ModelDetail')
  },
  {
    path: '/order',
    name: 'OrderForm',
    component: loadPage('OrderForm'),
    beforeEnter: authGuard
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: loadPage('AdminDashboard'),
    beforeEnter: authGuard
  },
  {
    path: '/admin/upload',
    name: 'ModelUploadForm',
    component: loadPage('ModelUploadForm'),
    beforeEnter: authGuard
  }
]

export const router = createRouter({
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
  history: createWebHashHistory(),
  routes
})
