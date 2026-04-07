<script lang="ts" setup>
import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface';

import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';
import { getPopupContainer } from '@vben/utils';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm, z } from '#/adapter/form';
import {
  createMenu,
  getMenuList,
  SystemMenuApi,
  updateMenu,
} from '#/api/system/menu';
import { $t } from '#/locales';
import { componentKeys } from '#/router/routes';

import { getMenuTypeOptions } from '../data';

const emit = defineEmits<{
  success: [];
}>();

// 用于保存当前编辑的菜单ID，判断是新增还是修改
let currentId: string | undefined;
const formData = ref<SystemMenuApi.SystemMenu>();
const titleSuffix = ref<string>();

/**
 * 菜单表单Schema
 * 参考 RuoYi-Vue 原有字段结构，保留原有字段并增加前端扩展字段
 */
const schema: VbenFormSchema[] = [
  // ========== 基础信息 ==========
  {
    component: 'ApiTreeSelect',
    componentProps: {
      api: getMenuList,
      class: 'w-full',
      filterTreeNode(input: string, node: Recordable<any>) {
        if (!input || input.length === 0) {
          return true;
        }
        const title: string = node.meta?.title ?? '';
        if (!title) return false;
        return title.includes(input) || $t(title).includes(input);
      },
      getPopupContainer,
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
          const coms = [];
          if (!label) return '';
          if (meta?.icon) {
            coms.push(h(IconifyIcon, { class: 'size-4', icon: meta.icon }));
          }
          coms.push(h('span', { class: '' }, $t(label || '')));
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
      .max(30, $t('ui.formRules.maxLength', [$t('system.menu.menuName'), 30])),
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: 0,
      style: { width: '100%' },
    },
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
    componentProps: {
      prefix: 'carbon',
    },
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'link', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.icon',
    label: $t('system.menu.icon'),
  },
  // ========== 路由配置 ==========
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'path',
    label: $t('system.menu.path'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.path'), 2]))
      .max(100, $t('ui.formRules.maxLength', [$t('system.menu.path'), 100]))
      .refine(
        (value: string) => {
          return value.startsWith('/');
        },
        $t('ui.formRules.startWith', [$t('system.menu.path'), '/']),
      ),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['embedded', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'linkSrc',
    label: $t('system.menu.linkSrc'),
    rules: z.string().url($t('ui.formRules.invalidURL')),
  },
  {
    component: 'AutoComplete',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      filterOption(input: string, option: { value: string }) {
        return option.value.toLowerCase().includes(input.toLowerCase());
      },
      options: componentKeys.map((v) => ({ value: v })),
    },
    dependencies: {
      rules: (values) => {
        return values.type === 'menu' ? 'required' : null;
      },
      show: (values) => {
        return values.type === 'menu';
      },
      triggerFields: ['type'],
    },
    fieldName: 'component',
    label: $t('system.menu.component'),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.query',
    help: $t('system.menu.queryParamHelp'),
    label: $t('system.menu.queryParam'),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.activePath',
    help: $t('system.menu.activePathHelp'),
    label: $t('system.menu.activePath'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.path'), 2]))
      .max(100, $t('ui.formRules.maxLength', [$t('system.menu.path'), 100]))
      .refine(
        (value: string) => {
          return value.startsWith('/');
        },
        $t('ui.formRules.startWith', [$t('system.menu.path'), '/']),
      )
      .optional(),
  },
  // ========== 权限配置 ==========
  {
    component: 'Input',
    dependencies: {
      rules: (values) => {
        return values.type === 'button' ? 'required' : null;
      },
      show: (values) => {
        return ['button', 'catalog', 'embedded', 'menu'].includes(values.type);
      },
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
    dependencies: {
      show: (values) => {
        return !['button'].includes(values.type);
      },
      triggerFields: ['type'],
    },
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
    dependencies: {
      show: (values) => {
        return !['button'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'dividerBadge',
    formItemClass: 'col-span-2 md:col-span-2 pb-0',
    hideLabel: true,
    renderComponentContent() {
      return {
        default: () => $t('system.menu.badgeSettings'),
      };
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
    dependencies: {
      show: (values) => {
        return !['button'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.badgeType',
    label: $t('system.menu.badgeType.title'),
  },
  {
    component: 'Input',
    componentProps: (values) => {
      return {
        allowClear: true,
        class: 'w-full',
        disabled: values.meta?.badgeType !== 'normal',
      };
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
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
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.badgeVariants',
    label: $t('system.menu.badgeVariants'),
  },
  // ========== 高级设置 ==========
  {
    component: 'Divider',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'divider1',
    formItemClass: 'col-span-2 md:col-span-2 pb-0',
    hideLabel: true,
    renderComponentContent() {
      return {
        default: () => $t('system.menu.advancedSettings'),
      };
    },
  },
  {
    component: 'IconPicker',
    componentProps: {
      prefix: 'carbon',
    },
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.activeIcon',
    label: $t('system.menu.activeIcon'),
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return ['menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.keepAlive',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.keepAlive'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.affixTab',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.affixTab'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return ['catalog', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.hideChildrenInMenu',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideChildrenInMenu'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.hideInBreadcrumb',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideInBreadcrumb'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'meta.hideInTab',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideInTab'),
      };
    },
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});
const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemMenuApi.SystemMenu>();
      // 保存ID用于判断新增还是修改
      currentId = data?.id;
      if (data?.type === 'link') {
        data.linkSrc = data.meta?.link;
      } else if (data?.type === 'embedded') {
        data.linkSrc = data.meta?.iframeSrc;
      }
      // 处理 query 字段：对象转字符串
      if (data?.meta?.query && typeof data.meta.query === 'object') {
        try {
          data.meta.query = JSON.stringify(data.meta.query);
        } catch {
          // ignore
        }
      }
      if (data) {
        // 保存当前编辑的ID
        currentId = data.id;
        formData.value = data;
        formApi.setValues(formData.value);
        titleSuffix.value = formData.value.meta?.title
          ? $t(formData.value.meta.title)
          : '';
      } else {
        // 新增时清空ID
        currentId = undefined;
        formApi.resetForm();
        titleSuffix.value = '';
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const data = (await formApi.getValues()) as any;

    // 处理 link/embedded 类型
    if (data.type === 'link') {
      data.meta = { ...data.meta, link: data.linkSrc };
    } else if (data.type === 'embedded') {
      data.meta = { ...data.meta, iframeSrc: data.linkSrc };
    }
    // 处理 query 字段：字符串转对象
    const queryStr = data.meta?.query;
    if (queryStr && typeof queryStr === 'string' && queryStr.trim()) {
      try {
        data.meta.query = JSON.parse(queryStr);
      } catch {
        // 解析失败保持原样
      }
    } else if (queryStr === '') {
      data.meta.query = undefined;
    }
    // 删除临时字段
    delete data.linkSrc;
    // 如果是修改则添加id
    if (currentId) {
      data.id = currentId;
    }
    try {
      await (currentId ? updateMenu(data) : createMenu(data));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}
const getDrawerTitle = computed(() =>
  currentId
    ? $t('ui.actionTitle.edit', [$t('system.menu.name')])
    : $t('ui.actionTitle.create', [$t('system.menu.name')]),
);
</script>
<template>
  <Drawer class="w-full max-w-200" :title="getDrawerTitle">
    <Form class="mx-4" :layout="isHorizontal ? 'horizontal' : 'vertical'" />
  </Drawer>
</template>
