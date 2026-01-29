# 数据系统工程开发说明

## 项目简介
- 基于 React + TypeScript + Vite + Ant Design 的前端工程
- 已包含基础布局（侧边栏、面包屑、内容区）与系统管理的常见模块页面
- 支持移动端适配：窄屏下侧栏变为抽屉式菜单，表格横向滚动

## 技术栈
- React 19 + TypeScript
- Vite 7
- Ant Design 5
- React Router 6

## 快速开始
```bash
# 安装依赖
npm install

# 本地开发（含 HMR）
npm run dev

# 代码检查
npm run lint

# 构建生产包
npm run build

# 本地预览构建产物
npm run preview
```

## 目录结构
```
src/
  components/
    MainLayout.tsx      # 基础布局（侧边栏、面包屑、内容区）
    PageContainer.tsx   # 通用“搜索 + 表格”容器
  pages/
    products/           # 数据产品模块
    sys/                # 系统管理各页面（用户、角色、菜单、部门、岗位、字典、参数、通知、日志）
  router/
    index.tsx           # 路由配置
  main.tsx              # 应用入口（RouterProvider）
  index.css             # 全局样式
```

## 路由与菜单
- 路由入口：[router/index.tsx](file:///Users/jessehe/workspace/data-system/src/router/index.tsx)
- 顶部面包屑与左侧菜单来源于布局组件：
  - 布局组件：[MainLayout.tsx](file:///Users/jessehe/workspace/data-system/src/components/MainLayout.tsx)
  - 如需新增页面：
    1. 在 `src/pages/...` 下创建页面组件
    2. 在 `src/router/index.tsx` 中添加对应路由
    3. 在 `MainLayout.tsx` 的 `items` 中补充菜单以显示入口

## 通用页面（搜索 + 表格）
- 统一封装组件： [PageContainer.tsx](file:///Users/jessehe/workspace/data-system/src/components/PageContainer.tsx)
- 使用方式：
  - 传入 `columns`（表格列）与 `dataSource`（数据）
  - 支持 `onSearch`、`onReset`、`onAdd`、`loading`
  - 表格自带横向滚动，防止小屏溢出：`scroll={{ x: 'max-content' }}`

## 响应式适配策略
- `MainLayout`：窄屏(`md`以下)自动隐藏侧栏，使用 `Drawer` 抽屉菜单
- 顶部提供汉堡按钮控制抽屉显示/隐藏
- `PageContainer`：表格横向滚动；`Form` 为 `inline` 布局，窄屏自动换行

## 代码规范
- TypeScript 严格类型，避免 `any`
- 通过 `npm run lint` 保持代码风格一致
- 提交信息建议遵循 Conventional Commits（如 `feat: ...`、`fix: ...`）

## 环境变量
- 使用 Vite 的环境变量机制（`import.meta.env`）
- 可在根目录创建 `.env` / `.env.production`（示例：`VITE_API_BASE_URL`）

## 构建与部署
```bash
npm run build
# 产物目录：dist/
# 将 dist 发布到静态资源服务器或配合后端进行部署
```

## 常见问题
- 抽屉宽度警告：已改用 `size` 属性替代 `width`
- 菜单选中与高亮：受路由驱动，需确保路径与菜单 key 一致
- 移动端打不开侧栏：请检查 `Grid.useBreakpoint()` 与 `isMobile` 逻辑

## 联系与协作
- 如需新增模块或改动架构，可在 `router` 与 `MainLayout` 一并增改
- 推荐先本地 `lint` 通过，再提交 PR 或代码
