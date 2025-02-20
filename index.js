import express from 'express';
import morgan from 'morgan';
import database from './config/database.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cloudinaryConnect from './config/cloudinary.js';
import fileUpload from 'express-fileupload';

import userRoute from './routes/User.js';
import profileRoute from './routes/Profile.js';
// import paymentRoute from './routes/Payments.js';
import courseRoute from './routes/Course.js';

dotenv.config();

database();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp"
}))

cloudinaryConnect()

app.use('/api/v1/auth', userRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/course', courseRoute);
// app.use('/api/v1/payment', paymentRoute);

app.get('/api/v1/', (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is running Dana dan.....'
    })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is Running at ${PORT}`);
})