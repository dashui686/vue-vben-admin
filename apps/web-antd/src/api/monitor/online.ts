import { requestClient } from '#/api/request';

export namespace MonitorOnlineApi {
  export interface SysUserOnline {
    [key: string]: any;
    tokenId: string;
    deptName?: string;
    userName: string;
    clientKey?: string;
    deviceType?: string;
    ipaddr?: string;
    loginLocation?: string;
    browser?: string;
    os?: string;
    loginTime?: string;
  }
}

export function getOnlineList(params?: { ipaddr?: string; userName?: string }) {
  return requestClient.get<Array<MonitorOnlineApi.SysUserOnline>>(
    '/monitor/online/list',
    { params },
  );
}

export function forceLogout(tokenId: string) {
  return requestClient.deleteWithMsg(`/monitor/online/${tokenId}`);
}
