import { Router } from "express";
import { connect } from "../database/connection.js";
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/notes', async (req, res) => {
    if (req.session.user) {
        try {
            const userId = req.session.user.id
            const db = await connect();
            const ownNotes = await db.collection("notes")
                .find({ ownerId: userId })
                .toArray(); 
            const collabNotes = await db.collection("notes")
                .find({ "collaborators.userId": userId })
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
        try {
            const objectId = new ObjectId(req.params.id);
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
        try {
            const objectId = new ObjectId(req.params.id);
            const db = await connect();

            //Separate immutable field(_id) from rest of body. 
            const { _id, ...updatedNote } = req.body; 

            const result = await db.collection('notes').updateOne(
                { _id: objectId },
                { $set: updatedNote }
            );

            if (result.modifiedCount > 0) {
                return res.status(200).send({ message: "Note updated" });
            } else {
                return res.status(500).send({ error: "Note not updated, no changes detected." });
            }
        } catch (error) {
            console.error("Error updating note:", error);
            return res.status(500).send({ error: "Error updating note" });
        }
    } else {
        return res.status(401).send({ error: "Unauthorized" });
    }
});

router.post('/notes', async (req, res) => {
    if (req.session.user) {
        try {
            const objectId = new ObjectId(req.session.user.id);
            console.log(objectId)
            const db = await connect();
            const result = await db.collection("notes").insertOne({
                ownerId: objectId,
                title: "New note"
            });
            
            res.status(201).send({
                message: "Note created successfully",
                _id: result.insertedId
            });
        } catch (error) {
            res.status(500).send({ message: "Error creating note" });
        }
    } else {
        res.status(401).send({ message: "Unauthorized: User must be logged in."});
    }
})

export default router;