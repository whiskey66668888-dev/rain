# 🚀 前端团队开发规范 / 架构说明文档

> 本文档适用于本项目的多站点多模板 **React 19 + TypeScript + Vite + SSR + Redux Toolkit + React Query + i18n + Koa + PWA** 架构体系，作为团队统一的前端标准，要求所有成员遵循。  
> 目标：让任何新成员在 1–2 天内可以完全熟悉项目结构与开发规范。

## 重要：本项目使用 Git LFS 存储大文件（图片、视频等）

首次使用前请全局安装 Git LFS（只需执行一次）：

````bash
git lfs install

## 必装插件

eslint， prettier， i18n ally

---

## 1. 架构理念（Architecture Principles）

本项目采用：

- **React 19 + TypeScript** 作为前端技术栈
- **Vite 7** 作为开发与构建工具
- **多站点（Multi-site）** 单仓架构（如 `demo` / `emc` / `op7`）
- **SSR（服务端渲染）** + **Hydration（客户端注水）** 架构
- **Redux Toolkit** 管理全局状态（用户、配置、第三方API配置）
- **React Query（@tanstack/react-query）** 管理服务器数据状态,客户端缓存
- **多主题、多模板、多语言** 动态能力
- **数据层 SDK**（HTTP + WebSocket + 缓存）
- **PWA + Workbox** 提供离线与缓存能力
- **响应式 SCSS + CSS Modules + UnoCSS + 高性能动画（Framer Motion）**
- **Koa** 作为 SSR 服务器

核心原则：

1. **高内聚、低耦合**：每个模块职责清晰，避免巨石组件。
2. **展示与数据分离**：UI 组件只负责渲染，不直接发请求。
3. **站点隔离**：不同站点的主题 / 资源 / 文案 / 接口要严格隔离。
4. **性能优先**：虚拟列表、懒加载、缓存优先。
5. **默认离线能力**：PWA + Workbox 让用户在弱网 / 无网环境仍可访问核心功能。
6. **SSR优先**：服务端渲染提升首屏性能，无loading内容直出。
7. **严格TS强类型**：所有接口进出参申明完整类型，全项目无any

---

## 2. 项目目录结构（Project Structure）

### 2.1 根目录结构

