import type { FrontendMenu } from './types';

import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';

import { $t } from '#/locales';

/**
 * 菜单类型选项（前端格式）
 */
export function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.menu.typeCatalog'),
      value: 'catalog',
    },
    { color: 'default', label: $t('system.menu.typeMenu'), value: 'menu' },
    { color: 'warning', label: $t('system.menu.typeLink'), value: 'link' },
    {
      color: 'success',
      label: $t('system.menu.typeEmbedded'),
      value: 'embedded',
    },
    { color: 'error', label: $t('system.menu.typeButton'), value: 'button' },
  ];
}

/**
 * 状态选项
 */
export function getStatusOptions() {
  return [
    { color: 'success', label: $t('common.enabled'), value: '0' },
    { color: 'error', label: $t('common.disabled'), value: '1' },
  ];
}

/**
 * 列定义
 */
export function useColumns(
  onActionClick: OnActionClickFn<FrontendMenu>,
): VxeTableGridColumns<FrontendMenu> {
  return [
    {
      align: 'left',
      field: 'name',
      fixed: 'left',
      slots: { default: 'title' },
      title: $t('system.menu.menuTitle'),
      treeNode: true,
      width: 250,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getMenuTypeOptions() },
      field: 'type',
      title: $t('system.menu.type'),
      width: 100,
    },
    {
      field: 'authCode',
      title: $t('system.menu.authCode'),
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.menu.path'),
      width: 200,
    },
    {
      align: 'left',
      field: 'component',
      formatter: ({ row }) => {
        // 按钮类型不显示组件
        if (row.type === 'button') {
          return '';
        }
        return row.component ?? '';
      },
      minWidth: 200,
      title: $t('system.menu.component'),
    },
    {
      field: 'meta.order',
      title: $t('system.menu.orderNum'),
      width: 80,
    },
    {
      cellRender: { name: 'CellTag', options: getStatusOptions() },
      field: 'status',
      title: $t('system.menu.status'),
      width: 100,
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'append', text: $t('system.menu.appendChild') },
          'edit',
          'delete',
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.menu.operation'),
      width: 200,
    },
  ];
}
