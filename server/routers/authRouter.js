import { Router } from 'express';
import bcrypt from 'bcrypt';
import { connect } from '../database/connection.js';

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await connect();
        const userQuery = await db.collection("users").findOne({ email });

        if (!userQuery) {
            return res.status(404).send({ message: "Invalid Email" });
        }

        const passwordCompare = await bcrypt.compare(password, userQuery.password);
        if (passwordCompare) {
            req.session.user = {
                id: userQuery._id,
                email: userQuery.email,
            };
            res.send({ message: "Login success" });
        } else {
            res.status(401).send({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ message: "Error logging in" });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: "Error logging out" });
        }
        res.clearCookie("connect.sid");
        res.send({ message: "Logout success" });
    });
});

export default router;