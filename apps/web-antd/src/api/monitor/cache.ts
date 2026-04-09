import { requestClient } from '#/api/request';

export namespace MonitorCacheApi {
  export interface CacheListInfoVo {
    info: Record<string, any>;
    dbSize: number;
    commandStats: Array<{ name: string; value: number }>;
  }
}

export function getCacheInfo() {
  return requestClient.get<MonitorCacheApi.CacheListInfoVo>('/monitor/cache');
}
