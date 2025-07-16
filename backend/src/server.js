import { app, httpServer } from "./socket/socket.js"
import { connectDb, pool } from "../configs/db/dbConnect.js";
import express from "express"
import { configDotenv } from "dotenv"
configDotenv();
import expressSession from "express-session"

// importing startegies =============
import passport from "passport";
import "../configs/strategies/googleLinkStrategy.js"
import "../configs/strategies/googleLoginStrategy.js"

import cors from "cors"
import cookieParser from "cookie-parser"


// importing routes
import authRouter from "./routes/authRoutes.js";
import adminAuthRouter from "./routes/admin/adminAuthRoutes.js";
import vehicleMasterRouter from "./routes/admin/vehicleMasterRoutes.js";

import userRouter from "./routes/user/userRoutes.js";

import createAllTables from "../configs/db/init/index.js";
import path from "path";



// root  middlewares=======
app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(expressSession({
    secret: "wkjncwkjecnw",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 10 * 60 * 1000,
        secure: false
    }
}))
app.use(express.json())
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));



// routes middlewares ==========

app.use("/auth", authRouter);

//admin routes
app.use("/admin", adminAuthRouter);
app.use("/admin/vehicle-master",vehicleMasterRouter)


app.use("/user", userRouter);



app.get("/", (req, res) => {
    res.status(200).json({ msg: "server working", success: true })
})




//listening to server
const PORT = process.env.PORT || 5000

connectDb().then((res) => {
    httpServer.listen(PORT, () => {
        console.log(`server listening at ${PORT}`)
    })

    // creating tables after successfull conection
    createAllTables(pool);
}).catch((err) => {
    console.log(err)
    console.log("error in DB connection")
})



