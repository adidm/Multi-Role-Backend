import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import SequelizeStore from "connect-session-sequelize"; //connect sessions
// import db from "./config/Database.js";
import UserRoute from "./routes/UserRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import AuthRoute from "./routes/AuthRoute.js"
import db from "./config/Database.js";

// (async () => {
//     await db.sync();
// })(); // sync model to db

//create session table model
const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
    db: db
});

dotenv.config();
const app = express();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store, // session store
    cookie: {
        secure: "auto"
    }
}));

app.use(cors({
    credentials: true,
    origin: "http://localhost:3000" //default react port
}));

app.use(express.json());
app.use(UserRoute);
app.use(ProductRoute);
app.use(AuthRoute);

app.listen(process.env.PORT, () => {
    console.log("server up and running...");
});