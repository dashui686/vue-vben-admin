# Web Antd 文档索引

这里是 Vue Vben Admin - Web Antd 应用的完整文档集合。

## 📚 文档列表

### 1. [主使用文档 - README.md](./README.md)

**适合人群**: 所有开发者

**内容概览**:

- 项目简介和特性
- 快速开始指南
- 项目结构说明
- 技术栈介绍
- 开发指南（路由、权限、状态管理、API、表单、表格、国际化）
- 组件使用说明
- 常见问题解答

**快速链接**:

- [快速开始](./README.md#快速开始)
- [项目结构](./README.md#项目结构)
- [路由与菜单](./README.md#路由与菜单)
- [权限控制](./README.md#权限控制)
- [表单使用](./README.md#表单使用)
- [表格使用](./README.md#表格使用)

---

### 2. [API 接口文档 - API.md](./API.md)

**适合人群**: 后端对接人员、API 开发者

**内容概览**:

- 接口说明和目录结构
- 请求封装详解
- 完整接口列表（认证、系统管理、监控管理、工具管理）
- 自定义接口开发指南
- 请求配置和拦截器
- 类型定义

**快速链接**:

- [请求封装](./API.md#请求封装)
- [认证接口](./API.md#认证相关)
- [用户管理接口](./API.md#用户管理)
- [角色管理接口](./API.md#角色管理)
- [自定义接口](./API.md#自定义接口)

---

### 3. [进阶开发指南 - ADVANCED.md](./ADVANCED.md)

**适合人群**: 中高级开发者、架构师

**内容概览**:

- 项目配置详解
- 主题定制
- 布局系统
- 图标使用
- 状态管理进阶
- 组合式 API 开发
- 性能优化技巧
- 最佳实践
- 调试技巧
- 测试指南
- 部署配置

**快速链接**:

- [主题定制](./ADVANCED.md#主题定制)
- [布局系统](./ADVANCED.md#布局系统)
- [组合式 API](./ADVANCED.md#组合式-api)
- [性能优化](./ADVANCED.md#性能优化)
- [最佳实践](./ADVANCED.md#最佳实践)

---

### 4. [系统模块开发文档 - SYSTEM_MODULES.md](./SYSTEM_MODULES.md)

**适合人群**: 业务开发者

**内容概览**:

- 系统模块概览
- 用户管理完整实现
- 角色管理与权限分配
- 部门管理（树形结构）
- 岗位管理
- 字典管理
- 菜单管理
- 参数配置
- 通知管理
- 日志管理

**快速链接**:

- [用户管理](./SYSTEM_MODULES.md#用户管理)
- [角色管理](./SYSTEM_MODULES.md#角色管理)
- [部门管理](./SYSTEM_MODULES.md#部门管理)
- [字典管理](./SYSTEM_MODULES.md#字典管理)
- [菜单管理](./SYSTEM_MODULES.md#菜单管理)

---

## 🗂️ 文档结构

```
apps/web-antd/
├── README.md              # 主使用文档（入门必读）
├── API.md                 # API 接口文档
├── ADVANCED.md            # 进阶开发指南
├── SYSTEM_MODULES.md      # 系统模块开发文档
└── docs/
    └── INDEX.md           # 本文档索引
```

---

## 📖 学习路线

### 新手入门

1. **阅读主使用文档** ([README.md](./README.md))
   - 了解项目特性和技术栈
   - 完成快速开始
   - 学习基础开发指南

2. **熟悉项目结构**
   - 理解目录组织
   - 了解文件命名规范

3. **学习基础组件使用**
   - 表单组件
   - 表格组件
   - 弹窗组件

### 进阶提升

4. **阅读进阶开发指南** ([ADVANCED.md](./ADVANCED.md))
   - 学习主题定制
   - 掌握组合式 API
   - 了解性能优化

5. **阅读 API 接口文档** ([API.md](./API.md))
   - 熟悉所有接口
   - 学习自定义接口开发

### 实战开发

6. **参考系统模块文档** ([SYSTEM_MODULES.md](./SYSTEM_MODULES.md))
   - 学习完整业务模块实现
   - 参考最佳实践

---

## 🔧 快速参考

### 常用命令

```bash
# 启动项目
pnpm dev:antd

# 构建项目
pnpm build:antd

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

### 常用链接

| 资源           | 链接                                     |
| -------------- | ---------------------------------------- |
| 官方文档       | https://doc.vben.pro/                    |
| GitHub         | https://github.com/vbenjs/vue-vben-admin |
| Vue 3          | https://vuejs.org/                       |
| Vite           | https://vitejs.dev/                      |
| Ant Design Vue | https://antdv.com/                       |
| Vxe Table      | https://vxetable.cn/                     |
| Tailwind CSS   | https://tailwindcss.com/                 |
| Iconify        | https://icones.js.org/                   |

### 目录速查

| 目录               | 说明       |
| ------------------ | ---------- |
| `src/api/`         | API 接口   |
| `src/views/`       | 页面组件   |
| `src/components/`  | 通用组件   |
| `src/composables/` | 组合式 API |
| `src/store/`       | 状态管理   |
| `src/router/`      | 路由配置   |
| `src/locales/`     | 国际化     |
| `src/utils/`       | 工具函数   |

---

## 🤝 贡献指南

### 文档改进

如果你发现文档有任何问题或不足，欢迎：

1. 提交 Issue 指出问题
2. 提交 PR 改进文档
3. 分享你的使用经验

### 代码贡献

1. Fork 项目
2. 创建分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -am 'feat: add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 提交 Pull Request

---

## 📝 更新记录

| 日期       | 文档     | 更新内容     |
| ---------- | -------- | ------------ |
| 2024-01-XX | 所有文档 | 初始版本创建 |

---

## 📮 联系方式

- **GitHub Issues**: https://github.com/vbenjs/vue-vben-admin/issues
- **讨论区**: https://github.com/vbenjs/vue-vben-admin/discussions

---

## 📄 许可证

[MIT License](../../LICENSE)
