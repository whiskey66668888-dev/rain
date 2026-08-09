# OP7 站点部署文档

本文档面向运维同事，说明 OP7 站点的打包和部署流程。

## 📋 目录

- [环境要求](#环境要求)
- [项目结构](#项目结构)
- [构建步骤](#构建步骤)
- [部署步骤](#部署步骤)
  - [直接部署（非 Docker）](#方式一直接部署非-docker)
  - [Docker 部署](#方式二docker-部署)
- [PM2 管理](#pm2-管理)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

## 🔧 环境要求

### 必需环境

- **Node.js**: >= 18.x
- **包管理器**: yarn 或 npm
- **进程管理**: PM2 (用于生产环境)

### 安装 PM2（如果未安装）

```bash
npm install -g pm2
```

## 📁 项目结构

构建后的 `dist` 目录结构：

```
dist/
├── client/              # 客户端静态资源
│   ├── assets/         # JS、CSS 等资源文件
│   ├── images/         # 图片资源
│   ├── locales/        # 语言文件
│   └── index.html      # HTML 模板
├── server/             # 服务端 SSR 代码
│   └── entry-server.js # SSR 入口文件
├── server-prod.js      # 生产环境服务器启动文件
├── ecosystem.config.js # PM2 配置文件
└── logs/               # 日志目录
    ├── ssr-op7-error.log
    └── ssr-op7-out.log
```

## 🏗️ 构建步骤

### 1. 安装依赖

```bash
# 在项目根目录执行
yarn install
# 或
npm install
```

### 2. 构建项目

OP7 站点需要构建客户端和服务端两部分：

```bash
构建
yarn build:ssr:op7      # 同时构建客户端和服务端
```

### 3. 验证构建结果

构建完成后，检查 `dist` 目录：

```bash
# 检查关键文件是否存在
ls -la dist/
ls -la dist/client/
ls -la dist/server/
ls -la dist/server-prod.js
ls -la dist/ecosystem.config.js
```

**重要文件清单：**

- ✅ `dist/client/index.html` - 客户端 HTML 模板
- ✅ `dist/client/.vite/manifest.json` - 资源清单文件
- ✅ `dist/server/entry-server.js` - SSR 入口文件
- ✅ `dist/server-prod.js` - 生产服务器启动文件
- ✅ `dist/ecosystem.config.js` - PM2 配置文件
- ✅ `node_modules/` - 生产依赖（Docker 部署必需）

## 🚀 部署步骤

### Docker 部署

#### 1. 准备部署文件

**重要**：服务端代码依赖以下 npm 包，需要将 `node_modules` 目录一并部署：

- `koa` - Web 框架
- `koa-compress` - 压缩中间件
- `koa-static` - 静态文件服务
- `http-proxy-middleware` - 代理中间件
- 以及其他生产依赖

#### 2. 安装生产依赖

在项目根目录执行：

```bash
# 只安装生产依赖
yarn install --production

```

#### 3. Dockerfile 示例

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 拷贝部署文件
COPY dist/ ./

# 安装 PM2（全局）
RUN npm install -g pm2

# 暴露端口
EXPOSE 3000

# 使用 pm2-runtime 启动（前台进程，适合 Docker）
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

#### 4. 构建和运行 Docker 镜像

```bash
# 构建镜像
docker build -t op7-ssr:latest .

# 运行容器
docker run -d \
  --name op7-ssr \
  -p 3000:3000 \
  -e SITE_ID=op7 \
  -e NODE_ENV=production \
  op7-ssr:latest

# 查看日志
docker logs -f op7-ssr
```

#### 5. 使用 pm2-runtime 的原因

- **pm2 start**：作为守护进程在后台运行，Docker 容器会立即退出
- **pm2-runtime**：作为前台进程运行，保持容器运行，并将日志输出到 stdout/stderr，方便 Docker 日志收集

#### 7. Docker Compose 示例

```yaml
version: '3.8'

services:
  op7-ssr:
    build: .
    container_name: op7-ssr
    ports:
      - '3000:3000'
    environment:
      - SITE_ID=op7
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./dist/logs:/app/logs
```

为了减小 Docker 镜像体积，可以使用 `.dockerignore`：

```dockerignore
node_modules
.git
*.md
src/
vite.config.ts
tsconfig.json
```

然后在 Dockerfile 中单独安装生产依赖：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 先拷贝 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装生产依赖
RUN yarn install --production --frozen-lockfile

# 拷贝部署文件
COPY dist/ ./
COPY node_modules/ ./

# 安装 PM2
RUN npm install -g pm2

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

## 📊 PM2 管理

### 常用命令

```bash
# 启动服务
pm2 start ecosystem.config.js

# 停止服务
pm2 stop ssr-op7

# 重启服务
pm2 restart ssr-op7

# 删除服务
pm2 delete ssr-op7

# 查看日志
pm2 logs ssr-op7          # 实时日志
pm2 logs ssr-op7 --lines 100  # 查看最近 100 行

# 查看监控信息
pm2 monit

# 重新加载（零停机重启）
pm2 reload ssr-op7
```

### PM2 配置说明

`ecosystem.config.js` 关键配置：

- **instances**: `2` - 启动 2 个实例（集群模式）
- **exec_mode**: `cluster` - 集群模式，充分利用多核 CPU
- **PORT**: `3000` - 服务监听端口
- **merge_logs**: `true` - 合并所有实例的日志到同一文件
- **max_memory_restart**: `1G` - 内存超过 1GB 时自动重启
- **autorestart**: `true` - 自动重启

### 日志文件位置

- **错误日志**: `dist/logs/ssr-op7-error.log`
- **输出日志**: `dist/logs/ssr-op7-out.log`

## ⚙️ 配置说明

### 环境变量

| 变量名       | 说明         | 默认值       | 必需  |
| ------------ | ------------ | ------------ | ----- |
| `SITE_ID`    | 站点标识     | -            | ❌ 否 |
| `PORT`       | 服务端口     | `3000`       | ❌ 否 |
| `NODE_ENV`   | 运行环境     | `production` | ❌ 否 |
| `LOCAL_TEST` | 本地测试模式 | -            | ❌ 否 |

### 端口配置

默认端口为 `3000`，如需修改：

1. **修改 PM2 配置**：编辑 `dist/ecosystem.config.js`，修改 `PORT` 值
2. **或使用环境变量**：`PORT=8080 pm2 start ecosystem.config.js`

## 🔄 更新部署流程

### 完整更新流程

```bash
# 1. 进入项目目录
cd /path/to/multisite_spa

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖（如有新增）
yarn install

# 4. 构建项目
yarn build:ssr:op7

# 5. 进入 dist 目录
cd dist

# 6. 重启 PM2 服务
pm2 restart ssr-op7

# 7. 查看日志确认启动成功
pm2 logs ssr-op7 --lines 50
```

### 零停机更新

```bash
# 使用 reload 命令，PM2 会逐个重启实例，保证服务不中断
pm2 reload ssr-op7
```
