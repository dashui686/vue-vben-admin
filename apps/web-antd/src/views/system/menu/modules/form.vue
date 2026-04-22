<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm } from '#/adapter/form';
import { createMenu, updateMenu } from '#/api/system/menu';

import { buildFormSchema, META_FIELD_KEYS } from '../data';

const emit = defineEmits<{
  success: [];
}>();

let currentId: string | undefined;
const titleSuffix = ref<string>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema: buildFormSchema(titleSuffix),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (!isOpen) return;

    titleSuffix.value = ''; // 重置标题后缀
    const data = drawerApi.getData();
    currentId = data?.id;

    if (data?.type === 'link') {
      data.linkSrc = data.meta?.link;
    } else if (data?.type === 'embedded') {
      data.linkSrc = data.meta?.iframeSrc;
    }
    if (data?.meta?.query && typeof data.meta.query === 'object') {
      try {
        data.meta.query = JSON.stringify(data.meta.query);
      } catch {
        // ignore
      }
    }
    if (data) {
      currentId = data.id;
      // Vben Form 需要使用扁平化的字段名来设置嵌套对象的值
      const flatValues: any = { ...data };
      META_FIELD_KEYS.forEach((key) => {
        if (data.meta?.[key] !== undefined) {
          flatValues[`meta.${key}`] = data.meta[key];
        }
      });
      formApi.setValues(flatValues);
      titleSuffix.value = data.meta?.title ? $t(data.meta.title) : '';
    } else {
      currentId = undefined;
      formApi.resetForm();
      titleSuffix.value = '';
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  drawerApi.lock();
  const data = await formApi.getValues();

  // Vben Form 返回的是扁平化字段 (如 'meta.order')，需要重新嵌套到 meta 对象
  const meta: any = {};
  META_FIELD_KEYS.forEach((key) => {
    const flatKey = `meta.${key}`;
    if (data[flatKey] !== undefined) {
      meta[key] = data[flatKey];
    }
    delete data[flatKey];
  });

  // 合并到 data.meta
  data.meta = { ...data.meta, ...meta };

  // 处理 link/embedded 类型
  if (data.type === 'link') {
    data.meta = { ...data.meta, link: data.linkSrc };
  } else if (data.type === 'embedded') {
    data.meta = { ...data.meta, iframeSrc: data.linkSrc };
  }

  // 处理 query 字段
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
