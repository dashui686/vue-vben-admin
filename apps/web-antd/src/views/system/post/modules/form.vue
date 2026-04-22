<script lang="ts" setup>
import type { SystemPostApi } from '#/api/system/post';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createPost, getPost, updatePost } from '#/api/system/post';
import { handleFormOpenChange } from '#/composables/useFormModal';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const postId = ref<number | undefined>();

const getTitle = computed(() => {
  return postId.value
    ? $t('ui.actionTitle.edit', [$t('system.post.name')])
    : $t('ui.actionTitle.create', [$t('system.post.name')]);
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
        if (postId.value) {
          data.postId = postId.value;
          await updatePost(data);
        } else {
          await createPost(data);
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
      const data = modalApi.getData<SystemPostApi.SystemPost>();
      await handleFormOpenChange(formApi, modalApi, data, {
        getDetailApi: getPost,
        idField: 'postId',
      });
      postId.value = data?.postId;
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
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
