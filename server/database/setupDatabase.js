import { connect, disconnect } from "./connection.js";
import { ObjectId } from "mongodb";

const deleteMode = process.argv.includes("--delete");

async function setupDatabase() {
    try {
        const db = await connect();

        if (deleteMode) {
            const collections = await db.collections();
            for (let collection of collections) {
                await collection.drop();
            }
            console.log("Database reset");
        }

        const usersCollection = db.collection("users");
        const notesCollection = db.collection("notes")
        
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        
        //Seeding
        if (deleteMode) {
            const dennisId = new ObjectId();
            const bobId = new ObjectId();
            const casperId = new ObjectId();

            const initialUsers = [
                { _id: dennisId, email: "dennis@example.com", password: "$2b$12$InKdQGST0S2KkDaPsRlVwOydq/XegV1IallrZrzJWKcP/GxaoY3/a" },
                { _id: bobId, email: "bob@example.com", password: "$2b$12$InKdQGST0S2KkDaPsRlVwOydq/XegV1IallrZrzJWKcP/GxaoY3/a" },
                { _id: casperId, email: "casper@example.com", password: "$2b$12$InKdQGST0S2KkDaPsRlVwOydq/XegV1IallrZrzJWKcP/GxaoY3/a" },
            ];
            await usersCollection.insertMany(initialUsers);

            const initialNotes = [
                {
                    _id: new ObjectId(),
                    ownerId: dennisId.toString(),
                    collaborators: [
                        { userId: bobId.toString(), email: "bob@example.com" },
                        { userId: casperId.toString(), email: "casper@example.com" }
                    ],
                    title: "Math",
                    content: "Dennis' first note with collaborators.",
                },
                {
                    _id: new ObjectId(),
                    ownerId: bobId.toString(),
                    collaborators: [
                        { userId: dennisId.toString(), email: "dennis@example.com" }
                    ],
                    title: "Biology",
                    content: "Bob's biology notes shared with Dennis."
                },
            ];
            await notesCollection.insertMany(initialNotes);
        }


        console.log("Database setup complete");
    } catch (error) {
        console.error("Error setting up database:", error);
    } finally {
        await disconnect();
    }
}

setupDatabase();