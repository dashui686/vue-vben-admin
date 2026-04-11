import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:code-braces',
      order: 9995,
      title: $t('tool.title'),
    },
    name: 'Tool',
    path: '/tool',
    children: [
      {
        path: '/tool/gen',
        name: 'ToolGen',
        meta: {
          icon: 'mdi:table-arrow',
          title: $t('tool.gen.title'),
        },
        component: () => import('#/views/tool/gen/list.vue'),
      },
      {
        path: '/tool/gen-edit/:tableId',
        name: 'ToolGenEdit',
        meta: {
          hideInMenu: true,
          title: '编辑生成配置',
        },
        component: () => import('#/views/tool/gen/edit-table.vue'),
      },
    ],
  },
];

export default routes;
