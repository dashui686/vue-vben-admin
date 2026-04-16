import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MonitorLogininforApi {
  export interface SysLogininfor {
    [key: string]: any;
    infoId: number;
    tenantId?: string;
    userName?: string;
    clientKey?: string;
    deviceType?: string;
    ipaddr?: string;
    loginLocation?: string;
    browser?: string;
    os?: string;
    status: number;
    msg?: string;
    loginTime?: string;
  }
  export interface SysLogininforPageQuery extends Recordable<any> {
    userName?: string;
    ipaddr?: string;
    status?: number;
    beginTime?: string;
    endTime?: string;
  }
}

export function getLogininforList(
  params?: MonitorLogininforApi.SysLogininforPageQuery,
) {
  return requestClient.get<Array<MonitorLogininforApi.SysLogininfor>>(
    '/monitor/logininfor/list',
    { params },
  );
}

export function unlockUser(userName: string) {
  return requestClient.get(`/monitor/logininfor/unlock/${userName}`);
}

export function deleteLogininfor(infoIds: string) {
  return requestClient.deleteWithMsg(`/monitor/logininfor/${infoIds}`);
}

export function cleanLogininfor() {
  return requestClient.deleteWithMsg('/monitor/logininfor/clean');
}

export function exportLogininfor(
  data?: MonitorLogininforApi.SysLogininforPageQuery,
) {
  return requestClient.download('/monitor/logininfor/export', {
    data,
    method: 'POST',
  });
}
