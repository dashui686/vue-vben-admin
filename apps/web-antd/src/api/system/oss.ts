import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemOssApi {
  export interface SystemOss {
    [key: string]: any;
    ossId: number;
    fileName: string;
    originalName: string;
    fileSuffix: string;
    url: string;
    createTime?: string;
    createBy?: number;
    createByName?: string;
    service?: string;
  }

  export interface SystemOssPageQuery extends Recordable<any> {
    fileName?: string;
    originalName?: string;
    fileSuffix?: string;
    service?: string;
  }

  export interface SystemOssUploadVo {
    url: string;
    fileName: string;
    ossId: number;
  }

  export interface SystemOssConfig {
    [key: string]: any;
    ossConfigId: number;
    configKey: string;
    accessKey: string;
    secretKey: string;
    bucketName: string;
    prefix: string;
    endpoint: string;
    domain: string;
    isHttps: string;
    region?: string;
    status: string;
    ext1?: string;
    remark?: string;
    accessPolicy: string;
    createTime?: string;
  }

  export interface SystemOssConfigPageQuery extends Recordable<any> {
    configKey?: string;
    bucketName?: string;
    status?: string;
  }
}

/**
 * OSS file list (paginated)
 */
export async function getOssList(params?: SystemOssApi.SystemOssPageQuery) {
  return requestClient.get<Array<SystemOssApi.SystemOss>>(
    '/resource/oss/list',
    { params },
  );
}

/**
 * Get OSS by IDs
 */
export async function getOssByIds(ossIds: string) {
  return requestClient.get<Array<SystemOssApi.SystemOss>>(
    `/resource/oss/listByIds/${ossIds}`,
  );
}

/**
 * Upload file
 */
export async function uploadOssFile(data: FormData) {
  return requestClient.post<SystemOssApi.SystemOssUploadVo>(
    '/resource/oss/upload',
    data,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
}

/**
 * Download file
 */
export async function downloadOss(ossId: number) {
  return requestClient.download(`/resource/oss/download/${ossId}`);
}

/**
 * Delete OSS records
 */
export async function deleteOss(ossIds: string) {
  return requestClient.deleteWithMsg(`/resource/oss/${ossIds}`);
}

/**
 * OSS config list (paginated)
 */
export async function getOssConfigList(
  params?: SystemOssApi.SystemOssConfigPageQuery,
) {
  return requestClient.get<Array<SystemOssApi.SystemOssConfig>>(
    '/resource/oss/config/list',
    { params },
  );
}

/**
 * Get OSS config detail
 */
export async function getOssConfig(ossConfigId: number) {
  return requestClient.get<SystemOssApi.SystemOssConfig>(
    `/resource/oss/config/${ossConfigId}`,
  );
}

/**
 * Add OSS config
 */
export async function createOssConfig(data: SystemOssApi.SystemOssConfig) {
  return requestClient.postWithMsg('/resource/oss/config', data);
}

/**
 * Update OSS config
 */
export async function updateOssConfig(data: SystemOssApi.SystemOssConfig) {
  return requestClient.putWithMsg('/resource/oss/config', data);
}

/**
 * Change OSS config status
 */
export async function changeOssConfigStatus(data: {
  ossConfigId: number;
  status: string;
}) {
  return requestClient.putWithMsg('/resource/oss/config/changeStatus', data);
}

/**
 * Delete OSS config
 */
export async function deleteOssConfig(ossConfigIds: string) {
  return requestClient.deleteWithMsg(`/resource/oss/config/${ossConfigIds}`);
}
