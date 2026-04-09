import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemNoticeApi {
  export interface SystemNotice {
    [key: string]: any;
    noticeId: number;
    noticeTitle: string;
    noticeType: string;
    noticeContent?: string;
    status: string;
    remark?: string;
    createBy?: number;
    createByName?: string;
    createTime?: string;
  }

  export interface SystemNoticePageQuery extends Recordable<any> {
    noticeTitle?: string;
    noticeType?: string;
    createBy?: number;
    status?: string;
  }
}

export function getNoticeList(params?: SystemNoticeApi.SystemNoticePageQuery) {
  return requestClient.get<Array<SystemNoticeApi.SystemNotice>>(
    '/system/notice/list',
    { params },
  );
}

export function getNotice(noticeId: number) {
  return requestClient.get<SystemNoticeApi.SystemNotice>(
    `/system/notice/${noticeId}`,
  );
}

export function createNotice(data: SystemNoticeApi.SystemNotice) {
  return requestClient.postWithMsg('/system/notice', data);
}

export function updateNotice(data: SystemNoticeApi.SystemNotice) {
  return requestClient.putWithMsg('/system/notice', data);
}

export function deleteNotice(noticeIds: string) {
  return requestClient.deleteWithMsg(`/system/notice/${noticeIds}`);
}
