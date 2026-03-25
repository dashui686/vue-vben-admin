import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu';

import { $t } from '#/locales';

export function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.menu.typeCatalog'),
      value: 'M',
    },
    { color: 'default', label: $t('system.menu.typeMenu'), value: 'C' },
    { color: 'error', label: $t('system.menu.typeButton'), value: 'F' },
  ];
}

export function getStatusOptions() {
  return [
    { color: 'success', label: $t('common.enabled'), value: '0' },
    { color: 'error', label: $t('common.disabled'), value: '1' },
  ];
}

export function getVisibleOptions() {
  return [
    { color: 'success', label: $t('common.show'), value: '0' },
    { color: 'error', label: $t('common.hide'), value: '1' },
  ];
}

export function getFrameOptions() {
  return [
    { label: $t('common.yes'), value: '0' },
    { label: $t('common.no'), value: '1' },
  ];
}

export function getCacheOptions() {
  return [
    { label: $t('common.cache'), value: '0' },
    { label: $t('common.noCache'), value: '1' },
  ];
}

// 获取菜单标题(兼容前后端字段)
function getMenuTitle(row: SystemMenuApi.SystemMenu) {
  return row.meta?.title || row.menuName || row.name || '';
}

// 获取菜单类型(兼容前后端字段)
function getMenuType(row: SystemMenuApi.SystemMenu) {
  return row.menuType || row.type || '';
}

export function useColumns(
  onActionClick: OnActionClickFn<SystemMenuApi.SystemMenu>,
): VxeTableGridColumns<SystemMenuApi.SystemMenu> {
  return [
    {
      align: 'left',
      field: 'menuName',
      fixed: 'left',
      slots: { default: 'title' },
      title: $t('system.menu.menuTitle'),
      treeNode: true,
      width: 250,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getMenuTypeOptions() },
      field: 'menuType',
      title: $t('system.menu.type'),
      width: 100,
    },
    {
      field: 'perms',
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
        const menuType = getMenuType(row);
        switch (menuType) {
          case 'M':
          case 'catalog': {
            return row.component ?? '';
          }
          case 'C':
          case 'menu': {
            return row.component ?? '';
          }
          case 'F':
          case 'button': {
            return '';
          }
        }
        return row.component ?? '';
      },
      minWidth: 200,
      title: $t('system.menu.component'),
    },
    {
      field: 'orderNum',
      title: $t('system.menu.orderNum'),
      width: 100,
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
          nameField: 'menuName',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          'delete', // 默认的删除按钮
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
