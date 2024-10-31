import { Router } from "express";
import { connect } from "../database/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

router.put('/collaborators', async (req, res) => {
    if (req.session.user) {
        const objectId = ObjectId(req.params.id);
        try {
            const db = await connect();
            const collaborator = await db.collection('users').findOne({ email })
    
            if (!collaborator) {
                return res.status(404).send({ error: "Collaborator not found" });
            } else {
                const result = await db.collection('notes').updateOne(
                    {_id: objectId},
                    { $addToSet: { collaborators: { collaborator._id}}}
                )
            }
    
        }
    }
})

router.get('/notes/:id', async (req, res) => {
    if (req.session.user) {
        const objectId = ObjectId(req.params.id);
        try {
            const db = await connect();
            const note = await db.collection('notes').findOne({ _id: objectId });

            if (!note) {
                return res.status(404).send({ error: "Note not found" });
            }

            return res.send(note);
        } catch (error) {
            return res.status(500).send({ error: "Error fetching note data" });
        }

    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
});