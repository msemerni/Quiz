"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const express_1 = __importDefault(require("express"));
const bodyParser = require("body-parser");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const userRoutes = require("./routes/userRoutes.js");
require('dotenv').config();
// import { IUser } from "./types/user-type";
const { APP_NAME, PORT, DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, REDIS_NAME, REDIS_HOST, REDIS_PORT, SESSION_SECRET, PASSWORD_PATTERN } = process.env;
const dbOptions = {
    useNewUrlParser: true,
};
const port = PORT || 3000;
const dbConnectionUrl = `${DB_CONNECTION}://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
mongoose.connect(dbConnectionUrl, dbOptions);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("⚡️ Mongo connected"));
let redisClient = createClient({
    legacyMode: true,
    url: `${REDIS_NAME}://${REDIS_HOST}:${REDIS_PORT}`
});
redisClient.connect().then(console.log("⚡️ Redis connected"));
redisClient.on("error", console.error.bind(console, "Error connection to Redis:"));
const app = (0, express_1.default)();
app.use(session({
    store: new RedisStore({ client: redisClient }),
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error("oh no"));
    }
    next();
});
app.use(bodyParser.json());
app.use(express_1.default.static("public"));
app.use(userRoutes);
app.listen(port, () => console.log(`⚡️ ${APP_NAME} app listening on port ${port}`));
