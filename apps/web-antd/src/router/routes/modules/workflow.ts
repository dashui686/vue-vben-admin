import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:sitemap-outline',
      order: 9995,
      title: '流程管理',
    },
    name: 'Workflow',
    path: '/workflow',
    children: [
      {
        path: '/workflow/category',
        name: 'WorkflowCategory',
        meta: {
          icon: 'mdi:folder-outline',
          title: '流程分类',
        },
        component: () => import('#/views/workflow/category/index.vue'),
      },
      {
        path: '/workflow/processDefinition',
        name: 'WorkflowProcessDefinition',
        meta: {
          icon: 'mdi:file-document-outline',
          title: '流程定义',
        },
        component: () => import('#/views/workflow/processDefinition/index.vue'),
      },
      {
        path: '/workflow/design/index',
        name: 'WorkflowDesign',
        meta: {
          hideInMenu: true,
          title: '流程设计',
        },
        component: () =>
          import('#/views/workflow/processDefinition/design.vue'),
      },
      {
        path: '/workflow/processInstance',
        name: 'WorkflowProcessInstance',
        meta: {
          icon: 'mdi:play-circle-outline',
          title: '流程实例',
        },
        component: () => import('#/views/workflow/processInstance/index.vue'),
      },
      {
        path: '/workflow/spel',
        name: 'WorkflowSpel',
        meta: {
          icon: 'mdi:code-braces',
          title: '流程表达式',
        },
        component: () => import('#/views/workflow/spel/index.vue'),
      },
      {
        path: '/workflow/task/taskWaiting',
        name: 'WorkflowTaskWaiting',
        meta: {
          icon: 'mdi:clock-outline',
          title: '我的待办',
        },
        component: () => import('#/views/workflow/task/taskWaiting.vue'),
      },
      {
        path: '/workflow/task/taskFinish',
        name: 'WorkflowTaskFinish',
        meta: {
          icon: 'mdi:check-circle-outline',
          title: '我的已办',
        },
        component: () => import('#/views/workflow/task/taskFinish.vue'),
      },
      {
        path: '/workflow/task/allTaskWaiting',
        name: 'WorkflowAllTaskWaiting',
        meta: {
          hideInMenu: true,
          title: '所有待办',
        },
        component: () => import('#/views/workflow/task/allTaskWaiting.vue'),
      },
      {
        path: '/workflow/task/myDocument',
        name: 'WorkflowMyDocument',
        meta: {
          icon: 'mdi:file-send-outline',
          title: '我的发起',
        },
        component: () => import('#/views/workflow/task/myDocument.vue'),
      },
      {
        path: '/workflow/task/taskCopyList',
        name: 'WorkflowTaskCopyList',
        meta: {
          icon: 'mdi:content-copy',
          title: '抄送给我',
        },
        component: () => import('#/views/workflow/task/taskCopyList.vue'),
      },
      {
        path: '/workflow/leave',
        name: 'WorkflowLeave',
        meta: {
          icon: 'mdi:calendar-remove-outline',
          title: '请假申请',
        },
        component: () => import('#/views/workflow/leave/index.vue'),
      },
      {
        path: '/workflow/leaveEdit/index',
        name: 'WorkflowLeaveEdit',
        meta: {
          hideInMenu: true,
          title: '请假编辑',
        },
        component: () => import('#/views/workflow/leave/leaveEdit.vue'),
      },
    ],
  },
];

export default routes;
