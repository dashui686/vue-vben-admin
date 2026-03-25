import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    /** 角色ID */
    id: number;
    /** 角色名称 */
    name: string;
    /** 角色权限字符串 */
    roleKey: string;
    /** 显示顺序 */
    roleSort: number;
    /** 数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限 5：仅本人数据权限 6：部门及以下或本人数据权限） */
    dataScope?: string;
    /** 菜单树选择项是否关联显示 */
    menuCheckStrictly?: boolean;
    /** 部门树选择项是否关联显示 */
    deptCheckStrictly?: boolean;
    /** 角色状态（0正常 1停用） */
    status: string;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }

  export interface SystemRolePageQuery extends Recordable<any> {
    /** 角色ID */
    id?: number;
    /** 角色名称 */
    name?: string;
    /** 角色权限字符串 */
    roleKey?: string;
    /** 角色状态 */
    status?: string;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: SystemRoleApi.SystemRolePageQuery) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/list',
    { params },
  );
}

/**
 * 获取角色详情
 * @param id 角色 ID
 */
async function getRole(id: number) {
  return requestClient.get<SystemRoleApi.SystemRole>(`/system/role/${id}`);
}

/**
 * 获取角色选择框列表
 */
async function getRoleOptionselect(params?: { roleIds?: number[] }) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/optionselect',
    { params },
  );
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/system/role', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  id: number,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  return requestClient.put(`/system/role/${id}`, data);
}

/**
 * 更新角色状态
 *
 * @param data 角色数据(包含status)
 */
async function changeRoleStatus(data: {
  id: number;
  status: string;
}) {
  return requestClient.put('/system/role/changeStatus', data);
}

/**
 * 删除角色
 * @param ids 角色 ID 数组
 */
async function deleteRole(ids: number[]) {
  return requestClient.delete(`/system/role/${ids.join(',')}`);
}

export {
  changeRoleStatus,
  createRole,
  deleteRole,
  getRole,
  getRoleList,
  getRoleOptionselect,
  updateRole,
};
