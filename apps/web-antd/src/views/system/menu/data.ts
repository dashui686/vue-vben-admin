import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface';

import type { Recordable } from '@vben/types';

import type { FrontendMenu } from './types';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t, $te } from '@vben/locales';

import { z } from '#/adapter/form';
import { getMenuList, SystemMenuApi } from '#/api/system/menu';
import { componentKeys } from '#/router/routes';

// ========== 常量定义 ==========

/** Meta 字段键名列表，用于扁平化和重构嵌套对象 */
export const META_FIELD_KEYS = [
  'title',
  'icon',
  'order',
  'keepAlive',
  'hideInMenu',
  'hideInTab',
  'hideInBreadcrumb',
  'hideChildrenInMenu',
  'affixTab',
  'affixTabOrder',
  'badge',
  'badgeType',
  'badgeVariants',
  'activePath',
  'activeIcon',
  'link',
  'iframeSrc',
  'maxNumOfOpenTab',
  'query',
] as const;

// ========== 辅助函数 ==========

/** 创建菜单类型依赖配置 */
function createTypeDependency(
  types: string[],
  mode: 'in' | 'notIn',
  config: {
    disabled?: boolean;
    rules?: ((values: any) => null | string) | null | string;
    show?: boolean;
  } = {},
) {
  const { show, disabled, rules } = config;
  const checkFn =
    mode === 'in'
      ? (values: any) => types.includes(values.type)
      : (values: any) => !types.includes(values.type);

  const result: Recordable<any> = {
    triggerFields: ['type'],
  };

  if (show !== undefined) {
    result.show = checkFn;
  } else if (disabled !== undefined) {
    result.disabled = checkFn;
  }

  if (rules !== undefined) {
    result.rules =
      typeof rules === 'function'
        ? (values: any) => (checkFn(values) ? rules(values) : null)
        : rules;
  }

  return result;
}

/** 菜单类型在指定范围内的依赖 */
const showWhenTypeIn = (types: string[]) => createTypeDependency(types, 'in');

/** 菜单类型不在指定范围内的依赖 */
const showWhenTypeNotIn = (types: string[]) =>
  createTypeDependency(types, 'notIn');

// ========== 表单 Schema 定义 ==========

/** 菜单类型选项 */
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

/** 状态选项 */
export function getStatusOptions() {
  return [
    { color: 'success', label: $t('common.enabled'), value: '0' },
    { color: 'error', label: $t('common.disabled'), value: '1' },
  ];
}

