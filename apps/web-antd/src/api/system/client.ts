import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemClientApi {
  export interface SystemClient {
    [key: string]: any;
    id: number;
    clientId?: string;
    clientKey: string;
    clientSecret: string;
    grantType?: string;
    grantTypeList: string[];
    deviceType?: string;
    activeTimeout?: number;
    timeout?: number;
    status: string;
    createTime?: string;
  }

  export interface SystemClientPageQuery extends Recordable<any> {
    clientId?: string;
    clientKey?: string;
    status?: string;
  }
}

export function getClientList(params?: SystemClientApi.SystemClientPageQuery) {
  return requestClient.get<Array<SystemClientApi.SystemClient>>(
    '/system/client/list',
    { params },
  );
}

export function getClient(id: number) {
  return requestClient.get<SystemClientApi.SystemClient>(
    `/system/client/${id}`,
  );
}

export function createClient(data: SystemClientApi.SystemClient) {
  return requestClient.postWithMsg('/system/client', data);
}

export function updateClient(data: SystemClientApi.SystemClient) {
  return requestClient.putWithMsg('/system/client', data);
}

export function changeClientStatus(data: { id: number; status: string }) {
  return requestClient.putWithMsg('/system/client/changeStatus', data);
}

export function deleteClient(ids: string) {
  return requestClient.deleteWithMsg(`/system/client/${ids}`);
}
