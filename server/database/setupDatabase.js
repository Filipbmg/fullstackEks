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
            const initialUsers = [
                { _id: 1, email: "anton@example.com", password: "$2b$12$InKdQGST0S2KkDaPsRlVwOydq/XegV1IallrZrzJWKcP/GxaoY3/a" },
                { _id: 2, email: "bob@example.com", password: "$2b$12$InKdQGST0S2KkDaPsRlVwOydq/XegV1IallrZrzJWKcP/GxaoY3/a" },
                { _id: 3, email: "casper@example.com", password: "$2b$12$InKdQGST0S2KkDaPsRlVwOydq/XegV1IallrZrzJWKcP/GxaoY3/a" },
            ];
            await usersCollection.insertMany(initialUsers);

            const initialNotes = [
                {
                    _id: new ObjectId(),
                    ownerId: 1,
                    collaborators: [
                        { userId: 2, privilege: 'write' },
                        { userId: 3, privilege: 'read' }
                    ],
                    title: "Math",
                    content: "Anton's first note with collaborators.",
                },
                {
                    _id: new ObjectId(),
                    ownerId: 2,
                    collaborators: [
                        { userId: 1, privilege: 'read' }
                    ],
                    title: "Biology",
                    content: "Bob's biology notes shared with Anton."
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