"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestDatabase = setupTestDatabase;
const pglite_1 = require("@electric-sql/pglite");
const pglite_socket_1 = require("@electric-sql/pglite-socket");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const common_1 = require("@invoice/common");
const logger = (0, common_1.getLogger)('test db');
async function setupTestDatabase() {
    const port = 5434;
    const host = '127.0.0.1';
    const database = 'invoice_generator';
    const db = await pglite_1.PGlite.create({ database });
    const server = new pglite_socket_1.PGLiteSocketServer({
        db,
        port,
        host,
    });
    await server.start();
    await db.waitReady;
    logger.debug('started pglite db server', { port, host });
    // Read and execute migrations
    const migrationsPath = path_1.default.join(__dirname, '../../../db/src/migrations');
    const migrations = fs_1.default
        .readdirSync(migrationsPath)
        .filter((f) => !f.includes('.down.'))
        .sort();
    for (const migration of migrations) {
        const sql = fs_1.default.readFileSync(path_1.default.join(migrationsPath, migration), 'utf8');
        await db.exec(sql);
    }
    logger.debug('finished applying migrations');
    return {
        db,
        port,
        host,
        database,
        cleanup: async () => {
            await server.stop();
            await db.close();
        },
    };
}
//# sourceMappingURL=database.js.map