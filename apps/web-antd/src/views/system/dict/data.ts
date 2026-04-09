import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDictDataApi, SystemDictTypeApi } from '#/api/system/dict';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

// ===== 字典类型 =====

export function useDictTypeGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictName',
      label: $t('system.dict.dictName'),
      componentProps: { placeholder: '请输入字典名称' },
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: $t('system.dict.dictType'),
      componentProps: { placeholder: '请输入字典类型' },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.dict.status'),
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

export function useDictTypeFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictName',
      label: $t('system.dict.dictName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.dict.dictName')])),
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: $t('system.dict.dictType'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.dict.dictType')])),
      componentProps: { placeholder: '英文字母开头，仅含小写字母数字下划线' },
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
      label: $t('system.dict.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.dict.remark'),
      componentProps: { placeholder: '请输入备注', rows: 3 },
    },
  ];
}

export function useDictTypeColumns(
  onActionClick?: OnActionClickFn<SystemDictTypeApi.SystemDictType>,
): VxeTableGridColumns<SystemDictTypeApi.SystemDictType> {
  return [
    { type: 'seq', width: 50, title: '#' },
    { field: 'dictName', title: $t('system.dict.dictName'), minWidth: 150 },
    { field: 'dictType', title: $t('system.dict.dictType'), minWidth: 150 },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.dict.status'),
      width: 100,
    },
    { field: 'remark', title: $t('system.dict.remark'), minWidth: 150 },
    { field: 'createTime', title: $t('system.dict.createTime'), width: 180 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'dictName',
          nameTitle: $t('system.dict.name'),
          onClick: onActionClick,
        },
        options: [
          { code: 'edit', text: $t('common.edit') },
          { code: 'dictData', text: $t('system.dict.dictData') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dict.operation'),
    },
  ];
}

// ===== 字典数据 =====

export function useDictDataGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictLabel',
      label: $t('system.dict.dictLabel'),
      componentProps: { placeholder: '请输入字典标签' },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.dict.status'),
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

export function useDictDataFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictType',
      label: $t('system.dict.dictType'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.dict.dictType')])),
      componentProps: { disabled: true },
    },
    {
      component: 'Input',
      fieldName: 'dictLabel',
      label: $t('system.dict.dictLabel'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.dict.dictLabel')])),
    },
    {
      component: 'Input',
      fieldName: 'dictValue',
      label: $t('system.dict.dictValue'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.dict.dictValue')])),
    },
    {
      component: 'Input',
      fieldName: 'cssClass',
      label: $t('system.dict.cssClass'),
      componentProps: { placeholder: '请输入样式属性' },
    },
    {
      component: 'Select',
      fieldName: 'listClass',
      label: $t('system.dict.listClass'),
      componentProps: {
        allowClear: true,
        placeholder: '请选择表格回显样式',
        options: [
          { label: '默认', value: 'default' },
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '信息', value: 'info' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
        ],
      },
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
      fieldName: 'isDefault',
      label: $t('system.dict.isDefault'),
    },
    {
      component: 'InputNumber',
      fieldName: 'dictSort',
      label: $t('system.dict.dictSort'),
      defaultValue: 0,
      componentProps: { min: 0, placeholder: '请输入排序' },
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
      label: $t('system.dict.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.dict.remark'),
      componentProps: { placeholder: '请输入备注', rows: 3 },
    },
  ];
}

export function useDictDataColumns(
  onActionClick?: OnActionClickFn<SystemDictDataApi.SystemDictData>,
): VxeTableGridColumns<SystemDictDataApi.SystemDictData> {
  return [
    { type: 'seq', width: 50, title: '#' },
    { field: 'dictLabel', title: $t('system.dict.dictLabel'), minWidth: 120 },
    { field: 'dictValue', title: $t('system.dict.dictValue'), minWidth: 120 },
    {
      field: 'dictSort',
      title: $t('system.dict.dictSort'),
      width: 80,
      align: 'center',
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.dict.status'),
      width: 80,
    },
    { field: 'remark', title: $t('system.dict.remark'), minWidth: 120 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'dictLabel',
          nameTitle: $t('system.dict.dictLabel'),
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
      title: $t('system.dict.operation'),
      width: 150,
    },
  ];
}
