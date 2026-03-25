import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { z } from '#/adapter/form';
import { getDeptList } from '#/api/system/dept';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
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
        api: getDeptList,
        class: 'w-full',
        labelField: 'deptName',
        valueField: 'deptId',
        childrenField: 'children',
      },
      fieldName: 'parentId',
      label: $t('system.dept.parentDept'),
    },
    {
      component: 'InputNumber',
      fieldName: 'orderNum',
      label: $t('system.dept.orderNum'),
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
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.dept.phone'),
    },
    {
      component: 'Input',
      componentProps: {
        type: 'email',
      },
      fieldName: 'email',
      label: $t('system.dept.email'),
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemDeptApi.SystemDept>,
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
      field: 'deptId',
      title: $t('system.dept.id'),
      width: 100,
    },
    {
      field: 'orderNum',
      title: $t('system.dept.orderNum'),
      width: 100,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.dept.status'),
      width: 100,
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
      field: 'createTime',
      title: $t('system.dept.createTime'),
      width: 180,
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'deptName',
          nameTitle: $t('system.dept.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
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
      width: 200,
    },
  ];
}
