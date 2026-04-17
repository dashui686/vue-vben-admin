<script lang="ts" setup>
import type { SystemNoticeApi } from '#/api/system/notice';

import { ref } from 'vue';

import { Empty, List, Modal, Tag } from 'ant-design-vue';

import { getNoticeList } from '#/api/system/notice';

const loading = ref(false);
const notices = ref<SystemNoticeApi.SystemNotice[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

const noticeTypeMap: Record<string, { color: string; label: string }> = {
  '1': { color: 'blue', label: '通知' },
  '2': { color: 'orange', label: '公告' },
};

async function loadNotices() {
  loading.value = true;
  try {
    const res = await getNoticeList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: '0',
    });
    notices.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(page: number) {
  pageNum.value = page;
  loadNotices();
}

function onViewDetail(notice: SystemNoticeApi.SystemNotice) {
  Modal.info({
    title: notice.noticeTitle,
    width: 600,
    content: notice.noticeContent || notice.remark || '暂无内容',
  });
}

loadNotices();
</script>

<template>
  <div class="p-4">
    <List
      :loading="loading"
      :data-source="notices"
      :pagination="{
        current: pageNum,
        pageSize,
        total,
        onChange: onPageChange,
        size: 'small',
        showTotal: (t: number) => `共 ${t} 条`,
      }"
    >
      <template #renderItem="{ item }">
        <List.Item
          class="cursor-pointer hover:bg-gray-50"
          @click="onViewDetail(item)"
        >
          <List.Item.Meta>
            <template #title>
              <div class="flex items-center gap-2">
                <Tag v-if="noticeTypeMap[item.noticeType]" :color="noticeTypeMap[item.noticeType].color">
                  {{ noticeTypeMap[item.noticeType].label }}
                </Tag>
                <span>{{ item.noticeTitle }}</span>
              </div>
            </template>
            <template #description>
              <div class="flex items-center gap-4 text-gray-400">
                <span>{{ item.createByName }}</span>
                <span>{{ item.createTime }}</span>
              </div>
            </template>
          </List.Item.Meta>
        </List.Item>
      </template>
      <template #empty>
        <Empty description="暂无通知公告" />
      </template>
    </List>
  </div>
</template>
