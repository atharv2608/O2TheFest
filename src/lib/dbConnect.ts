import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection : ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log("Already connected");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.DB_URL as string || "", {});
        console.log("DB connected to host :: ", db.connection.host);
        connection.isConnected = db.connections[0].readyState;
    } catch (error) {
        console.error("Database connection error", error);
        process.exit(1);   
    }
}

export default dbConnect;

