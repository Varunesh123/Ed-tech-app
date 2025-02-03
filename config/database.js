import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("DB connected Successfully"))
    .catch((error) => {
        console.log("DB connection failed");
        console.error(error);
        process.exit(1);
    })
}