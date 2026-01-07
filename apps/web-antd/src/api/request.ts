/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';
import type {
  BaseAsymmetricEncryption,
  BaseSymmetricEncryption,
} from '@vben/utils';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
  stringify,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';
import {
  AesEncryption,
  encodeBase64,
  randomStr,
  RsaEncryption,
} from '@vben/utils';

import { message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL, clientId, enableEncrypt, rsaPublicKey, rsaPrivateKey } =
  useAppConfig(import.meta.env, import.meta.env.PROD);

/**
 * 使用非对称加密的实现 前端已经实现RSA/SM2
 *
 * 你可以使用Sm2Encryption来替换 后端也需要同步替换公私钥对
 *
 * 后端文件位置: ruoyi-common/ruoyi-common-encrypt/src/main/java/org/dromara/common/encrypt/filter/DecryptRequestBodyWrapper.java
 *
 * 注意前端sm-crypto库只能支持04开头的公钥! 否则加密会有问题 你可以使用前端的import { logSm2KeyPair } from '@vben/utils';方法来生成
 * 如果你生成的公钥开头不是04 那么不能正常加密
 * 或者使用这个网站来生成: https://tool.hiofd.com/sm2-key-gen/
 */
const asymmetricEncryption: BaseAsymmetricEncryption = new RsaEncryption({
  publicKey: rsaPublicKey,
  privateKey: rsaPrivateKey,
});
/**
 * 对称加密的实现 AES/SM4
 */
const symmetricEncryption: BaseSymmetricEncryption = new AesEncryption();

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
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
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
      const language = preferences.app.locale.replace('-', '_');
      config.headers['Accept-Language'] = language;
      config.headers['Content-Language'] = language;
      /**
       * 添加全局clientId
       * 关于header的clientId被错误绑定到实体类
       * https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IC0BDS
       */
      config.headers.ClientID = clientId;
      /**
       * 格式化get/delete参数
       * 如果包含自定义的paramsSerializer则不走此逻辑
       */
      if (
        ['DELETE', 'GET'].includes(config.method?.toUpperCase() || '') &&
        config.params &&
        !config.paramsSerializer
      ) {
        /**
         * 1. 格式化参数 微服务在传递区间时间选择(后端的params Map类型参数)需要格式化key 否则接收不到
         * 2. 数组参数需要格式化 后端才能正常接收 会变成arr=1&arr=2&arr=3的格式来接收
         */
        config.paramsSerializer = (params) =>
          stringify(params, { arrayFormat: 'repeat' });
      }

      const { encrypt } = config;
      // 全局开启请求加密功能 && 该请求开启 && 是post/put请求
      if (
        enableEncrypt &&
        encrypt &&
        ['POST', 'PUT'].includes(config.method?.toUpperCase() || '')
      ) {
        // sm4这里改为randomStr(16)
        const key = randomStr(32);
        const keyWithBase64 = encodeBase64(key);
        config.headers['encrypt-key'] =
          asymmetricEncryption.encrypt(keyWithBase64);
        /**
         * axios会默认给字符串前后加上引号 RSA可以正常解密(加不加都能解密) 但是SM2不行(大坑!!!)
         * 这里通过transformRequest强制返回原始内容
         */
        config.transformRequest = (data) => data;

        config.data =
          typeof config.data === 'object'
            ? symmetricEncryption.encrypt(JSON.stringify(config.data), key)
            : symmetricEncryption.encrypt(config.data, key);
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
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
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
