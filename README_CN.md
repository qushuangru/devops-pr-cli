# devops-pr-cli

[English](README.md) | [中文](README_CN.md)

用于从命令行创建和管理 Azure DevOps 拉取请求的 CLI 工具。

## 功能特性

- 🚀 从当前分支创建拉取请求
- 📋 列出和筛选拉取请求
- 🔍 查看详细的 PR 信息
- 🔄 在本地检出 PR 分支
- 🎯 从 git 自动检测仓库信息（组织/项目/仓库）
- 🌐 一次配置，跨组织内所有项目使用
- 💬 交互式提示，易于使用
- 🔐 安全的 PAT 令牌认证
- 🎨 美观的终端输出

## 安装

### 从 npm 安装（推荐）

```bash
npm install -g devops-pr-cli
```

### 从源码安装

用于开发或贡献：

```bash
git clone https://github.com/qushuangru/devops-pr-cli.git
cd devops-pr-cli
npm install
npm run build
npm link
```

## 快速开始

### 1. 配置

首次使用时运行配置向导：

```bash
devops-pr config init
```

您将被提示输入：
- Azure DevOps 服务器 URL（例如：`https://dev.azure.com` 或您的私有服务器）
- 个人访问令牌（PAT）
- 默认目标分支（例如：`main` 或 `master`）

**注意：** 组织、项目和仓库信息会自动从您的 git remote URL 中检测，无需手动配置！

配置将保存到 `~/.devops-pr-cli/config.json`

### 2. 创建拉取请求

导航到您的 git 仓库并运行：

```bash
devops-pr pr create
```

您将被提示输入：
- PR 标题
- PR 描述（打开您的默认编辑器）

或通过标志提供详细信息：

```bash
devops-pr pr create --title "[feat] 添加新功能" --description "此 PR 添加了..." --target master
```

### 3. 列出拉取请求

```bash
# 列出活动的 PR（默认）
devops-pr pr list

# 列出所有 PR
devops-pr pr list --state all

# 列出已完成的 PR
devops-pr pr list --state completed

# 限制结果数量
devops-pr pr list --limit 10
```

### 4. 查看 PR 详情

```bash
devops-pr pr view 1112446

# 包含评论
devops-pr pr view 1112446 --comments

# JSON 输出
devops-pr pr view 1112446 --json
```

### 5. 检出 PR 分支

```bash
devops-pr pr checkout 1112446
```

## 命令

### 配置命令

```bash
# 初始化配置（交互式向导）
devops-pr config init

# 查看当前配置
devops-pr config view
```

### 拉取请求命令

```bash
# 创建拉取请求
devops-pr pr create [选项]

选项:
  -t, --title <title>           拉取请求标题
  -d, --description <desc>      拉取请求描述
  -b, --target <branch>         目标分支（默认：从配置读取）
  --draft                       创建为草稿 PR

# 列出拉取请求
devops-pr pr list [选项]

选项:
  -s, --state <state>           按状态筛选：active|completed|abandoned|all（默认：active）
  -l, --limit <number>          显示的最大 PR 数量（默认：20）
  --target <branch>             按目标分支筛选

# 查看拉取请求详情
devops-pr pr view <pr-id> [选项]

选项:
  --comments                    包含评论
  --json                        输出为 JSON 格式

# 检出拉取请求分支
devops-pr pr checkout <pr-id>
```

## 个人访问令牌（PAT）

要使用此工具，您需要一个具有以下权限的个人访问令牌：

- **代码（Code）**：读取
- **拉取请求（Pull Requests）**：读取和写入

### 创建 PAT

1. 进入您的 Azure DevOps 个人资料设置
2. 导航到**个人访问令牌**
3. 点击**新建令牌**
4. 选择所需的权限
5. 复制生成的令牌
6. 在 `devops-pr config init` 时使用它

示例 URL：`https://dev.azure.com/{your-organization}/_usersSettings/tokens`

## 示例

### 典型工作流程

```bash
# 1. 创建功能分支并进行更改
git checkout -b feature/my-new-feature
# ... 进行更改 ...
git add .
git commit -m "feat: 添加新功能"
git push -u origin feature/my-new-feature

# 2. 创建拉取请求
devops-pr pr create

# 3. 检查 PR 状态
devops-pr pr list

# 4. 查看您的 PR
devops-pr pr view <pr-id>
```

### 审查他人的 PR

```bash
# 1. 列出活动的 PR
devops-pr pr list

# 2. 查看 PR 详情
devops-pr pr view 1112446

# 3. 检出 PR 进行本地测试
devops-pr pr checkout 1112446

# 4. 测试更改
npm test

# 5. 在 Azure DevOps Web UI 中留下反馈
```

## 故障排除

### 未找到配置

```
❌ Error: Configuration not found. Please run "devops-pr config init" to set up.
```

**解决方案**：运行 `devops-pr config init` 来配置工具。

### 身份验证失败

```
❌ Error: Authentication failed. Your PAT token may be invalid or expired.
```

**解决方案**：
- 验证您的 PAT 令牌未过期
- 确保令牌具有所需的权限
- 运行 `devops-pr config init` 重新配置

### 不在 git 仓库中

```
❌ Error: Not in a git repository. Please navigate to a git repository.
```

**解决方案**：导航到包含 git 仓库的目录。

### 未找到 origin 远程仓库

```
❌ Error: No origin remote found. Please add a remote: git remote add origin <url>
```

**解决方案**：添加指向您的 Azure DevOps 仓库的 origin 远程仓库。

## 更新工具

更新到最新版本：

```bash
npm update -g devops-pr-cli
```

**注意：** 如果从旧版本升级，建议重新初始化配置以移除已弃用的字段：

```bash
devops-pr config init
```

新的配置向导只会询问服务器 URL、PAT 令牌和默认分支（组织/项目现在自动检测）。

## 系统要求

- Node.js >= 16.0.0
- 已安装并配置 Git
- Azure DevOps 个人访问令牌

## 开发

### 设置

```bash
git clone https://github.com/qushuangru/devops-pr-cli.git
cd devops-pr-cli
npm install
```

### 构建

```bash
npm run build
```

### 开发模式运行

```bash
npm run dev -- pr list
```

### 链接以进行本地测试

```bash
npm link
devops-pr config init
```

## 许可证

MIT

## 作者

Shuangru Qu

## 贡献

欢迎贡献！请随时提交拉取请求。
