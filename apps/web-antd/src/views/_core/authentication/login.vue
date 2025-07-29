<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw, onMounted, ref, nextTick } from 'vue';

import {
  AuthenticationLogin,
  InputCaptcha,
  SliderCaptcha,
  z,
} from '@vben/common-ui';
import { $t } from '@vben/locales';
import { DEFAULT_TENANT_ID } from '@vben/constants';
import { useAuthStore } from '#/store';
import { tenantList, type TenantResp } from '#/api';
import { captchaImage, type CaptchaResponse } from '#/api/core/captcha';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const loginFormRef = ref<InstanceType<typeof AuthenticationLogin> | null>(null);

const captchaInfo = ref<CaptchaResponse>({
  captchaEnabled: false,
  img: '',
  uuid: '',
});

// 验证码loading
const captchaLoading = ref(false);

async function loadCaptcha() {
  try {
    captchaLoading.value = true;

    const resp = await captchaImage();
    if (resp.captchaEnabled) {
      resp.img = `data:image/png;base64,${resp.img}`;
      loginFormRef.value?.getFormApi().setFieldValue('uuid', resp.uuid);
    }
    captchaInfo.value = resp;
  } catch (error) {
    console.error(error);
  } finally {
    captchaLoading.value = false;
  }
}

const tenantInfo = ref<TenantResp>({
  tenantEnabled: false,
  voList: [],
});

async function loadTenant() {
  const resp = await tenantList();
  tenantInfo.value = resp;
  // 选中第一个租户
  if (resp.tenantEnabled && resp.voList.length > 0) {
    const firstTenantId = resp.voList[0]!.tenantId;
    loginFormRef.value?.getFormApi().setFieldValue('tenantId', firstTenantId);
  }
}
onMounted(() => {
  console.log(`the component is now mounted.`);
  loadTenant();
  loadCaptcha();
  nextTick(() => {
    // 这里可以获取到表单实例
    loginFormRef.value?.getFormApi().setFieldValue('grantType', 'password');
  });
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: tenantInfo.value.voList.map(
          (item) =>
            ({
              label: item.companyName,
              value: item.tenantId,
            }) as BasicOption,
        ),
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'tenantId',
      label: $t('authentication.selectAccount'),
      rules: z.string().min(1, { message: $t('authentication.selectAccount') }),
      // .optional()
      // .default('vben'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      dependencies: {
        if: () => tenantInfo.value.tenantEnabled,
        // 可以把这里当做watch
        trigger(values, form) {
          // 给oauth登录使用
          // loginTenantId.value = model?.tenantId ?? DEFAULT_TENANT_ID;
        },
        triggerFields: [''],
      },
      defaultValue: 'admin',
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      defaultValue: 'admin123',
      label: $t('authentication.password'),
      rules: z.string().min(6, { message: $t('authentication.passwordTip') }),
    },
    {
      component: markRaw(InputCaptcha),
      componentProps: {
        captcha: captchaInfo.value.img,
        class: 'focus:border-primary',
        onCaptchaClick: loadCaptcha,
        placeholder: $t('authentication.code'),
        loading: captchaLoading.value,
      },
      dependencies: {
        if: () => captchaInfo.value.captchaEnabled,
        triggerFields: [''],
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.verifyRequiredTip') }),
    },
  ];
});

function handleSubmit(values: Record<string, any>) {
  authStore
    .authLogin(values)
    .then((values) => {
      if (values) {
        // 登录成功后，清除验证码
        captchaInfo.value = {
          captchaEnabled: false,
          img: '',
          uuid: '',
        };
        // 重新加载验证码
        // loadCaptcha();
      }
    })
    .catch((error) => {
      console.error('Login failed:', error);
      // 登录失败后，重新加载验证码
      loadCaptcha();
    });
}
</script>

<template>
  <AuthenticationLogin
    ref="loginFormRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleSubmit"
  />
</template>
