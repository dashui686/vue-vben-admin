import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:monitor-dashboard',
      order: 9996,
      title: $t('monitor.title'),
    },
    name: 'Monitor',
    path: '/monitor',
    children: [
      {
        path: '/monitor/operlog',
        name: 'MonitorOperlog',
        meta: {
          icon: 'mdi:clipboard-text-outline',
          title: $t('monitor.operlog.title'),
        },
        component: () => import('#/views/monitor/operlog/list.vue'),
      },
      {
        path: '/monitor/logininfor',
        name: 'MonitorLogininfor',
        meta: {
          icon: 'mdi:login',
          title: $t('monitor.logininfor.title'),
        },
        component: () => import('#/views/monitor/logininfor/list.vue'),
      },
      {
        path: '/monitor/online',
        name: 'MonitorOnline',
        meta: {
          icon: 'mdi:account-online',
          title: $t('monitor.online.title'),
        },
        component: () => import('#/views/monitor/online/list.vue'),
      },
      {
        path: '/monitor/cache',
        name: 'MonitorCache',
        meta: {
          icon: 'mdi:database-outline',
          title: $t('monitor.cache.title'),
        },
        component: () => import('#/views/monitor/cache/list.vue'),
      },
      {
        path: '/monitor/cache/list',
        name: 'MonitorCacheList',
        meta: {
          icon: 'mdi:format-list-bulleted',
          title: $t('monitor.cache.list'),
        },
        component: () => import('#/views/monitor/cache/cache-list.vue'),
      },
      {
        path: '/monitor/job',
        name: 'MonitorJob',
        meta: {
          icon: 'mdi:clock-outline',
          title: $t('monitor.job.title'),
        },
        component: () => import('#/views/monitor/job/list.vue'),
      },
      {
        path: '/monitor/job-log',
        name: 'MonitorJobLog',
        meta: {
          hideInMenu: true,
          title: $t('monitor.job.log'),
        },
        component: () => import('#/views/monitor/job/log.vue'),
      },
    ],
  },
];

export default routes;
