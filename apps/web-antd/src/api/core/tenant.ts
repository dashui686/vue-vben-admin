import { requestClient } from "../request";



/**
 * @param companyName 租户/公司名称
 * @param domain 绑定域名(不带http(s)://) 可选
 * @param tenantId 租户id
 */
export interface TenantOption {
  companyName: string;
  domain?: string;
  tenantId: string;
}

/**
 * @param tenantEnabled 是否启用租户
 * @param voList 租户列表
 */
export interface TenantResp {
  tenantEnabled: boolean;
  voList: TenantOption[];
}

/**
 * 获取租户列表 下拉框使用
 */
export function tenantList() {
  return requestClient.get<TenantResp>('/auth/tenant/list');
}
