import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDictTypeApi {
  export interface SystemDictType {
    [key: string]: any;
    dictId: number;
    dictName: string;
    dictType: string;
    remark?: string;
    createTime?: string;
  }

  export interface SystemDictTypePageQuery extends Recordable<any> {
    dictName?: string;
    dictType?: string;
    status?: string;
  }
}

export namespace SystemDictDataApi {
  export interface SystemDictData {
    [key: string]: any;
    dictCode: number;
    dictSort: number;
    dictLabel: string;
    dictValue: string;
    dictType: string;
    cssClass?: string;
    listClass?: string;
    isDefault?: string;
    status: string;
    remark?: string;
    createTime?: string;
  }

  export interface SystemDictDataPageQuery extends Recordable<any> {
    dictType?: string;
    dictLabel?: string;
    status?: string;
  }
}

// ===== 字典类型 =====

export function getDictTypeList(
  params?: SystemDictTypeApi.SystemDictTypePageQuery,
) {
  return requestClient.get<Array<SystemDictTypeApi.SystemDictType>>(
    '/system/dict/type/list',
    { params },
  );
}

export function getDictType(dictId: number) {
  return requestClient.get<SystemDictTypeApi.SystemDictType>(
    `/system/dict/type/${dictId}`,
  );
}

export function getDictTypeOptionselect() {
  return requestClient.get<Array<SystemDictTypeApi.SystemDictType>>(
    '/system/dict/type/optionselect',
  );
}

export function createDictType(data: SystemDictTypeApi.SystemDictType) {
  return requestClient.postWithMsg('/system/dict/type', data);
}

export function updateDictType(data: SystemDictTypeApi.SystemDictType) {
  return requestClient.putWithMsg('/system/dict/type', data);
}

export function deleteDictType(dictIds: string) {
  return requestClient.deleteWithMsg(`/system/dict/type/${dictIds}`);
}

export function refreshDictCache() {
  return requestClient.deleteWithMsg('/system/dict/type/refreshCache');
}

export function exportDictType(
  data?: SystemDictTypeApi.SystemDictTypePageQuery,
) {
  return requestClient.download('/system/dict/type/export', {
    data,
    method: 'POST',
  });
}

// ===== 字典数据 =====

export function getDictDataList(
  params?: SystemDictDataApi.SystemDictDataPageQuery,
) {
  return requestClient.get<Array<SystemDictDataApi.SystemDictData>>(
    '/system/dict/data/list',
    { params },
  );
}

export function getDictData(dictCode: number) {
  return requestClient.get<SystemDictDataApi.SystemDictData>(
    `/system/dict/data/${dictCode}`,
  );
}

export function getDictDataByType(dictType: string) {
  return requestClient.get<Array<SystemDictDataApi.SystemDictData>>(
    `/system/dict/data/type/${dictType}`,
  );
}

export function createDictData(data: SystemDictDataApi.SystemDictData) {
  return requestClient.postWithMsg('/system/dict/data', data);
}

export function updateDictData(data: SystemDictDataApi.SystemDictData) {
  return requestClient.putWithMsg('/system/dict/data', data);
}

export function deleteDictData(dictCodes: string) {
  return requestClient.deleteWithMsg(`/system/dict/data/${dictCodes}`);
}
