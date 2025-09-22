export declare function setupTestDatabase(): Promise<{
    db: any;
    port: number;
    host: string;
    database: string;
    cleanup: () => Promise<void>;
}>;
