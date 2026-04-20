interface TreeHelperConfig {
  children: string;
  id: string;
  pid: string;
}

type Fn = (node: any, parentNode?: any) => any;

// Default config
const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  pid: 'parentId',
  children: 'children',
};

// Get config. Object.assign copies from one or more source objects to target object
const getConfig = (config: Partial<TreeHelperConfig>) =>
  Object.assign({}, DEFAULT_CONFIG, config);

// tree from list
export function listToTree<T = any>(
  list: any[],
  config: Partial<TreeHelperConfig> = {},
): T[] {
  const conf = getConfig(config) as TreeHelperConfig;
  const nodeMap = new Map();
  const result: T[] = [];
  const { id, pid, children } = conf;

  for (const node of list) {
    node[children] = node[children] || [];
    nodeMap.set(node[id], node);
  }
  for (const node of list) {
    const parent = nodeMap.get(node[pid]);
    (parent ? parent[children] : result).push(node);
  }
  return result;
}

export function treeToList<T = any>(
  tree: any,
  config: Partial<TreeHelperConfig> = {},
): T {
  config = getConfig(config);
  const children = (config as TreeHelperConfig).children;
  const result: any = [...tree];
  for (let i = 0; i < result.length; i++) {
    if (!result[i][children]) continue;
    result.splice(i + 1, 0, ...result[i][children]);
  }
  return result;
}

export function findNode<T = any>(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
): null | T {
  config = getConfig(config);
  const children = (config as TreeHelperConfig).children;
  const list = [...tree];
  for (const node of list) {
    if (func(node)) return node;
    node[children] && list.push(...node[children]);
  }
  return null;
}

export function findNodeAll<T = any>(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config);
  const children = (config as TreeHelperConfig).children;
  const list = [...tree];
  const result: T[] = [];
  for (const node of list) {
    func(node) && result.push(node);
    node[children] && list.push(...node[children]);
  }
  return result;
}

export function findPath<T = any>(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
): null | T | T[] {
  config = getConfig(config);
  const path: T[] = [];
  const list = [...tree];
  const visitedSet = new Set();
  const children = (config as TreeHelperConfig).children;
  while (list.length > 0) {
    const node = list[0];
    if (visitedSet.has(node)) {
      path.pop();
      list.shift();
    } else {
      visitedSet.add(node);
      node[children] && list.unshift(...node[children]);
      path.push(node);
      if (func(node)) {
        return path;
      }
    }
  }
  return null;
}

export function findPathAll(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
) {
  config = getConfig(config);
  const path: any[] = [];
  const list = [...tree];
  const result: any[] = [];
  const children = (config as TreeHelperConfig).children;
  const visitedSet = new Set();
  while (list.length > 0) {
    const node = list[0];
    if (visitedSet.has(node)) {
      path.pop();
      list.shift();
    } else {
      visitedSet.add(node);
      node[children] && list.unshift(...node[children]);
      path.push(node);
      func(node) && result.push([...path]);
    }
  }
  return result;
}

export function filter<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config);
  const children = config.children as string;

  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        node[children] = node[children] && listFilter(node[children]);
        return func(node) || (node[children] && node[children].length > 0);
      });
  }

  return listFilter(tree);
}

export function forEach<T = any>(
  tree: T[],
  func: (n: T) => any,
  config: Partial<TreeHelperConfig> = {},
): void {
  config = getConfig(config);
  const list: any[] = [...tree];
  const { children } = config;
  for (let i = 0; i < list.length; i++) {
    if (func(list[i])) {
      return;
    }
    children &&
      list[i][children] &&
      list.splice(i + 1, 0, ...list[i][children]);
  }
}

/**
 * Extract tree specified structure
 */
export function treeMap<T = any>(
  treeData: T[],
  opt: { children?: string; conversion: Fn },
): T[] {
  return treeData.map((item) => treeMapEach(item, opt));
}

/**
 * Extract tree specified structure (single node)
 */
export function treeMapEach(
  data: any,
  { conversion, children = 'children' }: { children?: string; conversion: Fn },
) {
  const haveChildren =
    Array.isArray(data[children]) && data[children].length > 0;
  const conversionData = conversion(data) || {};
  return haveChildren
    ? {
        ...conversionData,
        [children]: data[children].map((i: number) =>
          treeMapEach(i, {
            children,
            conversion,
          }),
        ),
      }
    : {
        ...conversionData,
      };
}

