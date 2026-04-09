import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemTenantApi {
  export interface SystemTenant {
    [key: string]: any;
    /** id */
    id: number;
    /** 租户编号 */
    tenantId?: string;
    /** 联系人 */
    contactUserName: string;
    /** 联系电话 */
    contactPhone: string;
    /** 企业名称 */
    companyName: string;
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 统一社会信用代码 */
    licenseNumber?: string;
    /** 地址 */
    address?: string;
    /** 域名 */
    domain?: string;
    /** 企业简介 */
    intro?: string;
    /** 备注 */
    remark?: string;
    /** 租户套餐编号 */
    packageId?: number;
    /** 过期时间 */
    expireTime?: string;
    /** 用户数量（-1不限制） */
    accountCount?: number;
    /** 租户状态（0正常 1停用） */
    status: string;
    /** 创建时间 */
    createTime?: string;
  }

  export interface SystemTenantPageQuery extends Recordable<any> {
    contactUserName?: string;
    contactPhone?: string;
    companyName?: string;
    status?: string;
  }
}

/**
 * 获取租户列表（分页）
 */
export async function getTenantList(
  params?: SystemTenantApi.SystemTenantPageQuery,
) {
  return requestClient.get<Array<SystemTenantApi.SystemTenant>>(
    '/system/tenant/list',
    { params },
  );
}

/**
 * 获取租户详情
 */
export async function getTenant(id: number) {
  return requestClient.get<SystemTenantApi.SystemTenant>(
    `/system/tenant/${id}`,
  );
}

/**
 * 新增租户
 */
export async function createTenant(data: SystemTenantApi.SystemTenant) {
  return requestClient.postWithMsg('/system/tenant', data);
}

/**
 * 修改租户
 */
export async function updateTenant(data: SystemTenantApi.SystemTenant) {
  return requestClient.putWithMsg('/system/tenant', data);
}

/**
 * 修改租户状态
 */
export async function changeTenantStatus(data: { id: number; status: string }) {
  return requestClient.putWithMsg('/system/tenant/changeStatus', data);
}

/**
 * 删除租户
 */
export async function deleteTenant(ids: string) {
  return requestClient.deleteWithMsg(`/system/tenant/${ids}`);
}

/**
 * 同步租户套餐
 */
export async function syncTenantPackage(tenantId: string, packageId: number) {
  return requestClient.get('/system/tenant/syncTenantPackage', {
    params: { tenantId, packageId },
  });
}
