<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, Input, message, Modal, Table } from 'ant-design-vue';

import {
  clearCacheAll,
  clearCacheKey,
  clearCacheName,
  getCacheKeys,
  getCacheNames,
  getCacheValue,
} from '#/api/monitor/cache';

const cacheNames = ref<any[]>([]);
const cacheKeys = ref<string[]>([]);
const cacheForm = ref({ cacheName: '', cacheKey: '', cacheValue: '' });
const loadingNames = ref(false);
const loadingKeys = ref(false);
const currentCacheName = ref('');

async function loadCacheNames() {
  loadingNames.value = true;
  try {
    cacheNames.value = await getCacheNames();
  } finally {
    loadingNames.value = false;
  }
}

async function onSelectCacheName(row: any) {
  currentCacheName.value = row.cacheName;
  loadingKeys.value = true;
  cacheForm.value = { cacheName: '', cacheKey: '', cacheValue: '' };
  try {
    cacheKeys.value = await getCacheKeys(row.cacheName);
  } finally {
    loadingKeys.value = false;
  }
}

async function onSelectCacheKey(key: string) {
  const res = await getCacheValue(currentCacheName.value, key);
  cacheForm.value = {
    cacheName: res.cacheName,
    cacheKey: res.cacheKey,
    cacheValue: res.cacheValue,
  };
}

function onRefreshNames() {
  loadCacheNames();
  message.success('刷新缓存列表成功');
}

function onRefreshKeys() {
  if (!currentCacheName.value) return;
  getCacheKeys(currentCacheName.value).then((keys) => {
    cacheKeys.value = keys;
  });
  message.success('刷新键名列表成功');
}

function onClearCacheName(row: any) {
  Modal.confirm({
    title: '确认清理',
    content: `确认要清理缓存"${row.cacheName}"吗？`,
    onOk: async () => {
      await clearCacheName(row.cacheName);
      message.success('清理成功');
      if (currentCacheName.value === row.cacheName) {
        cacheKeys.value = [];
        cacheForm.value = { cacheName: '', cacheKey: '', cacheValue: '' };
      }
    },
  });
}

function onClearCacheKey(key: string) {
  Modal.confirm({
    title: '确认清理',
    content: `确认要清理键名"${key}"吗？`,
    onOk: async () => {
      await clearCacheKey(key);
      message.success('清理成功');
      onRefreshKeys();
    },
  });
}

function onClearAll() {
  Modal.confirm({
    title: '确认清理',
    content: '确认要清理全部缓存吗？',
    onOk: async () => {
      await clearCacheAll();
      message.success('清理全部缓存成功');
      cacheKeys.value = [];
      cacheForm.value = { cacheName: '', cacheKey: '', cacheValue: '' };
      loadCacheNames();
    },
  });
}

function nameFormatter(name: string) {
  return name.replace(':', '');
}

function keyFormatter(key: string) {
  return key.replace(currentCacheName.value, '');
}

onMounted(() => {
  loadCacheNames();
});
</script>

<template>
  <Page auto-content-height>
    <div class="grid grid-cols-3 gap-4" style="height: calc(100vh - 160px)">
      <!-- Cache Names -->
      <Card title="缓存列表" class="overflow-auto">
        <template #extra>
          <Button size="small" type="link" @click="onRefreshNames">
            刷新
          </Button>
        </template>
        <Table
          :data-source="cacheNames"
          :loading="loadingNames"
          :pagination="false"
          size="small"
          row-key="cacheName"
          :custom-row="
            (record: any) => ({ onClick: () => onSelectCacheName(record) })
          "
        >
          <Table.Column
            title="#"
            width="50"
            :custom-render="({ index }: any) => index + 1"
          />
          <Table.Column
            title="缓存名称"
            data-index="cacheName"
            :custom-render="({ text }: any) => nameFormatter(text)"
            ellipsis
          />
          <Table.Column title="备注" data-index="remark" ellipsis />
          <Table.Column title="操作" width="50" align="center">
            <template #default="{ record }">
              <Button
                size="small"
                type="link"
                danger
                @click.stop="onClearCacheName(record)"
              >
                删除
              </Button>
            </template>
          </Table.Column>
        </Table>
      </Card>

      <!-- Cache Keys -->
      <Card title="键名列表" class="overflow-auto">
        <template #extra>
          <Button size="small" type="link" @click="onRefreshKeys">
            刷新
          </Button>
        </template>
        <Table
          :data-source="cacheKeys"
          :loading="loadingKeys"
          :pagination="false"
          size="small"
          row-key="(r: string) => r"
          :custom-row="
            (key: string) => ({ onClick: () => onSelectCacheKey(key) })
          "
        >
          <Table.Column
            title="#"
            width="50"
            :custom-render="({ index }: any) => index + 1"
          />
          <Table.Column
            title="缓存键名"
            :custom-render="({ record }: any) => keyFormatter(record)"
            ellipsis
          />
          <Table.Column title="操作" width="50" align="center">
            <template #default="{ record }">
              <Button
                size="small"
                type="link"
                danger
                @click.stop="onClearCacheKey(record)"
              >
                删除
              </Button>
            </template>
          </Table.Column>
        </Table>
      </Card>

      <!-- Cache Value -->
      <Card title="缓存内容" class="overflow-auto">
        <template #extra>
          <Button size="small" type="link" danger @click="onClearAll">
            清理全部
          </Button>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block mb-1 text-sm text-gray-500">缓存名称:</label>
            <Input :value="cacheForm.cacheName" read-only />
          </div>
          <div>
            <label class="block mb-1 text-sm text-gray-500">缓存键名:</label>
            <Input :value="cacheForm.cacheKey" read-only />
          </div>
          <div>
            <label class="block mb-1 text-sm text-gray-500">缓存内容:</label>
            <Input.TextArea
              :value="cacheForm.cacheValue"
              :rows="12"
              read-only
            />
          </div>
        </div>
      </Card>
    </div>
  </Page>
</template>
