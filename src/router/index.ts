import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: { title: 'Masuk' },
    },
    {
      path: '/',
      name: 'WMSDashboard',
      component: () => import('../views/WMS/Dashboard.vue'),
      meta: { title: 'Dashboard Gudang', requiresAuth: true },
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('../views/WMS/Inventory.vue'),
      meta: { title: 'Manajemen Inventaris', requiresAuth: true },
    },
    {
      path: '/inbound',
      name: 'Inbound',
      component: () => import('../views/WMS/Inbound.vue'),
      meta: { title: 'Proses Barang Masuk', requiresAuth: true },
    },
    {
      path: '/outbound',
      name: 'Outbound',
      component: () => import('../views/WMS/Outbound.vue'),
      meta: { title: 'Proses Barang Keluar', requiresAuth: true },
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/WMS/Users.vue'),
      meta: { title: 'Manajemen User', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('../views/WMS/Reports.vue'),
      meta: { title: 'Laporan & Analisis', requiresAuth: true },
    },
    {
      path: '/returns',
      name: 'Returns',
      component: () => import('../views/WMS/Returns.vue'),
      meta: { title: 'Manajemen Retur', requiresAuth: true },
    },
    {
      path: '/cycle-count',
      name: 'CycleCount',
      component: () => import('../views/WMS/CycleCount.vue'),
      meta: { title: 'Cycle Counting', requiresAuth: true },
    },
    {
      path: '/guide',
      name: 'Guide',
      component: () => import('../views/WMS/Guide.vue'),
      meta: { title: 'Panduan Penggunaan WMS', requiresAuth: true },
    },
    // Keep other routes as needed or omit for clarity in WMS
    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: { title: '404 Error' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | WMS Management`
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (to.meta.requiresAuth && !token) {
    next('/signin');
  } else if (to.meta.requiresAdmin && user.role !== 'admin') {
    next('/');
  } else {
    next();
  }
})

export default router
