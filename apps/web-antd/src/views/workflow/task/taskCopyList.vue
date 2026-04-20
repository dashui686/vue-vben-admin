<!-- eslint-disable no-use-before-define -->
<script setup lang="ts">
import type { User } from '#/api/system/user/model';
import type { TaskInfo } from '#/api/workflow/task/model';

import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { Page } from '@vben/common-ui';
import { addFullName, getPopupContainer } from '@vben/utils';

import { FilterOutlined, RedoOutlined } from '@ant-design/icons-vue';
import {
  Empty,
  Form,
  FormItem,
  Input,
  InputSearch,
  Popover,
  Spin,
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';
import { cloneDeep, debounce } from 'lodash-es';

import { categoryTree } from '#/api/workflow/category';
import { pageByTaskCopy } from '#/api/workflow/task';

import { ApprovalCard, ApprovalPanel, CopyComponent } from '../components';
import { bottomOffset } from './constant';

const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE;

const taskList = ref<(TaskInfo & { active: boolean })[]>([]);
const taskTotal = ref(0);
const page = ref(1);
const loading = ref(false);

const defaultFormData = {
  flowName: '',
  nodeName: '',
  flowCode: '',
  createByIds: [] as string[],
  category: null as null | number,
};
const formData = ref(cloneDeep(defaultFormData));

const isLoadComplete = computed(
  () => taskList.value.length === taskTotal.value,
);

const cardContainerRef = useTemplateRef('cardContainerRef');

async function reload(resetFields: boolean = false) {
  cardContainerRef.value?.scroll({ top: 0, behavior: 'auto' });

  page.value = 1;
  currentTask.value = undefined;
  taskTotal.value = 0;
  lastSelectId.value = '';

  if (resetFields) {
    formData.value = cloneDeep(defaultFormData);
    selectedUserList.value = [];
  }

  loading.value = true;
  const resp = await pageByTaskCopy({
    pageSize: 10,
    pageNum: page.value,
    ...formData.value,
  });
  taskList.value = resp.rows.map((item) => ({ ...item, active: false }));
  taskTotal.value = resp.total;

  loading.value = false;
  if (taskList.value.length > 0) {
    const firstTask = taskList.value[0];
    currentTask.value = firstTask;
    handleCardClick(firstTask);
  }
}

onMounted(reload);

const handleScroll = debounce(async (e: Event) => {
  if (!e.target) {
    return;
  }
  const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLElement;
  const isBottom = scrollTop + clientHeight >= scrollHeight - bottomOffset;

  if (isBottom && !isLoadComplete.value) {
    loading.value = true;
    page.value += 1;
    const resp = await pageByTaskCopy({
      pageSize: 10,
      pageNum: page.value,
      ...formData.value,
    });
    taskList.value.push(
      ...resp.rows.map((item) => ({ ...item, active: false })),
    );
    loading.value = false;
  }
}, 200);

const lastSelectId = ref('');
const currentTask = ref<TaskInfo>();
async function handleCardClick(item: TaskInfo) {
  const { id } = item;
  if (lastSelectId.value === id) {
    return;
  }
  currentTask.value = item;
  taskList.value.forEach((item) => {
    item.active = item.id === id;
  });
  lastSelectId.value = id;
}

const popoverOpen = ref(false);
const selectedUserList = ref<User[]>([]);
function handleFinish(userList: User[]) {
  popoverOpen.value = true;
  selectedUserList.value = userList;
  formData.value.createByIds = userList.map((item) => item.userId);
}

const treeData = ref<any[]>([]);
onMounted(async () => {
  const tree = await categoryTree();
  addFullName(tree, 'label', ' / ');
  treeData.value = tree;
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-2">
      <div
        class="bg-background relative flex h-full min-w-[320px] max-w-[320px] flex-col rounded-lg"
      >
        <!-- search -->
        <div
          class="bg-background z-100 sticky left-0 top-0 w-full rounded-t-lg border-b-[1px] border-solid p-2"
        >
          <div class="flex items-center gap-1">
            <InputSearch
              v-model:value="formData.flowName"
              placeholder="流程名称搜索"
              @search="reload(false)"
            />
            <Tooltip placement="top" title="重置">
              <a-button @click="reload(true)">
                <RedoOutlined />
              </a-button>
            </Tooltip>
            <Popover
              v-model:open="popoverOpen"
              :get-popup-container="getPopupContainer"
              placement="rightTop"
              trigger="click"
            >
              <template #title>
                <div class="w-full border-b pb-[12px] text-[16px]">搜索</div>
              </template>
              <template #content>
                <Form
                  :colon="false"
                  :label-col="{ span: 6 }"
                  :model="formData"
                  autocomplete="off"
                  class="w-[300px]"
                  @finish="() => reload(false)"
                >
                  <FormItem label="申请人">
                    <CopyComponent
                      v-model:user-list="selectedUserList"
                      @cancel="() => (popoverOpen = true)"
                      @finish="handleFinish"
                    />
                  </FormItem>
                  <FormItem label="流程分类">
                    <TreeSelect
                      v-model:value="formData.category"
                      :allow-clear="true"
                      :field-names="{ label: 'label', value: 'id' }"
                      :get-popup-container="getPopupContainer"
                      :tree-data="treeData"
                      :tree-default-expand-all="true"
                      :tree-line="{ showLeafIcon: false }"
                      placeholder="请选择"
                      tree-node-filter-prop="label"
                      tree-node-label-prop="fullName"
                    />
                  </FormItem>
                  <FormItem label="任务名称">
                    <Input
                      v-model:value="formData.nodeName"
                      placeholder="请输入"
                    />
                  </FormItem>
                  <FormItem label="流程编码">
                    <Input
                      v-model:value="formData.flowCode"
                      placeholder="请输入"
                    />
                  </FormItem>
                  <FormItem>
                    <div class="flex">
                      <a-button block html-type="submit" type="primary">
                        搜索
                      </a-button>
                      <a-button block class="ml-2" @click="reload(true)">
                        重置
                      </a-button>
                    </div>
                  </FormItem>
                </Form>
              </template>
              <a-button>
                <FilterOutlined />
              </a-button>
            </Popover>
          </div>
        </div>
        <div
          ref="cardContainerRef"
          class="thin-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto py-3"
          @scroll="handleScroll"
        >
          <template v-if="taskList.length > 0">
            <ApprovalCard
              v-for="item in taskList"
              :key="item.id"
              :info="item"
              class="mx-2"
              @click="handleCardClick(item)"
            />
          </template>
          <Empty v-else :image="emptyImage" />
          <div
            v-if="isLoadComplete && taskList.length > 0"
            class="flex items-center justify-center text-[14px] opacity-50"
          >
            没有更多数据了
          </div>
          <div
            v-if="loading"
            class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.1)]"
          >
            <Spin tip="加载中..." />
          </div>
        </div>
        <div
          class="bg-background sticky bottom-0 w-full rounded-b-lg border-t-[1px] py-2"
        >
          <div class="flex items-center justify-center">
            共 {{ taskTotal }} 条记录
          </div>
        </div>
      </div>
      <ApprovalPanel :task="currentTask" type="readonly" />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.thin-scrollbar {
  &::-webkit-scrollbar {
    width: 5px;
  }
}

:deep(.ant-card-body) {
  @apply thin-scrollbar;
}
</style>
