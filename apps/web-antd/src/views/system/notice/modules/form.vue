<script lang="ts" setup>
import type { SystemNoticeApi } from '#/api/system/notice';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createNotice, getNotice, updateNotice } from '#/api/system/notice';
import { handleFormOpenChange } from '#/composables/useFormModal';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});
const noticeId = ref<number | undefined>();
const getTitle = computed(() =>
  noticeId.value
    ? $t('ui.actionTitle.edit', [$t('system.notice.name')])
    : $t('ui.actionTitle.create', [$t('system.notice.name')]),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (noticeId.value) {
          data.noticeId = noticeId.value;
          await updateNotice(data);
        } else {
          await createNotice(data);
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
      const data = modalApi.getData<SystemNoticeApi.SystemNotice>();
      await handleFormOpenChange(formApi, modalApi, data, {
        getDetailApi: getNotice,
        idField: 'noticeId',
      });
      noticeId.value = data?.noticeId;
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[600px]">
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
