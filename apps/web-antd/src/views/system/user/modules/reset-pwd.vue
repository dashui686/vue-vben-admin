<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { resetUserPwd } from '#/api/system/user';

import { useResetPwdFormSchema } from '../data';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useResetPwdFormSchema(),
  showDefaultActions: false,
});

const userName = ref<string>();
const userId = ref<number>();

const getTitle = computed(() => {
  return `重置密码 - ${userName.value || ''}`;
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await resetUserPwd({ userId: userId.value as number, password: data.password });
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<{ userId: number; userName: string }>();
      userId.value = data?.userId;
      userName.value = data?.userName;
      formApi.resetForm();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
  </Modal>
</template>
