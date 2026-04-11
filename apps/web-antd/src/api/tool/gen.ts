import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ToolGenApi {
  export interface GenTable {
    [key: string]: any;
    tableId: number;
    tableName: string;
    tableComment: string;
    className: string;
    tplCategory: string;
    tplWebType: string;
    packageName: string;
    moduleName: string;
    businessName: string;
    functionName: string;
    functionAuthor: string;
    genType: string;
    genPath: string;
    options?: string;
    remark?: string;
    createTime?: string;
    updateTime?: string;
    columns?: GenTableColumn[];
    treeCode?: string;
    treeParentCode?: string;
    treeName?: string;
    parentMenuId?: number;
    parentMenuName?: string;
    menuIds?: any[];
    subTableName?: string;
    subTableFkName?: string;
    pkColumn?: GenTableColumn;
    dataName?: string;
  }

  export interface GenTableColumn {
    [key: string]: any;
    columnId: number;
    tableId: number;
    columnName: string;
    columnComment: string;
    columnType: string;
    javaType: string;
    javaField: string;
    isPk: string;
    isIncrement: string;
    isRequired: string;
    isInsert: string;
    isEdit: string;
    isList: string;
    isQuery: string;
    queryType: string;
    htmlType: string;
    dictType: string;
    sort: number;
  }

  export interface GenTablePageQuery extends Recordable<any> {
    tableName?: string;
    tableComment?: string;
    dataName?: string;
    beginTime?: string;
    endTime?: string;
  }

  export interface DbTable {
    tableName: string;
    tableComment: string;
    createTime?: string;
    updateTime?: string;
  }

  /** getGenTable 返回的结构 */
  export interface GenTableDetail {
    info: GenTable;
    rows: GenTableColumn[];
    tables: GenTable[];
  }
}

/** 查询生成表列表 */
export function listTable(params?: ToolGenApi.GenTablePageQuery) {
  return requestClient.get<Array<ToolGenApi.GenTable>>('/tool/gen/list', {
    params,
  });
}

/** 查询数据库表列表(未导入) */
export function listDbTable(params?: any) {
  return requestClient.get<Array<ToolGenApi.DbTable>>('/tool/gen/db/list', {
    params,
  });
}

/** 查询表详细信息(返回 {info, rows, tables}) */
export function getGenTable(tableId: number) {
  return requestClient.get<ToolGenApi.GenTableDetail>(
    `/tool/gen/${tableId}`,
  );
}

/** 修改代码生成信息 */
export function updateGenTable(data: ToolGenApi.GenTable) {
  return requestClient.putWithMsg('/tool/gen', data);
}

/** 导入表 */
export function importTable(tables: string, dataName?: string) {
  return requestClient.postWithMsg('/tool/gen/importTable', undefined, {
    params: { tables, dataName },
  });
}

/** 预览生成代码 */
export function previewTable(tableId: number) {
  return requestClient.get<Record<string, string>>(
    `/tool/gen/preview/${tableId}`,
  );
}

/** 删除表数据 */
export function delTable(tableIds: string) {
  return requestClient.deleteWithMsg(`/tool/gen/${tableIds}`);
}

/** 生成代码(自定义路径) */
export function genCode(tableName: string) {
  return requestClient.get(`/tool/gen/genCode/${tableName}`);
}

/** 同步数据库 */
export function synchDb(tableName: string) {
  return requestClient.get(`/tool/gen/synchDb/${tableName}`);
}

/** 批量生成代码(下载zip) */
export async function batchGenCode(tableIds: string) {
  const blob = await requestClient.download<Blob>('/tool/gen/batchGenCode', {
    params: { tableIdStr: tableIds },
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ruoyi.zip';
  link.click();
  window.URL.revokeObjectURL(url);
}

/** 获取数据源名称列表 */
export function getDataNames() {
  return requestClient.get<Array<string>>('/tool/gen/getDataNames');
}
