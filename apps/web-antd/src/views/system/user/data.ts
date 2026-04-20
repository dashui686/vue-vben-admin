import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { z } from '#/adapter/form';
import { getDeptOptionSelect } from '#/api/system/dept';
import { getPostOptionSelect } from '#/api/system/post';
import { getRoleOptionselect } from '#/api/system/role';
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
      fieldName: 'userName',
      label: $t('system.user.userName'),
      componentProps: {
        placeholder: '请输入用户账号',
      },
    },
    {
      component: 'Input',
      fieldName: 'phonenumber',
      label: $t('system.user.phonenumber'),
      componentProps: {
        placeholder: '请输入手机号码',
      },
    },
    statusSelectField($t('system.user.status')),
    {
      component: 'RangePicker',
      fieldName: 'dateRange',
      label: $t('system.user.createTime'),
      componentProps: {
        class: 'w-full',
        placeholder: ['开始日期', '结束日期'],
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
}

/**
 * 重置密码表单配置
 */
export function useResetPwdFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'password',
      label: $t('system.user.newPassword'),
      rules: z
        .string()
        .min(5, '密码长度不能少于5个字符')
        .max(20, '密码长度不能超过20个字符')
        .regex(/^[^<>"'|\\]+$/, String.raw`不能包含非法字符：< > " ' \ |`),
      componentProps: {
        type: 'password',
        placeholder: '请输入新密码',
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
      fieldName: 'userName',
      label: $t('system.user.userName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.user.userName')]))
        .max(
          30,
          $t('ui.formRules.maxLength', [$t('system.user.userName'), 30]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'nickName',
      label: $t('system.user.nickName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.user.nickName')]))
        .max(
          30,
          $t('ui.formRules.maxLength', [$t('system.user.nickName'), 30]),
        ),
    },
    {
      component: 'ApiTreeSelect',
      fieldName: 'deptId',
      label: $t('system.user.deptName'),
      componentProps: {
        allowClear: true,
        api: getDeptOptionSelect,
        class: 'w-full',
        labelField: 'deptName',
        valueField: 'deptId',
        childrenField: 'children',
        placeholder: '请选择归属部门',
        treeDefaultExpandAll: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: $t('system.user.password'),
      dependencies: {
        show: (values) => !values.userId,
        triggerFields: ['userId'],
      },
      rules: z
        .string()
        .min(5, '密码长度不能少于5个字符')
        .max(20, '密码长度不能超过20个字符')
        .regex(/^[^<>"'|\\]+$/, String.raw`不能包含非法字符：< > " ' \ |`),
      componentProps: {
        type: 'password',
        placeholder: '请输入密码',
      },
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号码',
        maxlength: 11,
      },
      fieldName: 'phonenumber',
      label: $t('system.user.phonenumber'),
      rules: z
        .string()
        .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
        .optional()
        .or(z.literal('')),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
        type: 'email',
      },
      fieldName: 'email',
      label: $t('system.user.email'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '男', value: '0' },
          { label: '女', value: '1' },
          { label: '未知', value: '2' },
        ],
        optionType: 'button',
      },
      defaultValue: '0',
      fieldName: 'sex',
      label: $t('system.user.sex'),
    },
    statusRadioField($t('system.user.status')),
    {
      component: 'ApiSelect',
      fieldName: 'roleIds',
      label: $t('system.user.roleIds'),
      componentProps: {
        api: getRoleOptionselect,
        labelField: 'roleName',
        valueField: 'roleId',
        mode: 'multiple',
        placeholder: '请选择角色',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'postIds',
      label: $t('system.user.postIds'),
      componentProps: {
        api: getPostOptionSelect,
        labelField: 'postName',
        valueField: 'postId',
        mode: 'multiple',
        placeholder: '请选择岗位',
      },
    },
    remarkField($t('system.user.remark')),
  ];
}

/**
 * 表格列配置
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemUserApi.SystemUser>,
  onStatusChange?: (
    newStatus: any,
    row: SystemUserApi.SystemUser,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemUserApi.SystemUser> {
  return [
    { type: 'checkbox', width: 50 },
    {
      type: 'seq',
      width: 50,
      title: '#',
    },
    {
      field: 'userName',
      title: $t('system.user.userName'),
      minWidth: 120,
    },
    {
      field: 'nickName',
      title: $t('system.user.nickName'),
      minWidth: 120,
    },
    {
      field: 'deptName',
      title: $t('system.user.deptName'),
      minWidth: 120,
    },
    {
      field: 'phonenumber',
      title: $t('system.user.phonenumber'),
      width: 130,
    },
    statusColumn($t('system.user.status'), onStatusChange, 'system:user:edit'),
    {
      field: 'createTime',
      title: $t('system.user.createTime'),
      width: 180,
    },
    operationColumn(
      $t('system.user.operation'),
      onActionClick,
      [
        { auth: 'system:user:edit', code: 'edit', text: $t('common.edit') },
        {
          auth: 'system:user:resetPwd',
          code: 'resetPwd',
          text: $t('system.user.resetPwd'),
        },
        {
          auth: 'system:user:edit',
          code: 'authRole',
          text: $t('system.user.authRole'),
        },
        {
          auth: 'system:user:remove',
          code: 'delete',
          text: $t('common.delete'),
        },
      ],
      'userName',
      $t('system.user.name'),
      { maxInline: 2, width: 200 },
    ),
  ];
}
