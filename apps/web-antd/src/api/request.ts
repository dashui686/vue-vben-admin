/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

// import { refreshTokenApi } from './core';
import {
  encryptBase64,
  encryptWithAes,
  generateAesKey,
} from '#/utils/encryption/crypto';
import * as encryptUtil from '#/utils/encryption/jsencrypt';
const { apiURL, clientId, enableEncrypt } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    // const accessStore = useAccessStore();
    // const resp = await refreshTokenApi();
    // const newToken = resp.data;
    // accessStore.setAccessToken(newToken);
    // return newToken;
    return '';
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      // 添加token
      config.headers.Authorization = formatToken(accessStore.accessToken);

      /**
       * locale跟后台不一致 需要转换
       */
      config.headers['Accept-Language'] = preferences.app.locale;
      config.headers['Content-Language'] = preferences.app.locale;
      /**
       * 添加全局clientId
       * 关于header的clientId被错误绑定到实体类
       * https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IC0BDS
       */
      config.headers['clientId'] = clientId;

      // 全局开启请求加密功能 && 该请求开启 && 是post/put请求
      // const { encrypt } = config;
      if (
        enableEncrypt &&
        ['POST', 'PUT'].includes(config.method?.toUpperCase() || '')
      ) {
        const aesKey = generateAesKey();
        config.headers['encrypt-key'] = encryptUtil.encrypt(
          encryptBase64(aesKey),
        );

        config.data =
          typeof config.data === 'object'
            ? encryptWithAes(JSON.stringify(config.data), aesKey)
            : encryptWithAes(config.data, aesKey);
      }
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 200,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.msg ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
