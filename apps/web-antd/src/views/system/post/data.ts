import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { z } from '#/adapter/form';
import { getDeptTree } from '#/api/system/post';
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
    statusSelectField($t('system.post.status')),
  ];
}

/**
 * 编辑表单字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiTreeSelect',
      fieldName: 'deptId',
      label: $t('system.user.deptName'),
      rules: z.number({
        message: $t('ui.formRules.required', [$t('system.user.deptName')]),
      }),
      componentProps: {
        allowClear: true,
        api: getDeptTree,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
        placeholder: '请选择归属部门',
        treeDefaultExpandAll: true,
      },
    },
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
    statusRadioField($t('system.post.status')),
    remarkField($t('system.post.remark')),
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
    { type: 'checkbox', width: 50 },
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
    statusColumn($t('system.post.status'), onStatusChange, 'system:post:edit'),
    {
      field: 'createTime',
      title: $t('system.post.createTime'),
      width: 180,
    },
    operationColumn(
      $t('system.post.operation'),
      onActionClick,
      [
        { auth: 'system:post:edit', code: 'edit', text: $t('common.edit') },
        { auth: 'system:post:remove', code: 'delete', text: $t('common.delete') },
      ],
      'postName',
      $t('system.post.name'),
    ),
  ];
}