/**
 * Recursively traverse tree structure
 * @param treeDatas tree
 * @param callBack callback
 * @param parentNode parent node
 */
export function eachTree(treeDatas: any[], callBack: Fn, parentNode = {}) {
  treeDatas.forEach((element) => {
    const newNode = callBack(element, parentNode) || element;
    if (element.children) {
      eachTree(element.children, callBack, newNode);
    }
  });
}

// Remove children property if empty
export function removeEmptyChildren(data: any[], childrenField = 'children') {
  data.forEach((item) => {
    if (!item[childrenField]) {
      return;
    }
    if (item[childrenField].length > 0) {
      removeEmptyChildren(item[childrenField]);
    } else {
      Reflect.deleteProperty(item, childrenField);
    }
  });
}

/**
 * Add full name like ancestor-parent-child
 * @param treeData tree data
 * @param labelName label field name
 * @param splitStr separator
 */
export function addFullName(
  treeData: any[],
  labelName = 'label',
  splitStr = '-',
) {
  function addFullNameProperty(node: any, parentNames: any[] = []) {
    const fullNameParts = [...parentNames, node[labelName]];
    node.fullName = fullNameParts.join(splitStr);
    if (node.children && node.children.length > 0) {
      node.children.forEach((childNode: any) => {
        addFullNameProperty(childNode, fullNameParts);
      });
    }
  }

  treeData.forEach((item: any) => {
    addFullNameProperty(item);
  });
}

/**
 * Find all parent node IDs given a node ID
 * @param treeList tree structured list
 * @param nodeId target node ID
 * @param config config
 * @returns parent node ID array
 */
export function findParentsIds(
  treeList: any[],
  nodeId: number,
  config: Partial<TreeHelperConfig> = {},
) {
  const conf = getConfig(config) as TreeHelperConfig;
  const { id, children } = conf;

  const parentIds: number[] = [];

  function traverse(node: any, nodeId: number) {
    if (node[id] === nodeId) {
      return true;
    }
    if (node[children]) {
      for (const childNode of node[children]) {
        if (traverse(childNode, nodeId)) {
          parentIds.push(node[id]);
          return true;
        }
      }
    }
    return false;
  }

  for (const node of treeList) {
    if (traverse(node, nodeId)) {
      break;
    }
  }

  return parentIds.toSorted();
}

/**
 * Find all parent node IDs given a node ID array
 * @param treeList tree structured list
 * @param nodeIds target node ID list
 * @param config config
 * @returns parent node ID array
 */
export function findGroupParentIds(
  treeList: any[],
  nodeIds: number[],
  config: Partial<TreeHelperConfig> = {},
) {
  const parentIds = new Set<number>();

  nodeIds.forEach((nodeId) => {
    findParentsIds(treeList, nodeId, config).forEach((parentId) => {
      parentIds.add(parentId);
    });
  });

  return [...parentIds].toSorted();
}

/**
 * Find all IDs and return array
 * @param treeList list
 * @param config config
 * @returns ID array
 */
export function findAllIds(
  treeList: any[],
  config: Partial<TreeHelperConfig> = DEFAULT_CONFIG,
) {
  const conf = getConfig(config) as TreeHelperConfig;
  const { id, children } = conf;
  const ids: number[] = [];

  treeList.forEach((item) => {
    if (item[children]) {
      const tempIds = findAllIds(item[children], config);
      ids.push(...tempIds);
    }
    ids.push(item[id]);
  });

  return [...ids].toSorted();
}

/**
 * Get node IDs by specified level
 */
export function findIdsByLevel(
  level = 1,
  list?: any[],
  config: Partial<TreeHelperConfig> = DEFAULT_CONFIG,
  currentLevel = 1,
) {
  if (!level) {
    return [];
  }
  const res: (number | string)[] = [];
  const data = list || [];
  for (const item of data) {
    const { id: keyField, children: childrenField } = config;
    const key = keyField ? item[keyField] : '';
    const children = childrenField ? item[childrenField] : [];
    res.push(key);
    if (children && children.length > 0 && currentLevel < level) {
      currentLevel += 1;
      res.push(...findIdsByLevel(level, children, config, currentLevel));
    }
  }
  return res as number[] | string[];
}