```bash
src/
  apis/                  # API 接口定义（解耦主站/三方api 按业务模块分类）
  core/                  # 核心框架能力，不依赖具体站点
  common/                # 公共组件 / 样式 / hooks
  sites/                 # 多站点入口与配置（demo, emc, op7, ...）
  server/                # SSR 服务器相关代码
  types/                 # 全局类型定义
  utils/                 # 全局工具函数和常量
````

### 2.2 详细结构说明

```bash
src/
  apis/                  # API 接口层
    origin/              # 主站 API（登录、用户、系统配置等）
      login.ts
      user.ts
      system.ts          # 获取第三方API token配置
      ...
    fbSports/            # FB体育第三方API
      recommendMatchList.ts
    obSports/            # OB体育第三方API
      menu.ts
      system.ts

  core/                  # 核心框架层
    i18n/                # 国际化（i18next）
      index.ts
    query/               # React Query 配置
      client.ts          # 客户端 QueryClient
      server.ts          # 服务端 QueryClient
      provider.tsx       # QueryProvider
      ssr.ts             # SSR hydration
    sdk/                 # 数据层 SDK
      request.ts         # 主站 API 请求实例
      requestFB.ts       # FB体育第三方API请求实例（自动token刷新）
      requestOB.ts       # OB体育第三方API请求实例（自动token刷新）
      request/           # 请求核心实现
        index.ts         # createRequest 工厂函数
        config.ts        # 请求配置类型
        model.ts         # 响应模型
        apiConfigManager.ts  # 第三方API配置管理器（token刷新）
        util.ts          # 工具函数（加密、URL处理等）
      WebSocketClient.ts # WebSocket 客户端封装
    store/               # Redux Toolkit 状态管理
      index.ts           # store 创建和类型
      hooks.ts           # typed hooks
      slices/            # Redux slices
        userSlice.ts     # 用户状态
        configSlice.ts   # 配置状态
        thirdApiConfigSlice.ts  # 第三方API配置状态
      util.ts            # store 工具函数

  common/                # 公共层
    assets/
      locales/           # 公共语言包（zh-CN, en-US, vi-VN）
    components/           # 公共组件
      LazyImage.tsx       # 图片懒加载
      VirtualList.tsx    # 虚拟列表（react-window）
      Toast/             # Toast 提示组件
      layouts/           # 布局组件
        MainLayout.tsx
      animations/         # 动画组件
        PageTransition.tsx
      ClientOnly.tsx      # 客户端专用组件包装器
    hooks/                # 公共 Hooks
      useLogin.ts         # 登录相关
      useSystem.ts         # 系统配置
      useGlobalNavigate.ts  # 全局导航
      useNavigateWithLanguage.ts  # 带语言的导航
    pages/                # 公共页面
      NotFoundPage/       # 404页面
    router/               # 路由配置
      index.tsx          # 路由组件
      config.tsx         # 路由配置
    styles/               # 公共样式
      base.scss          # 全局样式
      _variables.scss    # SCSS变量
      _mixins.scss      # SCSS mixins
      _functions.scss    # SCSS函数
      _rwd.scss         # 响应式断点
      skeleton.scss      # 骨架屏样式

  sites/                 # 多站点目录
    demo/                # demo站点
      entry-client.tsx   # 客户端入口
      entry-server.tsx   # 服务端入口（SSR）
      App.tsx            # 根组件
      index.html         # HTML模板
      site.config.ts     # 站点配置（API地址、主题等）
      theme.scss         # 站点主题样式
      routes/            # 站点路由配置
        index.tsx
        config.tsx
      pages/             # 站点页面
        HomePage/
        LoginPage/
        ...
      components/        # 站点组件
      locales/           # 站点语言包
      images/            # 站点图片资源
        common/          # 通用图标
        light/           # 浅色主题图标
        dark/            # 深色主题图标
    emc/                 # emc站点（同结构）
    op7/                 # op7站点（同结构）

  server/                # SSR 服务器
    server-dev.ts        # 开发环境服务器（Vite中间件）
    server-prod.ts       # 生产环境服务器（Koa+pm2）
    prepareServerState.ts  # 准备服务端Redux状态
    nginx.cache.ts       # HTML缓存（模拟nginx cache 10分钟过期）
    ssr.config.ts        # SSR配置
    proxy.config.ts      # 代理配置
    utils/
      common.ts          # 工具函数
      cssCollector.ts    # CSS收集
      getCssLinksForRoute.ts  # 获取路由CSS链接

  types/                 # 全局类型
    global.d.ts          # 全局类型定义
    react-windows.d.ts   # react-window类型

  utils/                 # 工具函数
    constants/           # 常量定义
      apiCodeOrigin.ts   # 主站API错误码
      apiCodeFB.ts       # FB API错误码
      apiCodeOB.ts       # OB API错误码
      local.ts           # 语言相关常量
      cookies.ts         # Cookie相关
      cacheKey.ts        # 缓存key
    env.ts               # 环境判断
    index.ts             # 工具函数导出