/** 构建表单 schema */
export function buildFormSchema(titleSuffix: any): VbenFormSchema[] {
  return [
    // ========== 基础信息 ==========
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getMenuList,
        class: 'w-full',
        filterTreeNode: (input: string, node: Recordable<any>) => {
          if (!input) return true;
          const title = node.meta?.title ?? '';
          return title.includes(input) || $t(title).includes(input);
        },
        getPopupContainer: () => document.body,
        labelField: 'meta.title',
        showSearch: true,
        treeDefaultExpandAll: true,
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'pid',
      label: $t('system.menu.parent'),
      renderComponentContent() {
        return {
          title({ label, meta }: { label: string; meta: Recordable<any> }) {
            const coms: any[] = [];
            if (!label) return '';
            if (meta?.icon) {
              coms.push(h(IconifyIcon, { class: 'size-4', icon: meta.icon }));
            }
            coms.push(h('span', {}, $t(label || '')));
            return h('div', { class: 'flex items-center gap-1' }, coms);
          },
        };
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: getMenuTypeOptions(),
        optionType: 'button',
      },
      defaultValue: 'menu',
      fieldName: 'type',
      formItemClass: 'col-span-2 md:col-span-2',
      label: $t('system.menu.type'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.menu.menuName'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.menu.menuName'), 2]))
        .max(
          30,
          $t('ui.formRules.maxLength', [$t('system.menu.menuName'), 30]),
        ),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, style: { width: '100%' } },
      defaultValue: 0,
      fieldName: 'meta.order',
      label: $t('system.menu.orderNum'),
    },
    {
      component: 'Input',
      componentProps() {
        return {
          ...(titleSuffix.value && { addonAfter: titleSuffix.value }),
          onChange({ target: { value } }: ChangeEvent) {
            titleSuffix.value = value && $te(value) ? $t(value) : undefined;
          },
        };
      },
      fieldName: 'meta.title',
      label: $t('system.menu.menuTitle'),
      rules: 'required',
    },
    {
      component: 'IconPicker',
      componentProps: { prefix: 'carbon' },
      dependencies: showWhenTypeNotIn(['button']),
      fieldName: 'meta.icon',
      label: $t('system.menu.icon'),
    },
    // ========== 路由配置 ==========
    {
      component: 'Input',
      dependencies: showWhenTypeIn(['catalog', 'embedded', 'menu']),
      fieldName: 'path',
      label: $t('system.menu.path'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.menu.path'), 2]))
        .max(100, $t('ui.formRules.maxLength', [$t('system.menu.path'), 100]))
        .refine(
          (v: string) => !v.startsWith('/'),
          $t('ui.formRules.startWith', [$t('system.menu.path'), '/']),
        ),
    },
    {
      component: 'Input',
      dependencies: showWhenTypeIn(['embedded', 'link']),
      fieldName: 'linkSrc',
      label: $t('system.menu.linkSrc'),
      rules: z.string().url($t('ui.formRules.invalidURL')),
    },
    {
      component: 'AutoComplete',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        filterOption: (input: string, option: { value: string }) =>
          option.value.toLowerCase().includes(input.toLowerCase()),
        options: componentKeys.map((v) => ({ value: v })),
      },
      dependencies: {
        rules: (values: any) => (values.type === 'menu' ? 'required' : null),
        show: (values: any) => values.type === 'menu',
        triggerFields: ['type'],
      },
      fieldName: 'component',
      label: $t('system.menu.component'),
    },
    {
      component: 'Input',
      dependencies: showWhenTypeIn(['catalog', 'embedded', 'menu']),
      fieldName: 'meta.query',
      help: $t('system.menu.queryParamHelp'),
      label: $t('system.menu.queryParam'),
    },
    {
      component: 'Input',
      dependencies: showWhenTypeIn(['embedded', 'menu']),
      fieldName: 'meta.activePath',
      help: $t('system.menu.activePathHelp'),
      label: $t('system.menu.activePath'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.menu.path'), 2]))
        .max(100, $t('ui.formRules.maxLength', [$t('system.menu.path'), 100]))
        .refine(
          (v: string) => !v || v.startsWith('/'),
          $t('ui.formRules.startWith', [$t('system.menu.path'), '/']),
        )
        .optional(),
    },
    // ========== 权限配置 ==========
    {
      component: 'Input',
      dependencies: {
        rules: (values: any) => (values.type === 'button' ? 'required' : null),
        show: (values: any) =>
          ['button', 'catalog', 'embedded', 'menu'].includes(values.type),
        triggerFields: ['type'],
      },
      fieldName: 'authCode',
      label: $t('system.menu.authCode'),
    },
    // ========== 状态配置 ==========
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.show'), value: false },
          { label: $t('common.hide'), value: true },
        ],
        optionType: 'button',
      },
      defaultValue: false,
      dependencies: showWhenTypeNotIn(['button']),
      fieldName: 'meta.hideInMenu',
      label: $t('system.menu.visible'),
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
      label: $t('system.menu.status'),
    },
    // ========== 徽标配置 ==========
    {
      component: 'Divider',
      dependencies: showWhenTypeNotIn(['button']),
      fieldName: 'dividerBadge',
      formItemClass: 'col-span-2 md:col-span-2 pb-0',
      hideLabel: true,
      renderComponentContent() {
        return { default: () => $t('system.menu.badgeSettings') };
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: [
          { label: $t('system.menu.badgeType.none'), value: undefined },
          { label: $t('system.menu.badgeType.dot'), value: 'dot' },
          { label: $t('system.menu.badgeType.normal'), value: 'normal' },
        ],
      },
      dependencies: showWhenTypeNotIn(['button']),
      fieldName: 'meta.badgeType',
      label: $t('system.menu.badgeType.title'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        class: 'w-full',
      },
      dependencies: {
        disabled: (values: any) => {
          // 徽标类型为 'normal' 时才启用
          return values.meta?.badgeType !== 'normal';
        },
        show: (values: any) => !['button'].includes(values.type),
        triggerFields: ['meta.badgeType'],
      },
      fieldName: 'meta.badge',
      label: $t('system.menu.badge'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: SystemMenuApi.BadgeVariants.map((v) => ({
          label: v,
          value: v,
        })),
      },
      dependencies: showWhenTypeNotIn(['button']),
      fieldName: 'meta.badgeVariants',
      label: $t('system.menu.badgeVariants'),
    },
    // ========== 高级设置 ==========
    {
      component: 'Divider',
      dependencies: showWhenTypeNotIn(['button', 'link']),
      fieldName: 'divider1',
      formItemClass: 'col-span-2 md:col-span-2 pb-0',
      hideLabel: true,
      renderComponentContent() {
        return { default: () => $t('system.menu.advancedSettings') };
      },
    },
    {
      component: 'IconPicker',
      componentProps: { prefix: 'carbon' },
      dependencies: showWhenTypeIn(['catalog', 'embedded', 'menu']),
      fieldName: 'meta.activeIcon',
      label: $t('system.menu.activeIcon'),
    },
    {
      component: 'Checkbox',
      dependencies: showWhenTypeIn(['menu']),
      fieldName: 'meta.keepAlive',
      renderComponentContent() {
        return { default: () => $t('system.menu.keepAlive') };
      },
    },
    {
      component: 'Checkbox',
      dependencies: showWhenTypeIn(['embedded', 'menu']),
      fieldName: 'meta.affixTab',
      renderComponentContent() {
        return { default: () => $t('system.menu.affixTab') };
      },
    },
    {
      component: 'Checkbox',
      dependencies: showWhenTypeIn(['catalog', 'menu']),
      fieldName: 'meta.hideChildrenInMenu',
      renderComponentContent() {
        return { default: () => $t('system.menu.hideChildrenInMenu') };
      },
    },
    {
      component: 'Checkbox',
      dependencies: showWhenTypeNotIn(['button', 'link']),
      fieldName: 'meta.hideInBreadcrumb',
      renderComponentContent() {
        return { default: () => $t('system.menu.hideInBreadcrumb') };
      },
    },
    {
      component: 'Checkbox',
      dependencies: showWhenTypeNotIn(['button', 'link']),
      fieldName: 'meta.hideInTab',
      renderComponentContent() {
        return { default: () => $t('system.menu.hideInTab') };
      },
    },
  ];
}

// ========== 搜索表单 ==========

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'menuName',
      label: $t('system.menu.menuName'),
      componentProps: {
        placeholder: '请输入菜单名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.menu.status'),
      componentProps: {
        allowClear: true,
        placeholder: '请选择菜单状态',
        options: [
          { label: $t('common.enabled'), value: '0' },
          { label: $t('common.disabled'), value: '1' },
        ],
      },
    },
  ];
}

// ========== 表格列定义 ==========

/** 定义表格列 */
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
      formatter: ({ row }) =>
        row.type === 'button' ? '' : (row.component ?? ''),
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
        attrs: { nameField: 'name', onClick: onActionClick },
        name: 'CellOperation',
        options: [
          {
            auth: 'system:menu:add',
            code: 'append',
            text: $t('system.menu.appendChild'),
          },
          { auth: 'system:menu:edit', code: 'edit' },
          { auth: 'system:menu:remove', code: 'delete' },
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
