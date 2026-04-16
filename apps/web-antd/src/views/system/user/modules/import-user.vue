<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Checkbox, message, Upload } from 'ant-design-vue';

import { importTemplate, importUserData } from '#/api/system/user';

const emit = defineEmits(['success']);

const fileList = ref<any[]>([]);
const updateSupport = ref(false);
const uploading = ref(false);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (fileList.value.length === 0) {
      message.warning('请选择要上传的文件');
      return;
    }
    uploading.value = true;
    try {
      await importUserData(fileList.value[0], updateSupport.value);
      message.success('导入成功');
      modalApi.close();
      emit('success');
    } finally {
      uploading.value = false;
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      fileList.value = [];
      updateSupport.value = false;
    }
  },
});

function beforeUpload(file: File) {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  if (!isExcel) {
    message.error('仅允许导入xls、xlsx格式文件');
    return Upload.LIST_IGNORE;
  }
  fileList.value = [file];
  return false;
}

function handleRemove() {
  fileList.value = [];
}

async function handleDownloadTemplate() {
  await importTemplate();
}
</script>

<template>
  <Modal title="用户导入" class="w-[400px]">
    <Upload
      :file-list="fileList"
      :before-upload="beforeUpload"
      :max-count="1"
      accept=".xlsx,.xls"
      @remove="handleRemove"
    >
      <Button>选择文件</Button>
    </Upload>
    <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
      <Checkbox v-model:checked="updateSupport">
        是否更新已存在的用户数据
      </Checkbox>
    </div>
    <div class="mt-2 text-sm text-gray-400">
      仅允许导入xls、xlsx格式文件。
      <Button type="link" size="small" @click="handleDownloadTemplate">
        下载模板
      </Button>
    </div>
    <template #prepend-footer>
      <div class="flex-auto">
        <Button @click="modalApi.close()">取消</Button>
      </div>
    </template>
    <template #footer>
      <Button type="primary" :loading="uploading" @click="modalApi.confirm()">
        确定
      </Button>
    </template>
  </Modal>
</template>
