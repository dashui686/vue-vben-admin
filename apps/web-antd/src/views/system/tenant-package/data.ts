import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemTenantPackageApi } from '#/api/system/tenantPackage';

import { z } from '#/adapter/form';
import { getMenuTreeselect } from '#/api/system/menu';
import {
  operationColumn,
  remarkField,
  statusColumn,
  statusRadioField,
  statusSelectField,
} from '#/composables/useDataHelper';
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
    statusSelectField($t('system.tenantPackage.status')),
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
    statusRadioField($t('system.tenantPackage.status')),
    remarkField($t('system.tenantPackage.remark')),
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
    statusColumn(
      $t('system.tenantPackage.status'),
      onStatusChange,
      'system:tenantPackage:edit',
    ),
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
    operationColumn(
      $t('system.tenantPackage.operation'),
      onActionClick,
      [
        {
          auth: 'system:tenantPackage:edit',
          code: 'edit',
          text: $t('common.edit'),
        },
        {
          auth: 'system:tenantPackage:remove',
          code: 'delete',
          text: $t('common.delete'),
        },
      ],
      'packageName',
      $t('system.tenantPackage.name'),
    ),
  ];
}
