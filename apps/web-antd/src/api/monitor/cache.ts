import { requestClient } from '#/api/request';

export namespace MonitorCacheApi {
  export interface CacheListInfoVo {
    info: Record<string, any>;
    dbSize: number;
    commandStats: Array<{ name: string; value: number }>;
  }

  export interface CacheNameVo {
    cacheName: string;
    remark: string;
  }

  export interface CacheValueVo {
    cacheName: string;
    cacheKey: string;
    cacheValue: string;
  }
}

export function getCacheInfo() {
  return requestClient.get<MonitorCacheApi.CacheListInfoVo>('/monitor/cache');
}

export function getCacheNames() {
  return requestClient.get<MonitorCacheApi.CacheNameVo[]>(
    '/monitor/cache/getNames',
  );
}

export function getCacheKeys(cacheName: string) {
  return requestClient.get<string[]>(`/monitor/cache/getKeys/${cacheName}`);
}

export function getCacheValue(cacheName: string, cacheKey: string) {
  return requestClient.get<MonitorCacheApi.CacheValueVo>(
    `/monitor/cache/getValue/${cacheName}/${cacheKey}`,
  );
}

export function clearCacheName(cacheName: string) {
  return requestClient.deleteWithMsg(
    `/monitor/cache/clearCacheName/${cacheName}`,
  );
}

export function clearCacheKey(cacheKey: string) {
  return requestClient.deleteWithMsg(
    `/monitor/cache/clearCacheKey/${cacheKey}`,
  );
}

export function clearCacheAll() {
  return requestClient.deleteWithMsg('/monitor/cache/clearCacheAll');
}
