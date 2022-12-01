// const initDB =require("./tempfolder/baza");
const mongoose = require("mongoose");
import express, { Express, Request, Response } from 'express';
const bodyParser = require("body-parser");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
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
} = require("./constants/constants.js");


const app: Express = express();
const dbOptions = {
  useNewUrlParser: true,
};
const port = PORT || 3000;
// const dbConnectionUrl = `${DB_CONNECTION}://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
const dbConnectionUrl = `mongodb://127.0.0.1:27017/quizdb`;

mongoose.connect(dbConnectionUrl, dbOptions);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("⚡️ Mongo connected"));

let redisClient = createClient({
  legacyMode: true,
  // url: `${REDIS_NAME}://${REDIS_HOST}:${REDIS_PORT}`
  url: `redis://127.0.0.1:6379`
});

redisClient.connect().then(console.log("⚡️ Redis connected"));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    resave: false,
    rolling: true, 
    saveUninitialized: false,
    // secret: SESSION_SECRET,
    secret: "somesecretkey",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  }));

app.use((req: Request, res: Response, next) => {
  if (!req.session) {
    return next(new Error("oh no"));
  }
  next();
})

redisClient.on("error", console.error.bind(console, "Error connection to Redis:"));

app.use(bodyParser.json());

app.use(express.static("public"));

/////////////////////
// Question.insertMany(initDB);
/////////////////////

// app.listen(port, () => console.log(`⚡️${APP_NAME} app listening on port ${port}`));
app.listen(port, () => console.log(`⚡️ Quiz app listening on port ${port}`));

export default { app };
