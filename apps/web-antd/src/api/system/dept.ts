import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    /** 部门ID */
    deptId: number;
    /** 父部门ID */
    parentId: number;
    /** 父部门名称 */
    parentName?: string;
    /** 祖级列表 */
    ancestors?: string;
    /** 部门名称 */
    deptName: string;
    /** 部门类别编码 */
    deptCategory?: string;
    /** 显示顺序 */
    orderNum: number;
    /** 负责人ID */
    leader?: number;
    /** 负责人 */
    leaderName?: string;
    /** 联系电话 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 部门状态（0正常 1停用） */
    status: string;
    /** 创建时间 */
    createTime?: string;
    /** 子部门 */
    children?: SystemDept[];
    /** 归属部门id（部门树） */
    belongDeptId?: number;
  }

  /** 部门查询参数 */
  export interface SystemDeptPageQuery extends Recordable<any> {
    /** 部门ID */
    deptId?: number;
    /** 父部门ID */
    parentId?: number;
    /** 部门名称 */
    deptName?: string;
    /** 部门状态 */
    status?: string;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptList(params?: SystemDeptApi.SystemDeptPageQuery) {
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(
    '/system/dept/list',
    { params },
  );
}

/**
 * 获取部门详情
 * @param deptId 部门ID
 */
async function getDept(deptId: number) {
  return requestClient.get<SystemDeptApi.SystemDept>(`/system/dept/${deptId}`);
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'deptId' | 'children' | 'parentName' | 'ancestors' | 'leaderName' | 'createTime'>,
) {
  return requestClient.post('/system/dept', data);
}

/**
 * 更新部门
 *
 * @param deptId 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  deptId: number,
  data: Omit<SystemDeptApi.SystemDept, 'deptId' | 'children' | 'parentName' | 'ancestors' | 'leaderName' | 'createTime'>,
) {
  return requestClient.put(`/system/dept/${deptId}`, data);
}

/**
 * 删除部门
 * @param deptId 部门 ID
 */
async function deleteDept(deptId: number) {
  return requestClient.delete(`/system/dept/${deptId}`);
}

export { createDept, deleteDept, getDept, getDeptList, updateDept };
