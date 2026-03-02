import { Config } from '../types';
export declare class ConfigManager {
    init(): Promise<Config>;
    load(): Config;
    save(config: Config): void;
    view(): void;
    exists(): boolean;
    private testConnection;
}
//# sourceMappingURL=config-manager.d.ts.map