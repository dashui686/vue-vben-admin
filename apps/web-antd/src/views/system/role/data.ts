import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

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
      defaultValue: '0',
      fieldName: 'status',
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
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
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('system.role.id'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: '0' },
          { label: $t('common.disabled'), value: '1' },
        ],
      },
      fieldName: 'status',
      label: $t('system.role.status'),
    },
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
    {
      field: 'roleName',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 100,
    },
    {
      field: 'roleKey',
      title: $t('system.role.roleKey'),
      width: 150,
    },
    {
      field: 'roleSort',
      title: $t('system.role.roleSort'),
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },
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
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'roleName',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
