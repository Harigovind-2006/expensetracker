import { Request, Response } from "express";
import { User } from "../models/user.js";
import bcryptjs from "bcrypt";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const key=process.env.JWT_KEY;
async function loginController(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid username or password" });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const token = JWT.sign({ _id: user._id }, key!, { expiresIn: "1h" });
        return res.status(200).json({message: "Login successful",token});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}
const registerController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        const token = JWT.sign({ _id: newUser._id }, key!, { expiresIn: "1h" });
        return res.status(201).json({ message: "User registered successfully",token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export {loginController , registerController}