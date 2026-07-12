import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
