import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import cors from "cors";

const app = express();

app.use(cors({
    credentials: true,
    origin: true
}));
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    limit: 10, // 10 attempts
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/login", loginRateLimiter);

import signupRouter from './routers/signupRouter.js';
app.use(signupRouter);

import loginRouter from './routers/loginRouter.js';
app.use(loginRouter);

app.all("*", (req, res) => {
    res.status(404).send({ message: "Route not found" });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});