<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { z } from '#/adapter/form';
import { getUserProfileApi, updateUserProfileApi } from '#/api/core/user';

const profileBaseSettingRef = ref();

const sexOptions = [
  { label: '男', value: '0' },
  { label: '女', value: '1' },
  { label: '未知', value: '2' },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'nickName',
      component: 'Input',
      label: '用户昵称',
      rules: z
        .string()
        .min(1, '用户昵称不能为空')
        .max(30, '用户昵称不能超过30个字符'),
      componentProps: {
        placeholder: '请输入用户昵称',
      },
    },
    {
      fieldName: 'phonenumber',
      component: 'Input',
      label: '手机号码',
      componentProps: {
        placeholder: '请输入手机号码',
      },
    },
    {
      fieldName: 'email',
      component: 'Input',
      label: '邮箱',
      componentProps: {
        placeholder: '请输入邮箱',
      },
    },
    {
      fieldName: 'sex',
      component: 'Select',
      label: '性别',
      componentProps: {
        options: sexOptions,
        placeholder: '请选择性别',
      },
    },
  ];
});

onMounted(async () => {
  try {
    const data = await getUserProfileApi();
    const user = data.user;
    profileBaseSettingRef.value?.getFormApi().setValues({
      nickName: user.nickName,
      phonenumber: user.phonenumber,
      email: user.email,
      sex: user.sex,
    });
  } catch {
    message.error('获取个人信息失败');
  }
});

async function handleSubmit(values: Record<string, any>) {
  await updateUserProfileApi({
    nickName: values.nickName,
    phonenumber: values.phonenumber,
    email: values.email,
    sex: values.sex,
  });
}
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
