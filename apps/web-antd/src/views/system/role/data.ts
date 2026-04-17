import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import {
  operationColumn,
  statusColumn,
  statusSelectField,
} from '#/composables/useDataHelper';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.role.roleName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'roleKey',
      label: $t('system.role.roleKey'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'roleSort',
      label: $t('system.role.roleSort'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: '0' },
          { label: $t('common.disabled'), value: '1' },
        ],
        optionType: 'button',
      },
      defaultValue: '1',
      fieldName: 'status',
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'menuIds',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.role.roleName'),
    },
    statusSelectField($t('system.role.status')),
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('system.role.createTime'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    {
      field: 'roleName',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'roleKey',
      title: $t('system.role.roleKey'),
      width: 200,
    },
    {
      field: 'roleSort',
      title: $t('system.role.roleSort'),
      width: 200,
    },
    statusColumn($t('system.role.status'), onStatusChange, 'system:role:edit'),
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.role.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.role.createTime'),
      width: 200,
    },
    operationColumn(
      $t('system.role.operation'),
      onActionClick,
      [
        { auth: 'system:role:edit', code: 'edit', text: $t('common.edit') },
        { auth: 'system:role:remove', code: 'delete', text: $t('common.delete') },
        {
          auth: 'system:role:edit',
          code: 'allocateDataScope',
          text: $t('system.role.allocateDataScope'),
        },
        { auth: 'system:role:edit', code: 'allocateUser', text: $t('system.role.allocateUser') },
      ],
      'roleName',
      $t('system.role.roleName'),
      { align: 'right', maxInline: 2, width: 200 },
    ),
  ];
}
