"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const { APP_NAME, PORT, DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, REDIS_NAME, REDIS_HOST, REDIS_PORT, SESSION_SECRET, PASSWORD_PATTERN } = process.env;
exports.default = {
    APP_NAME,
    PORT,
    DB_CONNECTION,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    REDIS_NAME,
    REDIS_HOST,
    REDIS_PORT,
    SESSION_SECRET,
    PASSWORD_PATTERN
};
