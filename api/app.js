import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import authRoute from './routes/auth.route.js';
import postRoute from './routes/post.route.js';
import testRoute from './routes/test.route.js';
import userRoute from './routes/user.route.js';
import chatRoute from './routes/chat.route.js';
import messageRoute from './routes/message.route.js';

dotenv.config();
const __dirname = path.resolve();
const app=express();
app.use(cors({origin: 'http://localhost:5173',credentials: true}))
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoute)
app.use("/api/users",userRoute)
app.use("/api/posts",postRoute)
app.use("/api/test",testRoute)
app.use("/api/chats",chatRoute)
app.use("/api/messages",messageRoute)
app.use(express.static(path.join(__dirname, "client", "dist")));

// Fallback to index.html for other routes (SPA behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
app.listen(8800,() => {
    console.log('server is running on port 8800')
});
