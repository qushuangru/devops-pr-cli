"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const CONFIG_DIR = path.join(os.homedir(), '.devops-pr-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
class ConfigManager {
    async init() {
        console.log(chalk_1.default.cyan('🚀 Azure DevOps PR CLI - Configuration Wizard\n'));
        console.log(chalk_1.default.gray('This tool automatically detects organization and project from your git remote.\n' +
            'You only need to configure your PAT token and preferences.\n'));
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'server',
                message: 'Enter your Azure DevOps server URL (optional, auto-detected from git):',
                default: 'https://dev.azure.com',
                validate: (input) => {
                    if (!input.startsWith('http://') && !input.startsWith('https://')) {
                        return 'URL must start with http:// or https://';
                    }
                    return true;
                }
            },
            {
                type: 'password',
                name: 'pat',
                message: 'Enter your Personal Access Token (PAT):',
                mask: '*',
                validate: (input) => input.length > 0 || 'PAT token is required'
            },
            {
                type: 'input',
                name: 'targetBranch',
                message: 'Default target branch for PRs:',
                default: 'master'
            }
        ]);
        const config = {
            server: answers.server.replace(/\/$/, ''), // Remove trailing slash
            pat: answers.pat,
            defaults: {
                targetBranch: answers.targetBranch
            }
        };
        // Test PAT token (non-blocking)
        console.log(chalk_1.default.yellow('\n⏳ Testing PAT token...'));
        try {
            await this.testConnection(config);
            console.log(chalk_1.default.green('✓ PAT token is valid!\n'));
        }
        catch (error) {
            console.log(chalk_1.default.yellow('⚠ Could not verify PAT token (this may be normal for some servers)'));
            console.log(chalk_1.default.gray(`  Error: ${error.message}`));
            console.log(chalk_1.default.gray('  Configuration will be saved anyway. You can test it by running commands.\n'));
        }
        // Save configuration
        this.save(config);
        console.log(chalk_1.default.green(`✓ Configuration saved to ${CONFIG_FILE}`));
        return config;
    }
    load() {
        if (!fs.existsSync(CONFIG_FILE)) {
            throw new Error(`Configuration not found. Please run "devops-pr config init" to set up.`);
        }
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(data);
    }
    save(config) {
        // Create directory if it doesn't exist
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
        // Set restrictive permissions (user read/write only)
        fs.chmodSync(CONFIG_FILE, 0o600);
    }
    view() {
        const config = this.load();
        console.log(chalk_1.default.cyan('\n📋 Current Configuration:\n'));
        console.log(chalk_1.default.gray('Server:        '), config.server);
        console.log(chalk_1.default.gray('PAT Token:     '), chalk_1.default.yellow('*'.repeat(20)));
        console.log(chalk_1.default.gray('Target Branch: '), config.defaults.targetBranch);
        console.log(chalk_1.default.gray('\nConfig file:   '), CONFIG_FILE);
        console.log(chalk_1.default.gray('\nNote: Organization and project are auto-detected from git remote URL.'));
        // Show deprecation warning if old fields present
        if (config.organization || config.project) {
            console.log(chalk_1.default.yellow('\n⚠️  Deprecated fields detected in config:\n' +
                '    - organization and project are no longer used\n' +
                '    - These values are now automatically detected from your git remote\n' +
                '    - You can safely remove them from the config file'));
        }
    }
    exists() {
        return fs.existsSync(CONFIG_FILE);
    }
    async testConnection(config) {
        try {
            const auth = Buffer.from(`:${config.pat}`).toString('base64');
            // Test PAT token validity by querying projects API
            // This validates the token without requiring specific org/project
            const url = `${config.server}/_apis/projects?api-version=6.0`;
            await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Authentication failed. Please check your PAT token.');
                }
                if (error.response?.status === 403) {
                    throw new Error('Permission denied. Your PAT token may not have sufficient permissions.');
                }
                throw new Error(`Connection test failed: ${error.message}`);
            }
            throw error;
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map