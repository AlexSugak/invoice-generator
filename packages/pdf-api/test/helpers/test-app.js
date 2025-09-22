"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestApp = setupTestApp;
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../src/app.module");
async function setupTestApp({ db: { port, host, database }, }) {
    process.env.DB_USER = '';
    process.env.DB_PASSWORD = '';
    process.env.DB_HOST = host;
    process.env.DB_NAME = database;
    process.env.DB_PORT = port.toString();
    const moduleFixture = await testing_1.Test.createTestingModule({
        imports: [app_module_1.AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication();
    await app.init();
    return {
        app,
        cleanup: async () => {
            await app.close();
        },
    };
}
//# sourceMappingURL=test-app.js.map