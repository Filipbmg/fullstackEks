import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

let client;

const connect = async () => {
    if (!client) {
        client = new MongoClient(url);
        await client.connect();
        console.log("Connected to MongoDB");
    }
    return client.db(process.env.DB_NAME);
};

const disconnect = async () => {
    if (client) {
        await client.close();
        client = null;
        console.log("Disconnected from MongoDB");
    }
};

export { connect, disconnect };