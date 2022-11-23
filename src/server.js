"use strict";
exports.__esModule = true;
// const initDB =require("./tempfolder/baza");
var mongoose = require("mongoose");
var express_1 = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var createClient = require("redis").createClient;
var _a = require("./constants/constants.js"), APP_NAME = _a.APP_NAME, PORT = _a.PORT, DB_CONNECTION = _a.DB_CONNECTION, DB_HOST = _a.DB_HOST, DB_PORT = _a.DB_PORT, DB_DATABASE = _a.DB_DATABASE, REDIS_NAME = _a.REDIS_NAME, REDIS_HOST = _a.REDIS_HOST, REDIS_PORT = _a.REDIS_PORT, SESSION_SECRET = _a.SESSION_SECRET;
var app = (0, express_1["default"])();
var dbOptions = {
    useNewUrlParser: true
};
var port = PORT || 3000;
var dbConnectionUrl = "".concat(DB_CONNECTION, "://").concat(DB_HOST, ":").concat(DB_PORT, "/").concat(DB_DATABASE);
mongoose.connect(dbConnectionUrl, dbOptions);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () { return console.log("Mongo connected"); });
var redisClient = createClient({
    legacyMode: true,
    url: "".concat(REDIS_NAME, "://").concat(REDIS_HOST, ":").concat(REDIS_PORT)
});
redisClient.connect().then(console.log("Redis connected"));
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
redisClient.on("error", console.error.bind(console, "Error connection to Redis:"));
app.use(bodyParser.json());
app.use(express_1["default"].static("public"));
/////////////////////
// Question.insertMany(initDB);
/////////////////////
app.listen(port, function () { return console.log("\u26A1\uFE0F".concat(APP_NAME, " app listening on port ").concat(port)); });
exports["default"] = { app: app };
