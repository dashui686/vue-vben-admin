import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemPostApi {
  export interface SystemPost {
    [key: string]: any;
    /** 岗位ID */
    postId: number;
    /** 部门id */
    deptId: number;
    /** 岗位编码 */
    postCode: string;
    /** 岗位名称 */
    postName: string;
    /** 岗位类别编码 */
    postCategory?: string;
    /** 显示顺序 */
    postSort: number;
    /** 状态（0正常 1停用） */
    status: string;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 部门名 */
    deptName?: string;
  }

  export interface SystemPostPageQuery extends Recordable<any> {
    postCode?: string;
    postName?: string;
    postCategory?: string;
    status?: string;
  }
}

/**
 * 获取岗位列表（分页）
 */
export async function getPostList(params?: SystemPostApi.SystemPostPageQuery) {
  return requestClient.get<Array<SystemPostApi.SystemPost>>(
    '/system/post/list',
    { params },
  );
}

/**
 * 获取岗位详情
 */
export async function getPost(postId: number) {
  return requestClient.get<SystemPostApi.SystemPost>(`/system/post/${postId}`);
}

/**
 * 获取岗位选择框列表
 */
export async function getPostOptionSelect(params?: {
  deptId?: number;
  postIds?: number[];
}) {
  return requestClient.get<Array<SystemPostApi.SystemPost>>(
    '/system/post/optionselect',
    { params },
  );
}

/**
 * 新增岗位
 */
export async function createPost(data: SystemPostApi.SystemPost) {
  return requestClient.postWithMsg('/system/post', data);
}

/**
 * 修改岗位
 */
export async function updatePost(data: SystemPostApi.SystemPost) {
  return requestClient.putWithMsg('/system/post', data);
}

/**
 * 修改岗位状态
 */
export async function changePostStatus(data: {
  postId: number;
  status: string;
}) {
  return requestClient.putWithMsg('/system/post/changeStatus', data);
}

/**
 * 删除岗位
 */
export async function deletePost(postIds: string) {
  return requestClient.deleteWithMsg(`/system/post/${postIds}`);
}

/**
 * 获取部门树列表
 */
export async function getDeptTree() {
  return requestClient.get('/system/post/deptTree');
}

export async function exportPost(data?: SystemPostApi.SystemPostPageQuery) {
  return requestClient.download('/system/post/export', {
    data,
    method: 'POST',
  });
}