```

---

## 3. 命名规范（Naming Conventions）

### 3.1 文件命名

| 类型     | 例子                   | 规范               |
| -------- | ---------------------- | ------------------ |
| 组件     | `UserCard`             | 大驼峰             |
| Hook     | `useScroll.ts`         | 小驼峰             |
| 数据模型 | `MatchOdds.ts`         | 大驼峰             |
| 页面组件 | `OddsListPage.tsx`     | 大驼峰 + Page      |
| 站点目录 | `demo`, `emc`          | 全小写             |
| CSS模块  | `UserCard.module.scss` | 组件名.module.scss |

### 3.2 代码命名

- 变量：`camelCase`，语义明确，避免短命名如 `a/b/c`
- 常量：`SCREAMING_SNAKE_CASE`
- 组件：`PascalCase`
- 类型 / 接口：`PascalCase`，例如 `MatchOdds`, `SiteConfig`
- Redux Slice：`xxxSlice.ts`，例如 `userSlice.ts`

---

## 4. 组件开发规范（Component Rules）

### 4.1 通用要求

- ✅ 必须使用 TypeScript 定义类型， 不允许使用any
- ✅ 禁止在普通展示组件中直接发 HTTP 或 WebSocket 请求
- ✅ 复杂逻辑提取为 Hook（如 `useLogin()`）
- ✅ 尽量使用UNO原子化类名写样式，复杂样式和动效可以使用 SCSS Modules 进行样式隔离
- ✅ 测试的日志输出在提交或合并代码前删除

示例：

```tsx
interface Props {
  userId: string;
  onClick?: () => void;
}

export const UserCard: React.FC<Props> = ({ userId, onClick }) => {
  // UI 只接受 props，不直接请求接口
  return (
    <div className="w-full max-w-md" onClick={onClick}>
      {userId}
    </div>
  );
};
```

### 4.2 网络请求规范（HTTP + WebSocket）

#### 4.2.1 HTTP 请求实例

项目中目前有三种请求实例：

**主站 API（`request`）**

用于调用主站接口（登录、用户信息等）：

```tsx
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

export const loginReq = (params: LoginParams): Promise<ResponseData<LoginResponse>> => {
  return request.post('/api/login', {
    body: params,
  });
};
```

**第三方API（`requestFB` / `requestOB`）**

用于调用第三方体育API，**自动处理token刷新和请求重试**：

```tsx
import requestFB from '@/core/sdk/requestFB';
import requestOB from '@/core/sdk/requestOB';

// FB体育API
export const getFBRecommendMatchList = (): Promise<ResponseData<MatchList>> => {
  return requestFB.post('/v3/recommendMatchList', {
    body: { page: 1 },
  });
};

// OB体育API
export const getOBMenu = (): Promise<ResponseData<MenuList>> => {
  return requestOB.get('/api/menu');
};
```

**特性：**

- ✅ 自动获取token和URL配置（首次请求时）
- ✅ token过期时自动刷新并重试请求
- ✅ 防止并发刷新（多个请求同时过期时只刷新一次）
- ✅ 自动注入语言参数

**请求配置**

所有请求实例都支持：

```tsx
request.post('/api/endpoint', {
  body: {
    /* 请求体 */
  },
  headers: {
    /* 自定义header */
  },
  timeout: 10000, // 超时时间
  isErrorToast: true, // 是否显示错误提示
  transformResponse: (data) => {
    /* 转换响应 */
  },
});
```

#### 4.2.2 WebSocket 规范

使用 `WebSocketClient` 封装：

```tsx
import { WebSocketClient } from '@/core/sdk/WebSocketClient';

const wsClient = new WebSocketClient({
  url: 'wss://example.com/ws',
  onMessage: (data) => {
    // 处理消息
  },
  onError: (error) => {
    // 处理错误
  },
  maxRetries: 10, // 最大重连次数
});
```

### 4.3 数据获取

项目中使用两种 React Query Hook 来获取服务器数据， 以及不需要缓存和服务端渲染的数据获取：

#### 4.3.1 useSuspenseQuery（SSR 场景）

用于**支持 SSR 的数据请求**，服务端会自动执行查询并注入到 HTML 中，客户端 hydration 时直接使用，**浏览器输入网址直接访问页面时内容直出**。

**适用场景：**

- 不需要登录 token 的公开数据（如 Banner、菜单列表等）
- 需要在 SSR 时预加载的数据
- 首屏关键数据

**示例：**

```tsx
import { useBannerListQuery } from '@/apis/origin/bannerList';

