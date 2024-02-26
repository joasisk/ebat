import { auth_service } from '@/services/auth.service';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export const ROUTES = {
  REQUESTS: {
    path: '/',
    name: 'Home',
    menu: true,
    menuLevel: 0,
    authorized: true,
    roles: [
      'Dealmaker',
      'Approver',
      'Reviewer1',
      'Reviewer2',
      'Reviewer3',
      'Admin',
      'Reader',
      'Annuity'
    ],
    icon: 'mdi-form-select',
    component: () => import('../views/Home.vue')
  },

  REQUEST: {
    path: '/request/:id?',
    name: 'Deal view',
    menu: false,
    authorized: true,
    roles: [
      'Dealmaker',
      'Approver',
      'Reviewer1',
      'Reviewer2',
      'Reviewer3',
      'Admin',
      'Reader',
      'Annuity'
    ],
    component: () => import('../views/DealView.vue')
  },

  ADMIN: {
    path: '/',
    name: 'Admin',
    menu: true,
    menuLevel: 0,
    authorized: true,
    roles: ['Admin'],
    icon: 'mdi-cog',
    child: ['User accesses', 'Geography', 'Form Edit']
  },

  USER_ACCESSES: {
    path: '/admin/user_accesses',
    name: 'User accesses',
    menu: true,
    menuLevel: 1,
    authorized: true,
    roles: ['Admin'],
    icon: 'mdi-account-cog',
    component: () => import('../views/UserManagement.vue')
  },

  GEOGRAPHY: {
    path: '/admin/geography',
    name: 'Geography',
    menu: true,
    menuLevel: 1,
    authorized: true,
    roles: ['Admin'],
    icon: 'mdi-earth',
    component: () => import('../views/Geography.vue')
  },

  FORM_EDIT: {
    path: '/admin/form-edit',
    name: 'Form Edit',
    menu: true,
    menuLevel: 1,
    authorized: true,
    roles: ['Admin'],
    icon: 'mdi-clipboard-edit',
    component: () => import('../views/FormEdit.vue')
  },

  ACCESS: {
    path: '/',
    name: 'Access',
    menu: true,
    menuLevel: 0,
    authorized: true,
    roles: [
      'Dealmaker',
      'Approver',
      'Reviewer1',
      'Reviewer2',
      'Reviewer3',
      'Admin',
      'Reader',
      'Annuity',
      'SysAdmin'
    ],
    icon: 'mdi-account',
    child: ['Access request', 'Delegation']
  },

  ACCESS_REQUEST: {
    path: '/access/access_request',
    name: 'Access request',
    menu: true,
    menuLevel: 1,
    authorized: true,
    roles: null,
    icon: 'mdi-account-question',
    component: () => import('../views/AccessRequest.vue')
  },

  DELEGATION: {
    path: '/access/delegation',
    name: 'Delegation',
    menu: true,
    menuLevel: 1,
    authorized: true,
    roles: ['Dealmaker', 'Reviewer1', 'Reviewer2', 'Reviewer3'],
    icon: 'mdi-account-multiple',
    component: () => import('../views/AccessDelegation.vue')
  },

  LOGOUT: {
    path: '/logout',
    name: 'Logout',
    menu: false,
    authorized: false,
    component: () => import('../views/Logout.vue')
  },

  APIDOWN: {
    path: '/apidown',
    name: 'APIDown',
    menu: false,
    authorized: false,
    component: () => import('../views/ApiDown.vue')
  },

  COMPARE: {
    path: '/compare/:id',
    name: 'Compare',
    menu: false,
    authorized: true,
    roles: [
      'Dealmaker',
      'Approver',
      'Reviewer1',
      'Reviewer2',
      'Reviewer3',
      'Reader',
      'Admin',
      'Annuity'
    ],
    component: () => import('../views/IterationCompare.vue')
  },
  REPAIR_COMPARE: {
    path: '/repair_compare/:id',
    name: 'Repair compare',
    menu: false,
    authorized: true,
    roles: [
      'Dealmaker',
      'Approver',
      'Reviewer1',
      'Reviewer2',
      'Reviewer3',
      'Reader',
      'Admin',
      'Annuity'
    ],
    component: () => import('../views/RepairBidCompare.vue')
  },

  ANNOUNCEMENTS: {
    path: '/announcements',
    name: 'Announcements',
    menu: true,
    menuLevel: 0,
    authorized: true,
    roles: ['Admin', 'SysAdmin'],
    icon: 'mdi-bullhorn-outline',
    component: () => import('../views/Announcements.vue')
  },

  FEEDBACK: {
    path: '/feedback',
    name: 'Contact support',
    menu: true,
    menuLevel: 0,
    authorized: true,
    roles: null,
    icon: 'mdi-message-alert-outline',
    component: () => import('../views/Feedback.vue')
  },

  FORBIDDEN: {
    path: '/forbidden',
    name: 'forbidden',
    menu: false,
    authorized: true,
    roles: [
      'Dealmaker',
      'Approver',
      'Reviewer1',
      'Reviewer2',
      'Reviewer3',
      'Reader',
      'Admin',
      'Annuity'
    ],
    component: () => import('../views/Forbidden.vue')
  },

  NOTFOUND: {
    path: '/*',
    name: 'Not_Found',
    menu: false,
    authorized: false,
    component: () => import('@/views/404.vue')
  }
};

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: Object.keys(ROUTES).map(key => ROUTES[key])
});

router.beforeEach((to, from, next) => {
  auth_service.authRouteGuard(to, from, next);
});

export default router;
