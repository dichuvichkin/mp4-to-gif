import express, { Request, Response } from "express";
import multer from "multer";
import Queue from "bull";
import path from "path";
import fs from "fs";
import cors from 'cors';
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.join(__dirname, "../../storage/uploads");
const GIFS_DIR = path.join(__dirname, "../../storage/gifs");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(GIFS_DIR)) fs.mkdirSync(GIFS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
const app = express();
const port = 3000;
const redisHost = process.env.REDIS_HOST || "localhost";
const queue = new Queue("convert_mp4_to_gif", { redis: { host: redisHost, port: 6379 } });

queue.on("ready", () => console.log("✅ Bull queue is connected to Redis and ready."));
queue.on("error", (err) => console.error("❌ Redis connection error:", err));

const allowedOrigins = ['http://localhost:8080', 'http://localhost:4200'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.post("/upload", upload.single("video"), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).send("No file uploaded");
            return;
        }

        const filename = path.basename(req.file.filename, ".mp4");
        const outputPath = path.join(GIFS_DIR, `${filename}.gif`);

        const job = await queue.add({ filePath: req.file.path, outputPath });
        res.json({ jobId: job.id });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/gif/:jobId", async (req: Request, res: Response): Promise<void> => {
    try {
        const job = await queue.getJob(req.params.jobId);
        if (!job) {
            res.status(404).send("Job not found");
            return;
        }

        const state = await job.getState();

        if (state === "completed") {
            res.sendFile(job.data.outputPath);
            return;
        }

        res.status(200);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => console.log(`API Gateway running on port ${port}`));
