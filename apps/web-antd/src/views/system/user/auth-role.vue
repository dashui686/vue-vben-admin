<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Spin,
  Table,
} from 'ant-design-vue';

import { getAuthRole, insertAuthRole } from '#/api/system/user';

const route = useRoute();
const router = useRouter();
const userId = route.params.userId as string;

const loading = ref(false);
const submitLoading = ref(false);
const userInfo = ref<Record<string, any>>({});
const roles = ref<
  Array<{
    createTime: string;
    flag: boolean;
    roleId: number;
    roleKey: string;
    roleName: string;
    status: string;
  }>
>([]);
const selectedRowKeys = ref<number[]>([]);
const pageNum = ref(1);
const pageSize = ref(10);

const total = ref(0);

const columns = [
  {
    title: '角色编号',
    dataIndex: 'roleId',
    width: 100,
    align: 'center' as const,
  },
  { title: '角色名称', dataIndex: 'roleName', align: 'center' as const },
  { title: '权限字符', dataIndex: 'roleKey', align: 'center' as const },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    align: 'center' as const,
  },
];

const rowSelection = {
  selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys;
  },
  getCheckboxProps: (record: any) => ({
    disabled: record.status === '1',
  }),
};

function handleTableChange(pagination: any) {
  pageNum.value = pagination.current;
  pageSize.value = pagination.pageSize;
}

async function handleSubmit() {
  submitLoading.value = true;
  try {
    await insertAuthRole(userId, selectedRowKeys.value.join(','));
    message.success('授权成功');
    handleBack();
  } finally {
    submitLoading.value = false;
  }
}

function handleBack() {
  router.push('/system/user');
}

onMounted(async () => {
  loading.value = true;
  try {
    const res = await getAuthRole(userId);
    userInfo.value = res.user || {};
    roles.value = res.roles || [];
    total.value = roles.value.length;
    // 预选已有角色
    selectedRowKeys.value = roles.value
      .filter((r) => r.flag)
      .map((r) => r.roleId);
  } catch {
    message.error('获取角色信息失败');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Page auto-content-height>
    <Spin :spinning="loading">
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>分配角色</span>
            <div class="flex gap-2">
              <Button @click="handleBack">返回</Button>
              <Button
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
              >
                提交
              </Button>
            </div>
          </div>
        </template>

        <!-- 基本信息 -->
        <h4 class="mb-3 text-base font-bold">基本信息</h4>
        <Form layout="inline" class="mb-6">
          <FormItem label="用户昵称">
            <Input :value="userInfo.nickName" disabled />
          </FormItem>
          <FormItem label="登录账号">
            <Input :value="userInfo.userName" disabled />
          </FormItem>
        </Form>

        <!-- 角色列表 -->
        <h4 class="mb-3 text-base font-bold">角色信息</h4>
        <Table
          :data-source="roles"
          :columns="columns"
          :row-selection="rowSelection"
          row-key="roleId"
          :pagination="{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t: number) => `共 ${t} 条`,
          }"
          size="small"
          @change="handleTableChange"
        />
      </Card>
    </Spin>
  </Page>
</template>
