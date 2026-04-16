import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MonitorJobApi {
  export interface SysJob {
    [key: string]: any;
    jobId: number;
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    cronExpression: string;
    misfirePolicy: string;
    concurrent: string;
    status: string;
    createTime?: string;
    remark?: string;
  }

  export interface SysJobPageQuery extends Recordable<any> {
    jobName?: string;
    jobGroup?: string;
    status?: string;
  }

  export interface SysJobLog {
    [key: string]: any;
    jobLogId: number;
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    jobMessage?: string;
    status: string;
    exceptionInfo?: string;
    createTime?: string;
    startTime?: string;
    endTime?: string;
    costTime?: number;
  }

  export interface SysJobLogPageQuery extends Recordable<any> {
    jobName?: string;
    jobGroup?: string;
    status?: string;
    beginTime?: string;
    endTime?: string;
  }
}

export const jobGroupMap: Record<string, string> = {
  DEFAULT: '默认',
  SYSTEM: '系统',
};

export function getJobList(params?: MonitorJobApi.SysJobPageQuery) {
  return requestClient.get<Array<MonitorJobApi.SysJob>>('/monitor/job/list', {
    params,
  });
}

export function getJob(jobId: number) {
  return requestClient.get<MonitorJobApi.SysJob>(`/monitor/job/${jobId}`);
}

export function createJob(data: MonitorJobApi.SysJob) {
  return requestClient.postWithMsg('/monitor/job', data);
}

export function updateJob(data: MonitorJobApi.SysJob) {
  return requestClient.putWithMsg('/monitor/job', data);
}

export function deleteJob(jobIds: string) {
  return requestClient.deleteWithMsg(`/monitor/job/${jobIds}`);
}

export function changeJobStatus(jobId: number, status: string) {
  return requestClient.putWithMsg('/monitor/job/changeStatus', {
    jobId,
    status,
  });
}

export function runJob(jobId: number, jobGroup: string) {
  return requestClient.putWithMsg('/monitor/job/run', { jobId, jobGroup });
}

export function exportJob(data?: MonitorJobApi.SysJobPageQuery) {
  return requestClient.download('/monitor/job/export', {
    data,
    method: 'POST',
  });
}

// Job Log APIs

export function getJobLogList(params?: MonitorJobApi.SysJobLogPageQuery) {
  return requestClient.get<Array<MonitorJobApi.SysJobLog>>(
    '/monitor/jobLog/list',
    { params },
  );
}

export function deleteJobLog(jobLogIds: string) {
  return requestClient.deleteWithMsg(`/monitor/jobLog/${jobLogIds}`);
}

export function cleanJobLog() {
  return requestClient.deleteWithMsg('/monitor/jobLog/clean');
}
