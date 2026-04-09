import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemConfigApi {
  export interface SystemConfig {
    [key: string]: any;
    configId: number;
    configName: string;
    configKey: string;
    configValue: string;
    configType: string;
    remark?: string;
    createTime?: string;
  }

  export interface SystemConfigPageQuery extends Recordable<any> {
    configName?: string;
    configKey?: string;
    configType?: string;
  }
}

export function getConfigList(params?: SystemConfigApi.SystemConfigPageQuery) {
  return requestClient.get<Array<SystemConfigApi.SystemConfig>>(
    '/system/config/list',
    { params },
  );
}

export function getConfig(configId: number) {
  return requestClient.get<SystemConfigApi.SystemConfig>(
    `/system/config/${configId}`,
  );
}

export function getConfigByKey(configKey: string) {
  return requestClient.get<string>(`/system/config/configKey/${configKey}`);
}

export function createConfig(data: SystemConfigApi.SystemConfig) {
  return requestClient.postWithMsg('/system/config', data);
}

export function updateConfig(data: SystemConfigApi.SystemConfig) {
  return requestClient.putWithMsg('/system/config', data);
}

export function deleteConfig(configIds: string) {
  return requestClient.deleteWithMsg(`/system/config/${configIds}`);
}

export function refreshConfigCache() {
  return requestClient.deleteWithMsg('/system/config/refreshCache');
}
