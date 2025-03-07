#!/bin/bash

# 版本号
VERSION="1.0.0"

# 阿里云容器镜像服务的命名空间和仓库名
NAMESPACE="ai-gym"
REPO_NAME="gym-server"
REGISTRY="registry.cn-hangzhou.aliyuncs.com"

# 完整的镜像名称
IMAGE_NAME="$REGISTRY/$NAMESPACE/$REPO_NAME"

# 构建镜像
echo "Building image $IMAGE_NAME:$VERSION..."
docker build -t $IMAGE_NAME:$VERSION .
docker tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest

# 登录阿里云容器镜像服务
echo "Logging in to Aliyun Container Registry..."
docker login --username=$ALIYUN_USERNAME --password=$ALIYUN_PASSWORD $REGISTRY

# 推送镜像
echo "Pushing image $IMAGE_NAME:$VERSION..."
docker push $IMAGE_NAME:$VERSION
docker push $IMAGE_NAME:latest

echo "Done!" 