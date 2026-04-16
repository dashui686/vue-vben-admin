import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemClientApi } from '#/api/system/client';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

const grantTypeOptions = [
  { label: '密码模式', value: 'password' },
  { label: '客户端模式', value: 'client_credentials' },
  { label: '授权码模式', value: 'authorization_code' },
  { label: '简化模式', value: 'implicit' },
  { label: '刷新令牌', value: 'refresh_token' },
];

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'clientKey',
      label: $t('system.client.clientKey'),
      componentProps: { placeholder: '请输入客户端key' },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.client.status'),
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

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'clientKey',
      label: $t('system.client.clientKey'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.client.clientKey')])),
    },
    {
      component: 'Input',
      fieldName: 'clientSecret',
      label: $t('system.client.clientSecret'),
      rules: z
        .string()
        .min(
          1,
          $t('ui.formRules.required', [$t('system.client.clientSecret')]),
        ),
    },
    {
      component: 'Select',
      fieldName: 'grantTypeList',
      label: $t('system.client.grantType'),
      rules: z
        .array(z.string())
        .min(1, $t('ui.formRules.required', [$t('system.client.grantType')])),
      componentProps: {
        mode: 'multiple',
        placeholder: '请选择授权类型',
        options: grantTypeOptions,
      },
    },
    {
      component: 'Input',
      fieldName: 'deviceType',
      label: $t('system.client.deviceType'),
      componentProps: { placeholder: '请输入设备类型' },
    },
    {
      component: 'InputNumber',
      fieldName: 'activeTimeout',
      label: $t('system.client.activeTimeout'),
      componentProps: { placeholder: '活跃超时时间(秒)', min: -1 },
    },
    {
      component: 'InputNumber',
      fieldName: 'timeout',
      label: $t('system.client.timeout'),
      componentProps: { placeholder: '固定超时时间(秒)', min: -1 },
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
      label: $t('system.client.status'),
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<SystemClientApi.SystemClient>,
  onStatusChange?: (
    newStatus: any,
    row: SystemClientApi.SystemClient,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemClientApi.SystemClient> {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    { field: 'clientKey', title: $t('system.client.clientKey'), minWidth: 120 },
    {
      field: 'clientSecret',
      title: $t('system.client.clientSecret'),
      minWidth: 150,
    },
    { field: 'grantType', title: $t('system.client.grantType'), minWidth: 150 },
    { field: 'deviceType', title: $t('system.client.deviceType'), width: 100 },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.client.status'),
      width: 100,
    },
    { field: 'createTime', title: $t('system.client.createTime'), width: 180 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'clientKey',
          nameTitle: $t('system.client.name'),
          onClick: onActionClick,
        },
        options: [
          { code: 'edit', text: $t('common.edit') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.client.operation'),
    },
  ];
}
