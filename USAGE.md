# devops-pr-cli 使用指南

## 🚀 快速上手

### 1. 安装工具

#### 全局安装（推荐）
```bash
npm install -g devops-pr-cli
```

#### 从源码安装（开发测试）
```bash
git clone <repo-url>
cd devops-pr-cli
npm install
npm link
```

### 2. 首次配置

运行配置向导：
```bash
devops-pr config init
```

按照提示输入：
- **Server URL**: `https://dev.azure.com` 或您的私有服务器
- **PAT Token**: 你的个人访问令牌
- **Default Target Branch**: `main` 或 `master`

**💡 提示：** 组织（Organization）和项目（Project）会自动从 git remote URL 中检测，无需手动配置！这意味着同一个配置可以用于不同的项目。

### 3. 验证配置

```bash
devops-pr config view
```

## 📋 常用命令

### 创建 Pull Request

在你的 feature 分支上运行：

```bash
devops-pr pr create
```

或使用参数：
```bash
devops-pr pr create \
  --title "[feat] 新增功能" \
  --description "这是功能描述" \
  --target master
```

### 查看 PR 列表

```bash
# 查看活跃的 PR（默认）
devops-pr pr list

# 查看所有 PR
devops-pr pr list --state all

# 限制显示数量
devops-pr pr list --limit 10

# 按目标分支过滤
devops-pr pr list --target master
```

### 查看 PR 详情

```bash
devops-pr pr view 1112446

# 包含评论
devops-pr pr view 1112446 --comments

# JSON 输出
devops-pr pr view 1112446 --json
```

### 切换到 PR 分支

```bash
devops-pr pr checkout 1112446
```

## 🔑 获取 PAT Token

1. 访问：`https://dev.azure.com/{your-organization}/_usersSettings/tokens`
2. 点击 **New Token**
3. 设置权限：
   - ✅ **Code**: Read
   - ✅ **Pull Request Threads**: Read & Write
4. 复制生成的 Token
5. 在 `devops-pr config init` 时输入

## 💡 使用技巧

### 工作流示例

```bash
# 1. 创建功能分支
git checkout -b feature/my-feature

# 2. 开发并提交
git add .
git commit -m "feat: Add new feature"

# 3. 推送到远程
git push -u origin feature/my-feature

# 4. 创建 PR
devops-pr pr create

# 5. 查看 PR 状态
devops-pr pr list
```

### 在不同机器上使用

只需在新机器上：
1. 安装工具：`npm install -g devops-pr-cli`
2. 配置：`devops-pr config init`
3. 使用相同的 PAT Token

### 配置文件位置

配置保存在：`~/.devops-pr-cli/config.json`

如需在多台机器间共享配置，可以复制这个文件。

## ⚠️ 常见问题

### 找不到配置

```
❌ Error: Configuration not found.
```

**解决**：运行 `devops-pr config init`

### 认证失败

```
❌ Error: Authentication failed.
```

**解决**：
- 检查 PAT Token 是否过期
- 确保 Token 权限正确
- 重新配置：`devops-pr config init`

### 不在 git 仓库中

```
❌ Error: Not in a git repository.
```

**解决**：切换到 git 仓库目录

## 🎯 与之前方法对比

### 之前（使用 curl）
```bash
curl -u :TOKEN https://dev.azure.com/Organization/Project/_apis/git/repositories/repo-name/pullrequests?api-version=6.0 -X POST -d '...'
```

### 现在（使用 devops-pr）
```bash
devops-pr pr create
```

更简单、更直观、更安全！

## 📦 发布到私有 Registry

如果需要发布到公司内部的 npm registry：

```bash
# 设置 registry
npm config set registry http://your-private-registry.com

# 登录
npm login

# 发布
npm publish
```

## 🔄 更新工具

```bash
npm update -g devops-pr-cli
```

## 🗑️ 卸载

```bash
npm uninstall -g devops-pr-cli
```

## 📞 获取帮助

任何时候运行 `--help` 查看帮助：

```bash
devops-pr --help
devops-pr pr --help
devops-pr config --help
```
