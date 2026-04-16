<script lang="ts" setup>
import type { MonitorJobApi } from '#/api/monitor/job';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createJob, getJob, updateJob } from '#/api/monitor/job';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const jobId = ref<number | undefined>();

const getTitle = computed(() => {
  return jobId.value ? '修改任务' : '新增任务';
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (jobId.value) {
          data.jobId = jobId.value;
          await updateJob(data);
        } else {
          await createJob(data);
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
      const data = modalApi.getData<MonitorJobApi.SysJob>();
      formApi.resetForm();
      if (data?.jobId) {
        const job = await getJob(data.jobId);
        jobId.value = job.jobId;
        formApi.setValues(job);
      } else {
        jobId.value = undefined;
        formApi.setValues(data || {});
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[600px]">
    <Form class="mx-4" />
  </Modal>
</template>
