# 构建阶段
FROM node:18-alpine as builder

# 添加 git 并配置
RUN apk add --no-cache git \
    && git config --global http.lowSpeedLimit 1000 \
    && git config --global http.lowSpeedTime 300 \
    && git config --global http.postBuffer 524288000 \
    && git config --global core.compression 9

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 首先只复制 package.json 和 lock 文件以利用缓存
COPY package.json pnpm-lock.yaml ./

# 安装依赖并缓存
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 只复制生产环境需要的文件
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# 只安装生产依赖并使用缓存
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prod --frozen-lockfile

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动命令
CMD ["node", "dist/main.js"] 