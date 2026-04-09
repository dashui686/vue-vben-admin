import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:account-multiple',
          title: $t('system.user.title'),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: '/system/role/allocate-user/:roleId',
        name: 'SystemRoleAllocateUser',
        meta: {
          hideInMenu: true,
          title: '分配用户',
        },
        component: () => import('#/views/system/role/allocate-user.vue'),
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        meta: {
          icon: 'mdi:menu',
          title: $t('system.menu.title'),
        },
        component: () => import('#/views/system/menu/list.vue'),
      },
      {
        path: '/system/dept',
        name: 'SystemDept',
        meta: {
          icon: 'charm:organisation',
          title: $t('system.dept.title'),
        },
        component: () => import('#/views/system/dept/list.vue'),
      },
      {
        path: '/system/post',
        name: 'SystemPost',
        meta: {
          icon: 'mdi:badge-account-horizontal',
          title: $t('system.post.title'),
        },
        component: () => import('#/views/system/post/list.vue'),
      },
      {
        path: '/system/dict',
        name: 'SystemDict',
        meta: {
          icon: 'mdi:book-open-page-variant',
          title: $t('system.dict.title'),
        },
        component: () => import('#/views/system/dict/list.vue'),
      },
      {
        path: '/system/config',
        name: 'SystemConfig',
        meta: {
          icon: 'mdi:cog-outline',
          title: $t('system.config.title'),
        },
        component: () => import('#/views/system/config/list.vue'),
      },
      {
        path: '/system/notice',
        name: 'SystemNotice',
        meta: {
          icon: 'mdi:bell-outline',
          title: $t('system.notice.title'),
        },
        component: () => import('#/views/system/notice/list.vue'),
      },
      {
        path: '/system/client',
        name: 'SystemClient',
        meta: {
          icon: 'mdi:cellphone-link',
          title: $t('system.client.title'),
        },
        component: () => import('#/views/system/client/list.vue'),
      },
      {
        path: '/system/tenant',
        name: 'SystemTenant',
        meta: {
          icon: 'mdi:office-building',
          title: $t('system.tenant.title'),
        },
        component: () => import('#/views/system/tenant/list.vue'),
      },
      {
        path: '/system/tenant-package',
        name: 'SystemTenantPackage',
        meta: {
          icon: 'mdi:package-variant-closed',
          title: $t('system.tenantPackage.title'),
        },
        component: () => import('#/views/system/tenant-package/list.vue'),
      },
    ],
  },
];

export default routes;
