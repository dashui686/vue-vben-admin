export type ID = number | string;
export type IDS = (number | string)[];

export interface BaseEntity {
  createBy?: string;
  createDept?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

export interface PageResult<T = any> {
  rows: T[];
  total: number;
}

export interface PageQuery {
  isAsc?: string;
  orderByColumn?: string;
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}
