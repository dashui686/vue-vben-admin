import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemConfigApi } from '#/api/system/config';

import { z } from '#/adapter/form';
import { operationColumn, remarkField } from '#/composables/useDataHelper';
import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'configName',
      label: $t('system.config.configName'),
      componentProps: { placeholder: '请输入参数名称' },
    },
    {
      component: 'Input',
      fieldName: 'configKey',
      label: $t('system.config.configKey'),
      componentProps: { placeholder: '请输入参数键名' },
    },
    {
      component: 'Select',
      fieldName: 'configType',
      label: $t('system.config.configType'),
      componentProps: {
        allowClear: true,
        placeholder: '请选择系统内置',
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
      },
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'configName',
      label: $t('system.config.configName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.config.configName')])),
    },
    {
      component: 'Input',
      fieldName: 'configKey',
      label: $t('system.config.configKey'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.config.configKey')])),
    },
    {
      component: 'Input',
      fieldName: 'configValue',
      label: $t('system.config.configValue'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.config.configValue')])),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
      },
      defaultValue: 'N',
      fieldName: 'configType',
      label: $t('system.config.configType'),
    },
    remarkField($t('system.config.remark')),
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<SystemConfigApi.SystemConfig>,
): VxeTableGridColumns<SystemConfigApi.SystemConfig> {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    {
      field: 'configName',
      title: $t('system.config.configName'),
      minWidth: 150,
    },
    { field: 'configKey', title: $t('system.config.configKey'), minWidth: 180 },
    {
      field: 'configValue',
      title: $t('system.config.configValue'),
      minWidth: 150,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'configType',
      title: $t('system.config.configType'),
      width: 100,
    },
    { field: 'remark', title: $t('system.config.remark'), minWidth: 120 },
    { field: 'createTime', title: $t('system.config.createTime'), width: 180 },
    operationColumn(
      $t('system.config.operation'),
      onActionClick,
      [
        { code: 'edit', text: $t('common.edit') },
        { code: 'delete', text: $t('common.delete') },
      ],
      'configName',
      $t('system.config.name'),
    ),
  ];
}
