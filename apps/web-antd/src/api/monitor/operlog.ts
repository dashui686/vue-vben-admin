import type { Recordable } from '@vben/types';
import { requestClient } from '#/api/request';

export namespace MonitorOperlogApi {
  export interface SysOperLog {
    [key: string]: any;
    operId: number;
    tenantId?: string;
    title: string;
    businessType: number;
    method?: string;
    requestMethod?: string;
    operatorType?: number;
    operName?: string;
    deptName?: string;
    operUrl?: string;
    operIp?: string;
    operLocation?: string;
    operParam?: string;
    jsonResult?: string;
    status: number;
    errorMsg?: string;
    operTime?: string;
    costTime?: number;
  }
  export interface SysOperLogPageQuery extends Recordable<any> {
    title?: string;
    operName?: string;
    businessType?: number;
    status?: number;
    beginTime?: string;
    endTime?: string;
  }
}

export function getOperlogList(params?: MonitorOperlogApi.SysOperLogPageQuery) {
  return requestClient.get<Array<MonitorOperlogApi.SysOperLog>>(
    '/monitor/operlog/list',
    { params },
  );
}

export function deleteOperlog(operIds: string) {
  return requestClient.deleteWithMsg(`/monitor/operlog/${operIds}`);
}

export function cleanOperlog() {
  return requestClient.deleteWithMsg('/monitor/operlog/clean');
}
