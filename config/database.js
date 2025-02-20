import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const database = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DB connected Successfully");
    } catch (error) {
        console.log("DB connection failed");
        console.error(error);
        process.exit(1); 
    }
};

export default database;
