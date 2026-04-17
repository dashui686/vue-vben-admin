import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemOssApi } from '#/api/system/oss';

import { z } from '#/adapter/form';
import {
  operationColumn,
  remarkField,
  statusColumn,
  statusRadioField,
  statusSelectField,
} from '#/composables/useDataHelper';
import { $t } from '#/locales';

/**
 * Search form schema for OSS file list
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'fileName',
      label: $t('system.oss.fileName'),
      componentProps: {
        placeholder: '请输入文件名',
      },
    },
    {
      component: 'Input',
      fieldName: 'originalName',
      label: $t('system.oss.originalName'),
      componentProps: {
        placeholder: '请输入原名',
      },
    },
    {
      component: 'Input',
      fieldName: 'fileSuffix',
      label: $t('system.oss.fileSuffix'),
      componentProps: {
        placeholder: '请输入文件后缀',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('system.oss.createTime'),
    },
    {
      component: 'Input',
      fieldName: 'service',
      label: $t('system.oss.service'),
      componentProps: {
        placeholder: '请输入服务商',
      },
    },
  ];
}

/**
 * Table columns for OSS file list
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemOssApi.SystemOss>,
): VxeTableGridColumns<SystemOssApi.SystemOss> {
  return [
    { type: 'checkbox', width: 50 },
    {
      type: 'seq',
      width: 50,
      title: '#',
    },
    {
      field: 'fileName',
      title: $t('system.oss.fileName'),
      minWidth: 150,
    },
    {
      field: 'originalName',
      title: $t('system.oss.originalName'),
      minWidth: 150,
    },
    {
      field: 'fileSuffix',
      title: $t('system.oss.fileSuffix'),
      width: 100,
    },
    {
      field: 'url',
      title: $t('system.oss.url'),
      minWidth: 200,
    },
    {
      field: 'createByName',
      title: $t('system.oss.createByName'),
      width: 100,
    },
    {
      field: 'service',
      title: $t('system.oss.service'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.oss.createTime'),
      width: 180,
    },
    operationColumn(
      $t('system.oss.operation'),
      onActionClick,
      [
        { auth: 'system:oss:download', code: 'download', text: $t('system.oss.download') },
        { auth: 'system:oss:remove', code: 'delete', text: $t('common.delete') },
      ],
      'fileName',
      $t('system.oss.name'),
    ),
  ];
}

/**
 * Search form schema for OSS config list
 */
export function useConfigGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'configKey',
      label: $t('system.oss.configKey'),
      componentProps: {
        placeholder: '请输入配置key',
      },
    },
    {
      component: 'Input',
      fieldName: 'bucketName',
      label: $t('system.oss.bucketName'),
      componentProps: {
        placeholder: '请输入桶名称',
      },
    },
    statusSelectField($t('system.oss.status')),
  ];
}

/**
 * Table columns for OSS config list
 */
export function useConfigColumns(
  onActionClick?: OnActionClickFn<SystemOssApi.SystemOssConfig>,
  onStatusChange?: (
    newStatus: any,
    row: SystemOssApi.SystemOssConfig,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemOssApi.SystemOssConfig> {
  return [
    { type: 'checkbox', width: 50 },
    {
      type: 'seq',
      width: 50,
      title: '#',
    },
    {
      field: 'configKey',
      title: $t('system.oss.configKey'),
      minWidth: 120,
    },
    {
      field: 'bucketName',
      title: $t('system.oss.bucketName'),
      minWidth: 120,
    },
    {
      field: 'prefix',
      title: $t('system.oss.prefix'),
      minWidth: 100,
    },
    {
      field: 'endpoint',
      title: $t('system.oss.endpoint'),
      minWidth: 150,
    },
    {
      field: 'domain',
      title: $t('system.oss.domain'),
      minWidth: 150,
    },
    statusColumn($t('system.oss.status'), onStatusChange, 'system:oss:edit'),
    {
      field: 'accessPolicy',
      title: $t('system.oss.accessPolicy'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.oss.createTime'),
      width: 180,
    },
    operationColumn(
      $t('system.oss.operation'),
      onActionClick,
      [
        { auth: 'system:oss:edit', code: 'edit', text: $t('common.edit') },
        { auth: 'system:oss:remove', code: 'delete', text: $t('common.delete') },
      ],
      'configKey',
      $t('system.oss.configName'),
    ),
  ];
}

/**
 * Edit form schema for OSS config
 */
export function useConfigFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'configKey',
      label: $t('system.oss.configKey'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.oss.configKey')]))
        .max(
          255,
          $t('ui.formRules.maxLength', [$t('system.oss.configKey'), 255]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'endpoint',
      label: $t('system.oss.endpoint'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.oss.endpoint')]))
        .max(
          255,
          $t('ui.formRules.maxLength', [$t('system.oss.endpoint'), 255]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'domain',
      label: $t('system.oss.domain'),
      componentProps: {
        placeholder: '请输入自定义域名',
        maxlength: 255,
      },
    },
    {
      component: 'Input',
      fieldName: 'accessKey',
      label: $t('system.oss.accessKey'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.oss.accessKey')]))
        .max(
          255,
          $t('ui.formRules.maxLength', [$t('system.oss.accessKey'), 255]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'secretKey',
      label: $t('system.oss.secretKey'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.oss.secretKey')]))
        .max(
          255,
          $t('ui.formRules.maxLength', [$t('system.oss.secretKey'), 255]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'bucketName',
      label: $t('system.oss.bucketName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.oss.bucketName')]))
        .max(
          255,
          $t('ui.formRules.maxLength', [$t('system.oss.bucketName'), 255]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'prefix',
      label: $t('system.oss.prefix'),
      componentProps: {
        placeholder: '请输入前缀',
        maxlength: 255,
      },
    },
    {
      component: 'Input',
      fieldName: 'region',
      label: $t('system.oss.region'),
      componentProps: {
        placeholder: '请输入区域',
        maxlength: 255,
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 'Y' },
          { label: $t('common.disabled'), value: 'N' },
        ],
        optionType: 'button',
      },
      defaultValue: 'N',
      fieldName: 'isHttps',
      label: $t('system.oss.isHttps'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '私有', value: 'private' },
          { label: '公共', value: 'public' },
          { label: '自定义', value: 'custom' },
        ],
        optionType: 'button',
      },
      defaultValue: 'private',
      fieldName: 'accessPolicy',
      label: $t('system.oss.accessPolicy'),
    },
    statusRadioField($t('system.oss.status')),
    remarkField($t('system.oss.remark')),
  ];
}
