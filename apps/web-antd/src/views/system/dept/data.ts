import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { z } from '#/adapter/form';
import { getDeptOptionSelect } from '#/api/system/dept';
import { $t } from '#/locales';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'deptName',
      label: $t('system.dept.deptName'),
      componentProps: {
        placeholder: '请输入部门名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.dept.status'),
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
 * 获取编辑表单的字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'deptName',
      label: $t('system.dept.deptName'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.dept.deptName'), 2]))
        .max(
          30,
          $t('ui.formRules.maxLength', [$t('system.dept.deptName'), 30]),
        ),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptOptionSelect,
        class: 'w-full',
        labelField: 'deptName',
        valueField: 'deptId',
        childrenField: 'children',
        placeholder: '请选择上级部门',
        treeDefaultExpandAll: true,
      },
      fieldName: 'parentId',
      defaultValue: '0',
      label: $t('system.dept.parentDept'),
    },
    {
      component: 'InputNumber',
      fieldName: 'orderNum',
      label: $t('system.dept.orderNum'),
      componentProps: {
        min: 0,
        placeholder: '请输入显示顺序',
      },
      defaultValue: 0,
    },
    {
      component: 'Input',
      fieldName: 'leader',
      label: $t('system.dept.leader'),
      componentProps: {
        placeholder: '请输入负责人',
      },
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.dept.phone'),
      componentProps: {
        placeholder: '请输入联系电话',
      },
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
        type: 'email',
      },
      fieldName: 'email',
      label: $t('system.dept.email'),
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
      label: $t('system.dept.status'),
    },
  ];
}

/**
 * 获取表格列配置
 * @param onActionClick 表格操作按钮点击事件
 * @param onStatusChange 状态变更回调
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemDeptApi.SystemDept>,
  onStatusChange?: (
    newStatus: any,
    row: SystemDeptApi.SystemDept,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemDeptApi.SystemDept> {
  return [
    {
      align: 'left',
      field: 'deptName',
      fixed: 'left',
      title: $t('system.dept.deptName'),
      treeNode: true,
      width: 200,
    },
    {
      field: 'orderNum',
      title: $t('system.dept.orderNum'),
      width: 100,
      align: 'center',
      cellRender: {
        name: 'CellInputNumber',
        attrs: {
          align: 'center',
          onChange: (val: number, row: SystemDeptApi.SystemDept) => {
            // 值变化时更新
            row.orderNum = val;
          },
        },
      },
    },
    {
      field: 'leader',
      title: $t('system.dept.leader'),
      width: 120,
    },
    {
      field: 'phone',
      title: $t('system.dept.phone'),
      width: 130,
    },
    {
      field: 'email',
      title: $t('system.dept.email'),
      width: 180,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.dept.status'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.dept.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'deptName',
          nameTitle: $t('system.dept.name'),
          onClick: onActionClick,
        },
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
          },
          {
            code: 'append',
            text: '新增',
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            disabled: (row: SystemDeptApi.SystemDept) => {
              return !!(row.children && row.children.length > 0);
            },
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
    },
  ];
}
