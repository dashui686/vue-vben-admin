import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { MonitorJobApi } from '#/api/monitor/job';

import { z } from '#/adapter/form';
import { jobGroupMap } from '#/api/monitor/job';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'jobName',
      label: '任务名称',
      componentProps: {
        placeholder: '请输入任务名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'jobGroup',
      label: '任务组名',
      componentProps: {
        allowClear: true,
        placeholder: '请选择任务组名',
        options: Object.entries(jobGroupMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '任务状态',
      componentProps: {
        allowClear: true,
        placeholder: '请选择任务状态',
        options: [
          { label: '正常', value: '0' },
          { label: '暂停', value: '1' },
        ],
      },
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'jobName',
      label: '任务名称',
      rules: z.string().min(1, '任务名称不能为空'),
    },
    {
      component: 'Select',
      fieldName: 'jobGroup',
      label: '任务分组',
      rules: z.string().min(1, '任务分组不能为空'),
      componentProps: {
        placeholder: '请选择任务分组',
        options: Object.entries(jobGroupMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      component: 'Input',
      fieldName: 'invokeTarget',
      label: '调用方法',
      rules: z.string().min(1, '调用目标字符串不能为空'),
      help: "Bean调用示例：ryTask.ryParams('ry')",
      componentProps: {
        placeholder: '请输入调用目标字符串',
      },
    },
    {
      component: 'Input',
      fieldName: 'cronExpression',
      label: 'cron表达式',
      rules: z.string().min(1, 'cron执行表达式不能为空'),
      componentProps: {
        placeholder: '请输入cron执行表达式',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'misfirePolicy',
      label: '执行策略',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '立即执行', value: '1' },
          { label: '执行一次', value: '2' },
          { label: '放弃执行', value: '3' },
        ],
        optionType: 'button',
      },
      defaultValue: '1',
    },
    {
      component: 'RadioGroup',
      fieldName: 'concurrent',
      label: '是否并发',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '允许', value: '0' },
          { label: '禁止', value: '1' },
        ],
        optionType: 'button',
      },
      defaultValue: '1',
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '状态',
      dependencies: {
        show: (values) => !!values.jobId,
        triggerFields: ['jobId'],
      },
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '正常', value: '0' },
          { label: '暂停', value: '1' },
        ],
        optionType: 'button',
      },
      defaultValue: '0',
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<MonitorJobApi.SysJob>,
  onStatusChange?: (
    newStatus: string,
    row: MonitorJobApi.SysJob,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<MonitorJobApi.SysJob> {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    {
      field: 'jobName',
      title: '任务名称',
      minWidth: 120,
    },
    {
      field: 'jobGroup',
      title: '任务组名',
      width: 100,
      formatter: ({ cellValue }) => jobGroupMap[cellValue] || cellValue,
    },
    {
      field: 'invokeTarget',
      title: '调用目标字符串',
      minWidth: 200,
    },
    {
      field: 'cronExpression',
      title: 'cron执行表达式',
      width: 150,
    },
    {
      cellRender: {
        attrs: { auth: 'monitor:job:edit', beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: '状态',
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'jobName',
          nameTitle: '任务',
          onClick: onActionClick,
          maxInline: 2,
        },
        options: [
          { auth: 'monitor:job:edit', code: 'edit', text: '修改' },
          { auth: 'monitor:job:remove', code: 'delete', text: '删除' },
          { auth: 'monitor:job:edit', code: 'run', text: '执行一次' },
          { code: 'log', text: '调度日志' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 200,
    },
  ];
}