export const HomePage: React.FC = () => {
  // useSuspenseQuery：服务端会自动请求并注入数据，客户端直接使用
  const { data: bannerList = [] } = useBannerListQuery({ colorType: 'dark' });

  // 无需处理 loading，数据已经在 SSR 时注入
  return (
    <div>
      {bannerList.map((banner) => (
        <div key={banner.bannerId}>{banner.title}</div>
      ))}
    </div>
  );
};
```

**工作原理：**

1. 服务端：执行查询 → 收集数据 → 注入到 HTML（`__REACT_QUERY_STATE__`）
2. 客户端：读取注入的数据 → 直接使用（无需再次请求）
3. 可选：设置 `refetchOnMount: 'always'` 让客户端接手后立即重新请求更新数据

#### 4.3.2 useQuery（纯客户端需要缓存的场景）

用于**只在客户端请求的数据（需要缓存的数据）**。

**适用场景：**

- 需要登录 token 的接口（服务端无法获取用户token）
- 用户交互触发的请求
- 不需要 SSR 的数据
- 需要缓存数据

**示例：**

```tsx
import { useQuery } from '@tanstack/react-query';
import { useRecommendMatchListQuery } from '@/apis/fbSports/recommendMatchList';

export const SportsPage: React.FC = () => {
  // useQuery：只在客户端请求，需要处理 loading
  const { data: matchList = [], isLoading } = useRecommendMatchListQuery({
    size: 15,
    random: true,
  });

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {matchList.map((match) => (
        <div key={match.id}>{match.nm}</div>
      ))}
    </div>
  );
};
```

**注意事项：**

- 必须使用 `ClientOnly` 组件包裹需要登录数据的 UI 部分

#### 4.3.3 fetch（纯客户端直接请求的场景）

用于**只在客户端请求的数据**，需要手动处理 loading 状态。

**适用场景：**

- 登陆，登出，增删改等场景
- 用户交互触发的请求
- 不需要 SSR 的数据
- 不需要缓存数据

**示例：**

```tsx
import { loginLogReq } from '@/apis/origin/login';

