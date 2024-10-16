import dotenv from "dotenv";
import express from 'express';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import socketHandler from "./util/socketHandler.js";
const app = express();
dotenv.config();

app.use(cors({
    credentials: true,
    origin: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
socketHandler(io);

const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    limit: 10, // 10 attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, try again in 10 minutes.",
});
app.use("/login", loginRateLimiter);

import signupRouter from './routers/signupRouter.js';
app.use(signupRouter);

import authRouter from './routers/authRouter.js';
app.use(authRouter);

import usersRouter from './routers/usersRouter.js';
app.use(usersRouter);

import notesRouter from './routers/notesRouter.js';
app.use(notesRouter);

app.all("*", (req, res) => {
    res.status(404).send({ message: "Route not found" });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});