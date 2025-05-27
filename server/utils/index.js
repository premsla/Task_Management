
import dotenv from "dotenv/config"; // Added this line
import express from "express";
import connectDB from "./connectDB.js";
import cookieParser from "cookie-parser";
import { routeNotFound } from "../middleware/errorMiddleware.js";
import userRoutes from "../routes/userRoute.js";
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes); // Register route

app.use(routeNotFound);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
