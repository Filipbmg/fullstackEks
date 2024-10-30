import { Router } from "express";
import { connect } from "../database/connection.js";
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/notes', async (req, res) => {
    if (req.session.user) {
        try {
            const db = await connect();
            const ownNotes = await db.collection("notes")
                .find({ ownerId: req.session.user.id })
                .toArray(); 
            const collabNotes = await db.collection("notes")
                .find({ "collaborators.userId": req.session.user.id })
                .toArray();    
            return res.send({ ownNotes, collabNotes });
        } catch (error) {
            return res.status(500).send({ error: "Error fetching note data" });
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
});

router.get('/notes/:id', async (req, res) => {
    if (req.session.user) {
        const objectId = new ObjectId(req.params.id);
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

router.put('/notes/:id', async (req, res) => {
    if (req.session.user) {
        const objectId = new ObjectId(req.params.id);
        try {
            const db = await connect();
            const result = await db.collection('notes').updateOne(
                { _id: objectId },
                { $set: req.body }
            );

            if (result.modifiedCount > 0) {
                return res.status(200).send({ message: "Note updated"});
            } else {
                return res.status(404).send({ error: "Note not found"});
            }
        } catch (error) {
            return res.status(500).send({ error: "Error updating note"});
        }
    } else {
        return res.status(401).send({ error: "Unauthorized"});
    }
});

export default router;