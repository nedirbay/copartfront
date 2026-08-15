import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

import LoginView from '@/views/LoginView.vue'
import VehiclesListView from '@/views/VehiclesListView.vue'
import VehicleDetailView from '@/views/VehicleDetailView.vue'
import EmployeesView from '@/views/EmployeesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true }
    },
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/vehicles'
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          component: VehiclesListView
        },
        {
          path: 'vehicles/:vin',
          name: 'vehicle-detail',
          component: VehicleDetailView
        },
        {
          path: 'employees',
          name: 'employees',
          component: EmployeesView,
          meta: { adminOnly: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/vehicles'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Fetch profile if token exists but user profile not loaded yet
  if (authStore.token && !authStore.user) {
    await authStore.fetchUserProfile()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' })
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'vehicles' })
  }

  if (to.meta.adminOnly && !authStore.isAdmin) {
    return next({ name: 'vehicles' })
  }

  next()
})

export default router
