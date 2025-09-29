export declare function setupTestApp({ db: { port, host, database }, }: {
    db: {
        database: string;
        port: number;
        host: string;
    };
}): Promise<{
    app: import("@nestjs/common").INestApplication<any>;
    cleanup: () => Promise<void>;
}>;
