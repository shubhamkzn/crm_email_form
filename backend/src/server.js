import express from "express";
import { connectMySQL } from "./lib/db.js"; // ✅ Updated for MySQL
import authRoutes from "./routes/auth.route.js";
import dashRoutes from "./routes/dash.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import emailRoutes from "./routes/emailRoutes.js";
import formRoute from "./routes/form.js"
import submissionRoute from "./routes/submission.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const startServer = async () => {
  try {
    await connectMySQL();
    app.use("/api/auth", authRoutes);
    app.use("/api/dash", dashRoutes);
    app.use("/api/email", emailRoutes);
    
app.use('/form', formRoute);
app.use('/submission', submissionRoute);


    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../frontend/dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
      });
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("DB Connection Failed", err);
  }
};

startServer();
