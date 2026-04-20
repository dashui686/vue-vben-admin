/**
 * Workflow dict options for renderDict
 */
export const WF_BUSINESS_STATUS = [
  { label: '草稿', value: 'draft', color: 'default' },
  { label: '待审核', value: 'waiting', color: 'processing' },
  { label: '已完成', value: 'finish', color: 'success' },
  { label: '已取消', value: 'cancel', color: 'warning' },
  { label: '已退回', value: 'back', color: 'error' },
  { label: '已作废', value: 'invalid', color: 'default' },
  { label: '已终止', value: 'termination', color: 'error' },
];

export const WF_TASK_STATUS = [
  { label: '待审批', value: 'waiting', color: 'processing' },
  { label: '已审批', value: 'finish', color: 'success' },
  { label: '已转办', value: 'transfer', color: 'cyan' },
  { label: '已委派', value: 'depute', color: 'purple' },
  { label: '已终止', value: 'termination', color: 'error' },
  { label: '已退回', value: 'back', color: 'warning' },
];
