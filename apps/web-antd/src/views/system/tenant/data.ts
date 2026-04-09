import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api/system/tenant';

import { z } from '#/adapter/form';
import { getTenantPackageSelectList } from '#/api/system/tenantPackage';
import { $t } from '#/locales';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'companyName',
      label: $t('system.tenant.companyName'),
      componentProps: {
        placeholder: '请输入企业名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'contactUserName',
      label: $t('system.tenant.contactUserName'),
      componentProps: {
        placeholder: '请输入联系人',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.tenant.status'),
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
      fieldName: 'companyName',
      label: $t('system.tenant.companyName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.tenant.companyName')])),
    },
    {
      component: 'Input',
      fieldName: 'contactUserName',
      label: $t('system.tenant.contactUserName'),
      rules: z
        .string()
        .min(
          1,
          $t('ui.formRules.required', [$t('system.tenant.contactUserName')]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'contactPhone',
      label: $t('system.tenant.contactPhone'),
      rules: z
        .string()
        .min(
          1,
          $t('ui.formRules.required', [$t('system.tenant.contactPhone')]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.tenant.username'),
      dependencies: {
        show: (values) => !values.id,
        triggerFields: ['id'],
      },
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.tenant.username')])),
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: $t('system.tenant.password'),
      dependencies: {
        show: (values) => !values.id,
        triggerFields: ['id'],
      },
      componentProps: {
        type: 'password',
        placeholder: '请输入密码',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'packageId',
      label: $t('system.tenant.packageId'),
      componentProps: {
        api: getTenantPackageSelectList,
        labelField: 'packageName',
        valueField: 'packageId',
        placeholder: '请选择租户套餐',
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'expireTime',
      label: $t('system.tenant.expireTime'),
      componentProps: {
        class: 'w-full',
        showTime: true,
        placeholder: '请选择过期时间',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'accountCount',
      label: $t('system.tenant.accountCount'),
      componentProps: {
        min: -1,
        placeholder: '用户数量（-1不限制）',
      },
      defaultValue: -1,
    },
    {
      component: 'Input',
      fieldName: 'licenseNumber',
      label: $t('system.tenant.licenseNumber'),
      componentProps: {
        placeholder: '请输入统一社会信用代码',
      },
    },
    {
      component: 'Input',
      fieldName: 'domain',
      label: $t('system.tenant.domain'),
      componentProps: {
        placeholder: '请输入域名',
      },
    },
    {
      component: 'Input',
      fieldName: 'address',
      label: $t('system.tenant.address'),
      componentProps: {
        placeholder: '请输入地址',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'intro',
      label: $t('system.tenant.intro'),
      componentProps: {
        placeholder: '请输入企业简介',
        rows: 3,
      },
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
      label: $t('system.tenant.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.tenant.remark'),
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
  onActionClick?: OnActionClickFn<SystemTenantApi.SystemTenant>,
  onStatusChange?: (
    newStatus: any,
    row: SystemTenantApi.SystemTenant,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemTenantApi.SystemTenant> {
  return [
    {
      type: 'seq',
      width: 50,
      title: '#',
    },
    {
      field: 'companyName',
      title: $t('system.tenant.companyName'),
      minWidth: 150,
    },
    {
      field: 'contactUserName',
      title: $t('system.tenant.contactUserName'),
      width: 120,
    },
    {
      field: 'contactPhone',
      title: $t('system.tenant.contactPhone'),
      width: 130,
    },
    {
      field: 'expireTime',
      title: $t('system.tenant.expireTime'),
      width: 180,
    },
    {
      field: 'accountCount',
      title: $t('system.tenant.accountCount'),
      width: 100,
      align: 'center',
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.tenant.status'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.tenant.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'companyName',
          nameTitle: $t('system.tenant.name'),
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
      title: $t('system.tenant.operation'),
    },
  ];
}
