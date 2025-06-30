import {createServer} from "http"
import express from "express"
const app=express();

import {Server} from "socket.io"
import cors from "cors"

const httpServer=createServer(app);

const io=new Server(httpServer,{
    cors:{
        origin:"*",
    }
})


export {app,httpServer,io};