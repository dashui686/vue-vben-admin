import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemTenantPackageApi } from '#/api/system/tenantPackage';

import { z } from '#/adapter/form';
import { getMenuTreeselect } from '#/api/system/menu';
import { $t } from '#/locales';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'packageName',
      label: $t('system.tenantPackage.packageName'),
      componentProps: {
        placeholder: '请输入套餐名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.tenantPackage.status'),
      componentProps: {
        allowClear: true,
        placeholder: '请选择状态',
        options: [
          { label: $t('common.enabled'), value: '0' },
          { label: $t('common.disabled'), value: '1' },
        ],
      },
    },
  ];
}

/**
 * 编辑表单字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'packageName',
      label: $t('system.tenantPackage.packageName'),
      rules: z
        .string()
        .min(
          1,
          $t('ui.formRules.required', [$t('system.tenantPackage.packageName')]),
        ),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getMenuTreeselect,
        class: 'w-full',
        multiple: true,
        checkStrictly: true,
        labelField: 'label',
        valueField: 'value',
        childrenField: 'children',
        treeDefaultExpandAll: true,
        placeholder: '请选择关联菜单',
      },
      fieldName: 'menuIds',
      label: $t('system.tenantPackage.menuIds'),
    },
    {
      component: 'Switch',
      fieldName: 'menuCheckStrictly',
      label: $t('system.tenantPackage.menuCheckStrictly'),
      defaultValue: true,
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
      label: $t('system.tenantPackage.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.tenantPackage.remark'),
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemTenantPackageApi.SystemTenantPackage>,
  onStatusChange?: (
    newStatus: any,
    row: SystemTenantPackageApi.SystemTenantPackage,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemTenantPackageApi.SystemTenantPackage> {
  return [
    { type: 'checkbox', width: 50 },
    {
      type: 'seq',
      width: 50,
      title: '#',
    },
    {
      field: 'packageName',
      title: $t('system.tenantPackage.packageName'),
      minWidth: 150,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.tenantPackage.status'),
      width: 100,
    },
    {
      field: 'remark',
      title: $t('system.tenantPackage.remark'),
      minWidth: 150,
    },
    {
      field: 'createTime',
      title: $t('system.tenantPackage.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'packageName',
          nameTitle: $t('system.tenantPackage.name'),
          onClick: onActionClick,
        },
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.tenantPackage.operation'),
    },
  ];
}
