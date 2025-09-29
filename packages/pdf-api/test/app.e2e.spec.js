"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const database_1 = require("./helpers/database");
const test_app_1 = require("./helpers/test-app");
describe('AppController (e2e)', () => {
    let app;
    let cleanup;
    beforeAll(async () => {
        // Setup database
        const dbSetup = await (0, database_1.setupTestDatabase)();
        // Setup application
        const appSetup = await (0, test_app_1.setupTestApp)({ db: { ...dbSetup } });
        app = appSetup.app;
        // Combined cleanup
        cleanup = async () => {
            await appSetup.cleanup();
            await dbSetup.cleanup();
        };
    });
    afterAll(async () => {
        await cleanup();
    });
    it('/ (GET)', async () => {
        return await (0, supertest_1.default)(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!');
    });
});
//# sourceMappingURL=app.e2e.spec.js.map