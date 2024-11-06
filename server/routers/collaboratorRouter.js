import { Router } from "express";
import { connect } from "../database/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

router.put('/collaborators', async (req, res) => {
    if (req.session.user) {
        try {
            const { noteId, email } = req.body;
            const objectId = new ObjectId(noteId);
            const db = await connect();
            const collaborator = await db.collection('users').findOne({ email })
    
            if (!collaborator) {
                return res.status(404).send({ error: "Collaborator not found" });
            } else {
                const result = await db.collection('notes').updateOne(
                    {_id: objectId},
                    { $addToSet: { collaborators: { userId: collaborator._id.toString(), email: collaborator.email}}}
                )
            }

            return res.status(200).send({ message: "Collaborator added" });
        } catch (error) {
            return res.status(500).send({ error: "Error adding collaborator"});
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
})

router.delete('/collaborators/remove', async (req, res) => {
    if (req.session.user) {
        try {
            const { noteId, email } = req.body;
            console.log("Received noteId:", noteId, "and email:", email);
            const objectId = new ObjectId(noteId);
            const db = await connect();
            const collaborator = await db.collection('users').findOne({ email })
    
            if (!collaborator) {
                return res.status(404).send({ error: "Collaborator not found" });
            } else {
                const result = await db.collection('notes').updateOne(
                    {_id: objectId},
                    { $pull: { collaborators: { userId: collaborator._id.toString(), email: collaborator.email}}}
                )
            }

            return res.status(204).send({ message: "Collaborator removed" });
        } catch (error) {
            return res.status(500).send({ error: "Error removing collaborator"});
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
})

router.delete('/collaborators/leave', async (req, res) => {
    if (req.session.user) {
        try {
            const { noteId } = req.body;
            const objectId = new ObjectId(noteId);
            const db = await connect();
            const userId = req.session.user.id;
            const collaborator = await db.collection('users').findOne({ userId })

            if (!collaborator) {
                return res.status(404).send({ error: "Collaborator not found" });
            } else {
                const result = await db.collection('notes').updateOne(
                    {_id: objectId},
                    { $pull: { collaborators: { userId: userId, email: collaborator.email}}}
                )
            }

            return res.status(204).send({ message: "Collaborator removed" });
        } catch (error) {
            return res.status(500).send({ error: "Error removing collaborator"});
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
})
export default router;