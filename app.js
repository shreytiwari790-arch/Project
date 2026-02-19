import express from "express"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./src/lib/db.js"; 
import AuthRoute from "./src/Routes/AuthRoute.js";
import BookRoute from "./src/Routes/BookRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. IMPROVED CORS (Essential for React Native + Cookies)
app.use(cors({
  origin: true, // Dynamically allow the origin that made the request
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. INCREASED LIMITS (Good practice for JSON data)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// 3. Connect to MongoDB (Awaiting ensure connection before routes)
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // Routes
    app.use("/api/auth", AuthRoute);
    app.use("/api/books", BookRoute);

    app.get("/", (req, res) => {
      res.send("Server is running 🚀");
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("❌ MongoDB connection error:", err);
    process.exit(1); // Stop server if DB fails
  }
};

startServer();