<script lang="ts" setup>
import type { MonitorCacheApi } from '#/api/monitor/cache';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Statistic,
  Table,
} from 'ant-design-vue';

import { getCacheInfo } from '#/api/monitor/cache';

const cacheInfo = ref<MonitorCacheApi.CacheListInfoVo>();
const loading = ref(false);

async function loadCacheInfo() {
  loading.value = true;
  try {
    cacheInfo.value = await getCacheInfo();
  } catch {
    // getCacheInfo 失败时静默处理
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCacheInfo();
});
</script>

<template>
  <Page auto-content-height>
    <div class="space-y-4">
      <!-- Redis 信息 -->
      <Card title="Redis 基本信息" :loading="loading">
        <Descriptions v-if="cacheInfo?.info" :column="3" bordered size="small">
          <DescriptionsItem
            v-for="(value, key) in cacheInfo.info"
            :key="key"
            :label="String(key)"
          >
            {{ value }}
          </DescriptionsItem>
        </Descriptions>
      </Card>

      <!-- 命令统计 -->
      <Card title="命令统计">
        <div class="flex gap-6">
          <Statistic title="Key 总数" :value="cacheInfo?.dbSize || 0" />
        </div>
        <Table
          v-if="cacheInfo?.commandStats?.length"
          :data-source="cacheInfo.commandStats"
          :pagination="false"
          size="small"
          class="mt-4"
          row-key="name"
        >
          <Table.Column title="命令" data-index="name" />
          <Table.Column title="调用次数" data-index="value" />
        </Table>
      </Card>

      <div class="text-center">
        <Button type="primary" @click="loadCacheInfo" :loading="loading">
          刷新缓存信息
        </Button>
      </div>
    </div>
  </Page>
</template>