export const useLogin = () => {
    const login = useCallback(async (params: LoginParams, autorun = false): Promise<void> => {
      ...
      loginLogReq(params);
    }
};
```

### 4.4 组件分类

- **Pure UI 组件**：无业务逻辑，只负责展示，如 `VirtualList`
- **页面组件（Page）**：负责组织布局与数据 hook 调用，如 `HomePage`
- **Layout 组件**：提供主框架，如 `MainLayout`
- **业务组件**：包含业务逻辑的组件，放在站点目录下的 `components/`， 如果当前页面用到的组件很多并且都是页面私有的放在页面下的components `HomaPage/components/`

---

## 5. 状态管理规范（State Management）

项目中的公共状态（超过两个非父子组件共用的状态）：

### 5.1 全局应用状态 —— Redux Toolkit

使用 Redux Toolkit 管理全局状态：

- **用户状态**（`userSlice`）：登录状态、用户信息
- **配置状态**（`configSlice`）：应用配置
- **第三方API配置**（`thirdApiConfigSlice`）：FB/OB体育的token和URL配置

```tsx
import { useAppSelector, useAppDispatch } from '@/core/store/hooks';
import { setIsLogin } from '@/core/store/slices/userSlice';

export const UserProfile: React.FC = () => {
  const isLogin = useAppSelector((state) => state.user.isLogin);
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    dispatch(setIsLogin(true));
  };

  return <div>{isLogin ? '已登录' : '未登录'}</div>;
};
```

---

## 6. SSR（服务端渲染）规范

### 6.1 SSR 架构

项目采用 **React 19 的 `renderToPipeableStream`** 实现SSR：
**但是并没有直接流失输出，而是输出完整的内容（便于 Nginx 和 CDN 缓存，详见 [16. 部署方案](#16-部署方案deployment)）**

- **服务端**：使用 `entry-server.tsx` 进行渲染
- **客户端**：使用 `entry-client.tsx` 进行 hydration
- **状态同步**：Redux state 和 React Query state 都会在服务端预加载并注入到HTML

### 6.2 SSR 流程

1. **服务端**：
   - 检测语言（从URL或请求头）
   - 准备Redux初始状态（`prepareServerState`）
   - 创建Redux store和React Query client
   - 渲染React组件为HTML
   - 注入状态到HTML（`__REDUX_STATE__` 和 `__REACT_QUERY_STATE__`）

2. **客户端**：
   - 读取注入的状态
   - 创建相同的Redux store和React Query client
   - 进行hydration（`hydrateRoot`）

### 6.3 HTML缓存

生产环境采用 **三层缓存架构**：CDN（1分钟） → Nginx（1分钟） → Node.js SSR服务器，大幅减少服务器压力和回源流量。

详细部署方案请参考 [16. 部署方案](#16-部署方案deployment)。

### 6.4 SSR注意事项

- ✅ 使用 `ClientOnly` 组件包装客户端专用代码
- ✅ 避免在服务端使用 `window`、`document` 等浏览器API
- ✅ 使用 `isSSR()` 判断环境
- ✅ 第三方API配置在服务端会缓存，目前方案OB游客token，FB无token
- ✅ **数据请求选择**：
  - 公开数据（不需要 token）：使用 `useQueryHook`，支持 SSR 自动注入, suspense参数可不传，服务端默认阻塞渲染等待接口返回
  - 需要登录 token获不需要服务端注入 的数据：使用 `useQueryHook`，suspense参数传入false，跳过服务端请求
  - 需要登录 token获不需要服务端渲染 的 UI：使用 `ClientOnly` 组件包裹

---

## 8. 国际化规范（i18n）

### 8.1 语言文件存放

- 公共文案：`src/common/assets/locales/{locale}.json`
- 站点覆盖文案：`src/sites/{site}/locales/{locale}.json`
  **最终在编译打包阶段会用以私有的为主深度合并公共的语言文件最终只输出一份**

语言代码映射统一维护在`src/utils/constants/local.ts`：

### 8.2 加载规则

1. **客户端**：使用 `i18next-http-backend` 异步加载
2. **服务端**：使用 `require` 或 `import` 同步加载并合并

### 8.3 使用方式

```tsx
import { useTranslation } from 'react-i18next';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return <h1>{t('home.title')}</h1>;
};
```

### 8.4 路由语言前缀

URL格式：`/{language}/path`

例如：

- `/zh/home`
- `/en/home`
- `/vi/home`

**业务中统一使用src/common/hooks/useNavigateWithLanguage.ts 自动添加语言前缀**

### 8.5 路由配置

项目中的路由配置分为两层：**公共路由**和**站点私有路由**。

#### 8.5.1 公共路由

公共路由定义在 `src/common/router/config.tsx`，所有站点共享：

```tsx
export const commonRoutes: RouteConfig[] = [
  {
    path: 'not-found',
    element: lazy(() => import('@/common/pages/NotFoundPage')),
  },
];
```

#### 8.5.2 站点私有路由

站点私有路由定义在 `src/sites/{site}/routes/config.tsx`，每个站点独立配置：

```tsx
const siteRoutes: RouteConfig[] = [
  {
    path: '', // 一级路由：RootPage（包含导航和底部）
    element: lazy(() => import('../pages/RootPage')),
    children: [
      // 二级路由
      {
        path: '', // 首页
        element: lazy(() => import('../pages/HomePage')),
      },
      {
        path: 'sports', // 体育页面
        element: lazy(() => import('../pages/SportsPage')),
      },
    ],
  },
  {
    path: 'login',
    element: lazy(() => import('../pages/LoginPage')),
  },
];

