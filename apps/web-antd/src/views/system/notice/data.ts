import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api/system/notice';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

const noticeTypeOptions = [
  { label: '通知', value: '1' },
  { label: '公告', value: '2' },
];

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'noticeTitle',
      label: $t('system.notice.noticeTitle'),
      componentProps: { placeholder: '请输入公告标题' },
    },
    {
      component: 'Select',
      fieldName: 'noticeType',
      label: $t('system.notice.noticeType'),
      componentProps: {
        allowClear: true,
        placeholder: '请选择公告类型',
        options: noticeTypeOptions,
      },
    },
    {
      component: 'Input',
      fieldName: 'createByName',
      label: $t('system.notice.createBy'),
      componentProps: { placeholder: '请输入创建者' },
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'noticeTitle',
      label: $t('system.notice.noticeTitle'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.notice.noticeTitle')]))
        .max(
          50,
          $t('ui.formRules.maxLength', [$t('system.notice.noticeTitle'), 50]),
        ),
    },
    {
      component: 'Select',
      fieldName: 'noticeType',
      label: $t('system.notice.noticeType'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.notice.noticeType')])),
      componentProps: {
        placeholder: '请选择公告类型',
        options: noticeTypeOptions,
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '正常', value: '0' },
          { label: '关闭', value: '1' },
        ],
        optionType: 'button',
      },
      defaultValue: '0',
      fieldName: 'status',
      label: $t('system.notice.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'noticeContent',
      label: $t('system.notice.noticeContent'),
      componentProps: { placeholder: '请输入内容', rows: 8 },
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<SystemNoticeApi.SystemNotice>,
): VxeTableGridColumns<SystemNoticeApi.SystemNotice> {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    {
      field: 'noticeTitle',
      title: $t('system.notice.noticeTitle'),
      minWidth: 200,
    },
    {
      field: 'noticeType',
      title: $t('system.notice.noticeType'),
      width: 100,
      align: 'center',
      cellRender: {
        name: 'CellTag',
      },
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.notice.status'),
      width: 80,
    },
    { field: 'createByName', title: $t('system.notice.createBy'), width: 120 },
    { field: 'createTime', title: $t('system.notice.createTime'), width: 180 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'noticeTitle',
          nameTitle: $t('system.notice.name'),
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
      title: $t('system.notice.operation'),
    },
  ];
}
