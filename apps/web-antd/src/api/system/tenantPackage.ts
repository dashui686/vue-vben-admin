import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemTenantPackageApi {
  export interface SystemTenantPackage {
    [key: string]: any;
    /** 租户套餐id */
    packageId: number;
    /** 套餐名称 */
    packageName: string;
    /** 关联菜单id */
    menuIds?: number[];
    /** 菜单树选择项是否关联显示 */
    menuCheckStrictly?: boolean;
    /** 状态（0正常 1停用） */
    status: string;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }

  export interface SystemTenantPackagePageQuery extends Recordable<any> {
    packageName?: string;
    status?: string;
  }
}

/**
 * 获取租户套餐列表（分页）
 */
export async function getTenantPackageList(
  params?: SystemTenantPackageApi.SystemTenantPackagePageQuery,
) {
  return requestClient.get<Array<SystemTenantPackageApi.SystemTenantPackage>>(
    '/system/tenant/package/list',
    { params },
  );
}

/**
 * 获取租户套餐详情
 */
export async function getTenantPackage(packageId: number) {
  return requestClient.get<SystemTenantPackageApi.SystemTenantPackage>(
    `/system/tenant/package/${packageId}`,
  );
}

/**
 * 获取租户套餐下拉选列表
 */
export async function getTenantPackageSelectList() {
  return requestClient.get<Array<SystemTenantPackageApi.SystemTenantPackage>>(
    '/system/tenant/package/selectList',
  );
}

/**
 * 新增租户套餐
 */
export async function createTenantPackage(
  data: SystemTenantPackageApi.SystemTenantPackage,
) {
  return requestClient.postWithMsg('/system/tenant/package', data);
}

/**
 * 修改租户套餐
 */
export async function updateTenantPackage(
  data: SystemTenantPackageApi.SystemTenantPackage,
) {
  return requestClient.putWithMsg('/system/tenant/package', data);
}

/**
 * 修改租户套餐状态
 */
export async function changeTenantPackageStatus(data: {
  packageId: number;
  status: string;
}) {
  return requestClient.putWithMsg('/system/tenant/package/changeStatus', data);
}

/**
 * 删除租户套餐
 */
export async function deleteTenantPackage(packageIds: string) {
  return requestClient.deleteWithMsg(`/system/tenant/package/${packageIds}`);
}
