import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from "body-parser";
import session from "express-session";
import { router as userRoutes } from "./routes/userRoutes.js";
import { router as questionRoutes } from "./routes/questionRoutes.js";
require('dotenv').config();

/////////////////////////////////////
//// Login:
//// q@com.ua

//// Password:
//// qqq
/////////////////////////////////////

const {
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
} = process.env;

const dbOptions = {
  useNewUrlParser: true,
};

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);

const port = PORT || 3000;
const dbConnectionUrl = `${DB_CONNECTION}://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

mongoose.connect(dbConnectionUrl, dbOptions);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("⚡️ Mongo connected"));

const { createClient } = require("redis");
const RedisStore = require("connect-redis")(session);

const redisClient = createClient({
  legacyMode: true,
  url: `${REDIS_NAME}://${REDIS_HOST}:${REDIS_PORT}`
});

redisClient.connect().then(console.log("⚡️ Redis connected"));

redisClient.on("error", console.error.bind(console, "Error connection to Redis:"));

const app: Express = express();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: SESSION_SECRET!,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  }));

app.use(function (req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return next(new Error("oh no"));
  }
  next();
})

app.use(bodyParser.json());

app.use(express.static("public"));

app.use(userRoutes, questionRoutes);

app.listen(port, () => console.log(`⚡️ ${APP_NAME} app listening on port ${port}`));
