<script lang="ts" setup>
import type { SystemClientApi } from '#/api/system/client';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createClient, getClient, updateClient } from '#/api/system/client';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});
const currentId = ref<number | undefined>();
const getTitle = computed(() =>
  currentId.value
    ? $t('ui.actionTitle.edit', [$t('system.client.name')])
    : $t('ui.actionTitle.create', [$t('system.client.name')]),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (currentId.value) {
          data.id = currentId.value;
          await updateClient(data);
        } else {
          await createClient(data);
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
      const data = modalApi.getData<SystemClientApi.SystemClient>();
      formApi.resetForm();
      if (data?.id) {
        const detail = await getClient(data.id);
        currentId.value = detail.id;
        formApi.setValues(detail);
      } else {
        currentId.value = undefined;
        formApi.setValues(data || {});
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="formApi.resetForm()">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