// 导出合并后的路由配置
export default deepMergeRoutes(commonRoutes, siteRoutes);
```

#### 8.5.3 路由合并机制

使用 `deepMergeRoutes` 函数合并公共路由和站点路由：

- **站点路由优先级更高**：相同 `path` 时，站点路由会覆盖公共路由
- **支持嵌套路由**：通过 `children` 配置子路由
- **深度合并**：子路由也会进行合并，站点子路由覆盖公共子路由

#### 8.5.4 路由渲染

- 外层包裹语言路由 `/:language/*`
- 使用 `Suspense` 包裹懒加载组件

#### 8.5.5 路由鉴权（requiresAuth）

需要登录后才能访问的页面，建议在路由元信息里打标，并在**按钮/列表点击跳转**时使用带鉴权的导航 Hook，避免未登录用户先进入受保护页面再被弹窗打断。

**1. 路由元信息 `handle.requiresAuth`**

在 `src/common/router/config.tsx` 的 `RouteHandle` 中已声明 `requiresAuth?: boolean`。站点路由里对需要登录的页面在 `handle` 中设为 `true`，便于 Layout、`findCurrentRoute` 等与路由元信息相关的逻辑统一读取（与布局类字段如 `h5NoBottomMenu` 并列）。

**2. 点击跳转：使用 `useAuthNavigate`**

文件：`src/common/hooks/useAuthNavigate.ts`。

- 已登录：内部调用 `useNavigateWithLanguage`，与平时带语言前缀的跳转一致。
- 未登录：会 `dispatch(openLoginModal())` 打开登录弹窗，并调用 `setAuthRedirectPath(to)`（实现见 `src/common/router/authRedirect.ts`），把**不含语言前缀**的目标路径写入 `sessionStorage`，供登录成功后回跳。

**3. 登录成功后的回跳**

`src/common/hooks/useLogin.ts` 在登录成功后会 `consumeAuthRedirectPath()` 取出并清除上述缓存，再 `navigate(authRedirectPath || '/')`，因此用户从「安全中心」等入口被拦下并登录后，会回到原先想去的页面。

**4. 示例（op7）**

路由配置（`src/sites/op7/routes/config.tsx`）：

```tsx
{
  path: 'security', // 安全中心
  element: lazy(() => import('../pages/MinePage/SecurityCenterPage')),
  handle: {
    h5NoBottomMenu: true,
    requiresAuth: true,
  },
},
```

H5「我的」列表点击（`src/sites/op7/pages/MinePage/MinePageH5/index.tsx`）：

```tsx
import { useAuthNavigate } from '@/common/hooks/useAuthNavigate';

// 组件内
const authNavigate = useAuthNavigate();

// 安全中心
<ListItem label="安全中心" icon="security" onClick={() => authNavigate('/mine/security')} />;
```

PC 侧同类入口可参考 `src/sites/op7/pages/MinePage/index.tsx` 中对 `useAuthNavigate` 的用法。若入口直接使用 `navigate('/xxx')` 而未走 `useAuthNavigate`，未登录时仍可能先完成路由跳转，仅靠 `handle.requiresAuth` 无法单独在「点击瞬间」拦截，需与上述 Hook 或页面内守卫配合使用。

---

## 9. 多站点规范（Multi-site Rules）

### 9.1 站点资源隔离

每个站点必须具有独立资源：

- `entry-client.tsx` / `entry-server.tsx`
- `App.tsx`
- `index.html`
- `site.config.ts`（站点配置：API地址、主题等）
- `theme.scss`（站点主题样式）
- `routes/`（站点路由配置）
- `locales/`（站点语言包）
- `images/`（站点图片资源）
- `pages/`（站点页面）
- `components/`（站点组件）

### 9.2 站点配置

`site.config.ts` 示例：

```tsx
const config: SiteConfig = {
  siteId: 'demo',
  name: 'Demo Site',
  theme: {
    primary: '#10b981',
    mode: 'light',
    template: 'sports',
  },
  api: {
    baseUrl: 'https://api.example.com',
    wsBaseUrl: 'wss://ws.example.com',
  },
};
```

### 9.3 构建命令

## 支持localhost直接启动，不用绑定host，但还是要用https才能设置cookie， 代理服务拦截并重写了response中cookie对域名的限制。

```bash
# 开发环境
yarn dev:client:demo    # 客户端开发（验证纯客户端渲染兜底没问题）
yarn dev:ssr:demo      # SSR开发（主要使用）

# 构建
yarn build:client:demo  # 构建客户端
yarn build:server:demo  # 构建服务端
yarn build:ssr:demo    # 构建客户端+服务端

# 生产环境测试
yarn prod:testssr:demo  # 本地测试打包后的SSR
```

### 9.4 禁止事项

- ❌ 禁止跨站点引用 比如`src/sites/demo` 直接 import `src/sites/emc` 的任何内容
- ❌ 公共的文件禁止写站点的判断
- ❌ 全项目TS强类型，静止写any 以及// eslint-disable-next-line等绕过检测的方式（exlint会检测，打包提交时也会检测不允许提交）
- ✅ 公共逻辑请放入 `src/common` 中
- ✅ 站点间共享的组件放在 `src/common/components/`

---

## 10. 样式规范（Styling）

### 10.1 样式方案

- **CSS Modules**：组件样式（`.module.scss`）（复杂动画或样式可以使用，尽量用Uno）
- **SCSS**：全局样式、变量、mixins
- **UnoCSS**：工具类（主要使用）

### 10.2 CSS Modules 使用

```tsx
import styles from './UserCard.module.scss';

export const UserCard: React.FC = () => {
  return <div className={styles.card}>Content</div>;
};
```

### 10.3 全局样式

- `src/common/styles/base.scss`：全局基础样式
- `src/common/styles/_variables.scss`：SCSS变量
- `src/common/styles/_mixins.scss`：SCSS mixins
- `src/common/styles/_rwd.scss`：响应式断点

### 10.4 主题样式

每个站点有独立的 `theme.scss`，可以覆盖全局变量。

### 10.5 缩放字体支持

需要缩放的字体加全局类\_tf[number];

```tsx
<div className={'_tf[16]'}>Content</div>
```

### 10.6 Uno自定义规则

```tsx
rules: [
  // 动态规则：匹配 _tf-[number]、leading-[xxx]、tracking-[xxx] 等
  // 捕获任意 [number] 中的值最后转换为px
  [
    /^_tf\[(.*)\]$/,
    ([, value]) => ({
      'font-size': `calc(${value}px * var(--text-scale, 1))`,
    }),
  ],
];
```

---

## 11. PWA & Workbox 规范

本项目已集成 **vite-plugin-pwa + Workbox**，提供：

- 自动 precache 网络空闲时预加载静态资源
- 运行时缓存策略
- `offline.html` 离线兜底页
- 自动 Service Worker 更新

### 11.1 Service Worker 注册

在 `entry-client.tsx` 中自动注册：

```tsx
import { registerServiceWorker } from '@/common/utils/sw-register';

registerServiceWorker();
```

---

## 12. Git 提交规范（Git & Commit Rules）

使用 **Husky + lint-staged** 自动做：

- `eslint --fix` 针对改动的 TS/TSX
- `prettier --write` 格式化
- `tsc --noEmit` 类型检查

### 12.1 Commit Message 规范（Conventional Commits）

推荐类型：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档修改
- `style:` 样式调整（不改逻辑）
- `refactor:` 重构
- `chore:` 杂项（配置、脚本等）

示例：

- `feat: 新增体育赔率虚拟列表组件`
- `fix: 修复第三方API token刷新问题`
- `refactor: 重构请求层，支持自动token刷新`

---

## 13. Code Review 规范（Review Checklist）

Review 时需要重点关注：

1. **目录位置是否正确**（站点 vs common vs core）
2. **组件是否职责单一**
3. **数据请求是否使用正确的请求实例**（request / requestFB / requestOB）
4. **类型定义是否完整、准确**
5. **是否遗漏国际化**
6. **是否符合多站点隔离原则**
7. **性能是否OK**
   - 大列表必须虚拟化
   - 大图片是否懒加载
   - 重复接口是否使用React Query缓存
8. **SSR兼容性**
   - 是否使用了浏览器专用API（需要ClientOnly包装）
   - 是否正确处理服务端和客户端差异
9. **代码风格是否统一**
   - ESLint/Prettier 是否已通过

---

## 14. 性能优化规范（Performance Guide）

必须遵循：

- 列表 ≥ 50 条数据，必须使用 `VirtualList`
- 图片必须使用 `LazyImage` 而非原始 `<img>`
- 使用 `react-query` 的缓存与 `staleTime`，避免重复请求

优化建议：

- 尽量使用 `useMemo` / `useCallback` 避免不必要渲染
- 避免在 render 中创建 new 对象 / 数组（抽到组件外或 useMemo 中）
- 大型组件使用 `React.lazy` 和 `Suspense` 进行代码分割

---

## 15. 安全规范（Security）

- WebSocket 地址禁止写死成生产地址，应从 `site.config.ts` 读取
- 禁止在前端日志中打印敏感数据（如完整用户信息、token）
- 第三方API token自动管理，无需手动处理

---

### 环境变量

- `__SITE_ID__`：string 站点ID（demo / emc / op7）
- `__VERSION__`: string 前端的构建版本（时间戳）
- `__SITE_CONFIG__`: SiteConfig 各自站点配置
- `__BUILD_ENV__`：环境（dev / sit / release / main）

---

## 16. 部署方案（Deployment）

### 16.1 架构概览

生产环境采用 **三层缓存架构**，最大化减少服务器压力和回源流量：

```
用户请求 → CDN（缓存1分钟） → Nginx（缓存1分钟） → Node.js SSR服务器（pm2）
```

### 16.2 服务端部署

**使用 pm2 管理 Node.js SSR 服务器：**

```bash
# 启动服务
cd dist && pm2 start

# 查看状态
pm2 status  /   pm2 monit

# 查看日志
pm2 logs ssr-op7

# 重启服务
pm2 restart ssr-op7
```

**pm2 配置示例（`ecosystem.config.js`）：**

```js
module.exports = {
  apps: [
    {
      name: 'multisite-ssr',
      script: './dist/server/server-prod.js',
      instances: 'max', // 使用所有CPU核心
      exec_mode: 'cluster', // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

### 16.3 Nginx 配置

**Nginx 作为反向代理，缓存 SSR 渲染后的 HTML：**

```nginx
upstream nodejs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name example.com;

    # 静态资源（直接返回，不缓存）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /path/to/dist/client;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SSR 路由页面（缓存1分钟）
    location / {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 缓存配置
        proxy_cache_path /var/cache/nginx/ssr levels=1:2 keys_zone=ssr_cache:10m max_size=1g inactive=2m use_temp_path=off;
        proxy_cache ssr_cache;
        proxy_cache_valid 200 1m;  # 200状态码缓存1分钟
        proxy_cache_valid 404 1m;  # 404也缓存1分钟
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;

        # 缓存头
        add_header X-Cache-Status $upstream_cache_status;
        add_header Cache-Control "public, max-age=60";
    }
}
```

**关键配置说明：**

- `proxy_cache_valid 200 1m`：200 状态码缓存 1 分钟
- `proxy_cache_background_update on`：后台更新缓存，避免缓存过期时所有请求都打到后端
- `add_header Cache-Control "public, max-age=60"`：告诉 CDN 缓存 1 分钟

### 16.4 CDN 配置

**CDN 层缓存路由页面 HTML：**

- **缓存规则**：所有路由页面（`/zh/*`, `/en/*`, `/vi/*` 等）
- **缓存时间**：1 分钟（`max-age=60`）
- **回源策略**：缓存过期后回源到 Nginx

**CDN 配置示例（以阿里云 CDN 为例）：**

```
缓存规则：
- 路径：/*/home, /*/sports, /*/user 等所有路由
- 缓存时间：60秒
- 回源：回源到 Nginx 服务器

```

---
