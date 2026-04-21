import type { RouteRecordStringComponent } from '@vben/types';

import { $t } from '@vben/locales';

const localRoutes: RouteRecordStringComponent[] = [
  {
    component: '/_core/profile/index',
    meta: {
      hideInMenu: true,
      icon: 'mingcute:profile-line',
      requireHomeRedirect: true,
      title: $t('ui.widgets.profile'),
    },
    name: 'Profile',
    path: '/profile',
  },
];

export const localMenuList: RouteRecordStringComponent[] = [
  {
    children: [
      {
        meta: {
          affixTab: true,
          title: 'page.dashboard.analytics',
        },
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
      },
      {
        meta: {
          title: 'page.dashboard.workspace',
        },
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
      },
    ],
    component: 'BasicLayout',
    meta: {
      noBasicLayout: true,
      order: -1,
      title: 'page.dashboard.title',
    },
    name: 'Dashboard',
    path: '/',
    redirect: '/analytics',
  },
  {
    component: '/_core/about/index',
    meta: {
      icon: 'lucide:copyright',
      order: 9999,
      title: 'demos.vben.about',
    },
    name: 'About',
    path: '/vben-admin/about',
  },
  ...localRoutes,
];
