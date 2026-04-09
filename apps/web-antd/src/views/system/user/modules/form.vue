<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createUser, getUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const userId = ref<number | undefined>();

const getTitle = computed(() => {
  return userId.value
    ? $t('ui.actionTitle.edit', [$t('system.user.name')])
    : $t('ui.actionTitle.create', [$t('system.user.name')]);
});

function resetForm() {
  formApi.resetForm();
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (userId.value) {
          data.userId = userId.value;
          await updateUser(data);
        } else {
          await createUser(data);
        }
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();

      if (data?.userId) {
        // 编辑：获取完整用户信息（含角色/岗位ID）
        const userInfo = await getUser(data.userId);
        userId.value = userInfo.user.userId;
        formApi.setValues({
          ...userInfo.user,
          roleIds: userInfo.roleIds,
          postIds: userInfo.postIds,
        });
      } else {
        // 新增
        userId.value = undefined;
        formApi.setValues(data || {});
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[600px]">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
