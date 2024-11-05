import { Router } from "express";
import { connect } from "../database/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

router.put('/collaborators', async (req, res) => {
    if (req.session.user) {
        try {
            const noteId = req.body;
            const objectId = new ObjectId(noteId);
            const db = await connect();
            const collaborator = await db.collection('users').findOne({ email })
    
            if (!collaborator) {
                return res.status(404).send({ error: "Collaborator not found" });
            } else {
                const result = await db.collection('notes').updateOne(
                    {_id: objectId},
                    { $addToSet: { collaborators: { userId: collaborator._id, email: collaborator.email}}}
                )
            }
        } catch (error) {
            return res.status(500).send({ error: "Error adding collaborator"});
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
})