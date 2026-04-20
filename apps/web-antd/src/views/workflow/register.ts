import { defineAsyncComponent, markRaw } from 'vue';

const LeaveDescription = defineAsyncComponent(
  () => import('#/views/workflow/leave/leave-description.vue'),
);

/**
 * key为流程的路径(task.formPath) value为要显示的组件
 */
export const flowComponentsMap = {
  '/workflow/leaveEdit/index': markRaw(LeaveDescription),
};

export type FlowComponentsMapMapKey = keyof typeof flowComponentsMap;
