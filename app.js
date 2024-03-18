if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const path = require("path");
const cors = require('cors');
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const ExpressError = require('./utils/ExpressError');

const User = require("./models/user");
const Chat = require("./models/chat");

let dbUrl;
if (process.env.NODE_ENV === 'production') {
    // 加载生产环境配置
    dbUrl = process.env.DB_URL;
} else {
    // 加载开发环境配置
    dbUrl = "mongodb://localhost:27017/review-summary";
}
//const dbUrl = process.env.DB_URL; 
// dbUrl = "mongodb://localhost:27017/review-summary";
// "mongodb://localhost:27017/review-summary";
const secretKey = process.env.secretKey;
const mapKey = process.env.mapKey;
const AIkey = process.env.AIkey;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // time period in seconds
    crypto: {
        secret: secretKey
    }
});

store.on("error", function (e) {
    console.log("Session store error", e);
});

const sessionConfig = {
    store,
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

mongoose.connect("mongodb://localhost:27017/review-summary", {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


// const { Client } = require("@googlemaps/google-maps-services-js");
// const OpenAI = require('openai');
// const { time } = require("console");

// const map_key = mapKey;

// const openai = new OpenAI({
//     apiKey: AIkey
// });

// const client = new Client({});
// console.log(client);
// let message_list = [];

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// 使用 cors 中间件
app.use(cors({
    origin: 'http://localhost:5173', // 允许的来源
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 允许的 HTTP 方法
    credentials: true, // 允许发送身份验证凭证（例如 cookies）
}));



// parsing the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) {
            console.error('Error during deserialization:', err);
            return done(err);
        }
        done(null, user);
    });
});

const apiRoute = require("./routes/reviews");
app.use("/api", apiRoute);

const userRoute = require("./routes/users");
app.use("/users", userRoute);

const historyRoute = require("./routes/history");
app.use("/chats", historyRoute);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
//module.exports = { openai, client, dbUrl, store};