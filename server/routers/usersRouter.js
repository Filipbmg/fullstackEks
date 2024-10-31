import { Router } from "express";
import { connect } from "../database/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

router.get('/users/session', async (req, res) => {
    console.log("Current session: ", req.session); // Log the current session
    if (req.session.user) {
        const objectId = new ObjectId(req.session.user.id)
        try {
            const db = await connect();
            const user = await db.collection("users").findOne({ _id: objectId });
            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }
            return res.send({ user });
        } catch (error) {
            return res.status(500).send({ error: "Error fetching user data" });
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
});

export default router;