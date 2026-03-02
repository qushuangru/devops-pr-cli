# devops-pr-cli

[English](README.md) | [中文](README_CN.md)

CLI tool for creating and managing Azure DevOps pull requests from the command line.

## Features

- 🚀 Create pull requests from current branch
- 📋 List and filter pull requests
- 🔍 View detailed PR information
- 🔄 Checkout PR branches locally
- 🎯 Auto-detect repository information from git (org/project/repo)
- 🌐 One config works across all projects in your organization
- 💬 Interactive prompts for easy usage
- 🔐 Secure PAT token authentication
- 🎨 Beautiful terminal output

## Installation

### From GitHub

Install directly from GitHub repository:

```bash
npm install -g qushuangru/devops-pr-cli
```

Or use the full URL:

```bash
npm install -g https://github.com/qushuangru/devops-pr-cli
```

### From Source

Clone and install from source:

```bash
git clone https://github.com/qushuangru/devops-pr-cli.git
cd devops-pr-cli
npm install
npm link
```

## Quick Start

### 1. Configure

Run the configuration wizard on first use:

```bash
devops-pr config init
```

You'll be prompted to enter:
- Azure DevOps server URL (e.g., `https://dev.azure.com` or your on-premise server)
- Personal Access Token (PAT)
- Default target branch (e.g., `main` or `master`)

**Note:** Organization, project, and repository are automatically detected from your git remote URL. No need to configure them manually!

Configuration is saved to `~/.devops-pr-cli/config.json`

### 2. Create a Pull Request

Navigate to your git repository and run:

```bash
devops-pr pr create
```

You'll be prompted to enter:
- PR title
- PR description (opens your default editor)

Or provide details via flags:

```bash
devops-pr pr create --title "[feat] Add new feature" --description "This PR adds..." --target master
```

### 3. List Pull Requests

```bash
# List active PRs (default)
devops-pr pr list

# List all PRs
devops-pr pr list --state all

# List completed PRs
devops-pr pr list --state completed

# Limit results
devops-pr pr list --limit 10
```

### 4. View PR Details

```bash
devops-pr pr view 1112446

# Include comments
devops-pr pr view 1112446 --comments

# JSON output
devops-pr pr view 1112446 --json
```

### 5. Checkout PR Branch

```bash
devops-pr pr checkout 1112446
```

## Commands

### Configuration Commands

```bash
# Initialize configuration (interactive wizard)
devops-pr config init

# View current configuration
devops-pr config view
```

### Pull Request Commands

```bash
# Create a pull request
devops-pr pr create [options]

Options:
  -t, --title <title>           Pull request title
  -d, --description <desc>      Pull request description
  -b, --target <branch>         Target branch (default: from config)
  --draft                       Create as draft PR

# List pull requests
devops-pr pr list [options]

Options:
  -s, --state <state>           Filter by state: active|completed|abandoned|all (default: active)
  -l, --limit <number>          Maximum number of PRs to show (default: 20)
  --target <branch>             Filter by target branch

# View pull request details
devops-pr pr view <pr-id> [options]

Options:
  --comments                    Include comments
  --json                        Output as JSON

# Checkout pull request branch
devops-pr pr checkout <pr-id>
```

## Personal Access Token (PAT)

To use this tool, you need a Personal Access Token with the following permissions:

- **Code**: Read
- **Pull Requests**: Read & Write

### Creating a PAT

1. Go to your Azure DevOps profile settings
2. Navigate to **Personal Access Tokens**
3. Click **New Token**
4. Select the required permissions
5. Copy the generated token
6. Use it during `devops-pr config init`

Example URL: `https://dev.azure.com/{your-organization}/_usersSettings/tokens`

## Examples

### Typical Workflow

```bash
# 1. Create a feature branch and make changes
git checkout -b feature/my-new-feature
# ... make changes ...
git add .
git commit -m "feat: Add new feature"
git push -u origin feature/my-new-feature

# 2. Create a pull request
devops-pr pr create

# 3. Check PR status
devops-pr pr list

# 4. View your PR
devops-pr pr view <pr-id>
```

### Review Someone's PR

```bash
# 1. List active PRs
devops-pr pr list

# 2. View PR details
devops-pr pr view 1112446

# 3. Checkout PR for local testing
devops-pr pr checkout 1112446

# 4. Test the changes
npm test

# 5. Leave feedback in Azure DevOps web UI
```

## Troubleshooting

### Configuration not found

```
❌ Error: Configuration not found. Please run "devops-pr config init" to set up.
```

**Solution**: Run `devops-pr config init` to configure the tool.

### Authentication failed

```
❌ Error: Authentication failed. Your PAT token may be invalid or expired.
```

**Solutions**:
- Verify your PAT token hasn't expired
- Ensure the token has required permissions
- Run `devops-pr config init` to reconfigure

### Not in a git repository

```
❌ Error: Not in a git repository. Please navigate to a git repository.
```

**Solution**: Navigate to a directory that contains a git repository.

### No origin remote found

```
❌ Error: No origin remote found. Please add a remote: git remote add origin <url>
```

**Solution**: Add an origin remote pointing to your Azure DevOps repository.

## Upgrading

To update to the latest version:

```bash
npm install -g qushuangru/devops-pr-cli
```

This will download and install the latest code from GitHub.

**Note:** If you're upgrading from an older version, you may want to reinitialize your config to remove deprecated fields:

```bash
devops-pr config init
```

The new config wizard only asks for server URL, PAT token, and default branch (organization/project are now auto-detected).

## Requirements

- Node.js >= 16.0.0
- Git installed and configured
- Azure DevOps Personal Access Token

## Development

### Setup

```bash
git clone https://github.com/qushuangru/devops-pr-cli.git
cd devops-pr-cli
npm install
```

### Build

```bash
npm run build
```

### Run in Development

```bash
npm run dev -- pr list
```

### Link for Local Testing

```bash
npm link
devops-pr config init
```

## License

MIT

## Author

Shuangru Qu

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
