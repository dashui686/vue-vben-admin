<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';

import { Spin } from 'ant-design-vue';

import { useQueryId } from './hook';

const router = useRouter();
const route = useRoute();
const id = route.query.id as string;

/**
 * 从我的任务点击重新编辑会跳转到这里(中转页)
 */
const { closeCurrentTab } = useTabs();
const { businessId } = useQueryId();
onMounted(async () => {
  await closeCurrentTab();
  if (id) {
    businessId.value = id;
    router.push({ path: '/demo/leave' });
  }
});
</script>

<template>
  <div>
    <Spin :spinning="true" />
  </div>
</template>
