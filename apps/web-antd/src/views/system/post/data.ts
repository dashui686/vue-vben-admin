import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postCode',
      label: $t('system.post.postCode'),
      componentProps: {
        placeholder: '请输入岗位编码',
      },
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: $t('system.post.postName'),
      componentProps: {
        placeholder: '请输入岗位名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.post.status'),
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
      fieldName: 'postCode',
      label: $t('system.post.postCode'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.post.postCode')]))
        .max(
          64,
          $t('ui.formRules.maxLength', [$t('system.post.postCode'), 64]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: $t('system.post.postName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.post.postName')]))
        .max(
          50,
          $t('ui.formRules.maxLength', [$t('system.post.postName'), 50]),
        ),
    },
    {
      component: 'InputNumber',
      fieldName: 'postSort',
      label: $t('system.post.postSort'),
      rules: z.number({
        message: $t('ui.formRules.required', [$t('system.post.postSort')]),
      }),
      componentProps: {
        min: 0,
        placeholder: '请输入显示顺序',
      },
      defaultValue: 0,
    },
    {
      component: 'Input',
      fieldName: 'postCategory',
      label: $t('system.post.postCategory'),
      componentProps: {
        placeholder: '请输入岗位类别编码',
        maxlength: 100,
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
      label: $t('system.post.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.post.remark'),
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
  onActionClick?: OnActionClickFn<SystemPostApi.SystemPost>,
  onStatusChange?: (
    newStatus: any,
    row: SystemPostApi.SystemPost,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemPostApi.SystemPost> {
  return [
    {
      type: 'seq',
      width: 50,
      title: '#',
    },
    {
      field: 'postName',
      title: $t('system.post.postName'),
      minWidth: 150,
    },
    {
      field: 'postCode',
      title: $t('system.post.postCode'),
      minWidth: 120,
    },
    {
      field: 'postCategory',
      title: $t('system.post.postCategory'),
      minWidth: 120,
    },
    {
      field: 'postSort',
      title: $t('system.post.postSort'),
      width: 100,
      align: 'center',
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.post.status'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.post.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'postName',
          nameTitle: $t('system.post.name'),
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
      title: $t('system.post.operation'),
    },
  ];
}
