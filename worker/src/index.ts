import Queue from "bull";
import { spawn } from "child_process";
import * as fs from "fs";
import cron from 'node-cron';
import path from "path";
import { deleteOldFiles } from "./utils";

const UPLOADS_DIR = path.join(__dirname, '../../storage/uploads');
const GIFS_DIR = path.join(__dirname, '../../storage/gifs');

const redisHost = process.env.REDIS_HOST || "localhost";

const queue = new Queue("convert_mp4_to_gif", {
    redis: { host: redisHost, port: 6379 },
    settings: { stalledInterval: 10000 },
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: { age: 3600 }
    }
});

async function checkQueueConnection() {
    try {
        const redisStatus = await queue.client.ping();
        if (redisStatus === "PONG") {
            console.log("✅ Worker service is connected to Redis and ready to process jobs.");
        } else {
            console.error("⚠ Unexpected Redis response:", redisStatus);
        }
    } catch (error) {
        console.error("❌ Redis connection failed:", error);
    }
}

checkQueueConnection();

queue.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
});

queue.process(async (job) => {
    const { filePath: inputPath, outputPath } = job.data;

    console.log(`🚀 Processing Job ${job.id}: ${inputPath}`);

    return new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-y",
            "-i", inputPath,
            "-vf", "scale=-1:400,fps=5",
            "-movflags", "+faststart",
            "-preset", "ultrafast",
            outputPath
        ]);

        let lastProgress = -1;

        ffmpeg.stdout.on("data", (data) => {
            const output = data.toString();

            if (output.includes("frame=")) {
                const match = output.match(/frame=\s*(\d+)/);
                if (match) {
                    const frameCount = parseInt(match[1]);
                    const progress = Math.min(Math.floor((frameCount / 50) * 100), 100);

                    if (progress !== lastProgress) {
                        job.progress(progress);
                        console.log(`📊 Job ${job.id} progress: ${progress}%`);
                        lastProgress = progress;
                    }
                }
            }
        });

        ffmpeg.on("close", (code) => {
            if (code === 0) {
                if (lastProgress < 100) {
                    job.progress(100);
                    console.log(`✅ Job ${job.id} completed: ${outputPath}`);
                }

                fs.unlink(inputPath, (err) => {
                    if (err) console.error(`⚠ Failed to delete ${inputPath}:`, err);
                    else console.log(`🗑 Deleted input file: ${inputPath}`);
                });

                resolve();
            } else {
                console.error(`❌ FFmpeg exited with error code: ${code}`);
                reject(new Error("FFmpeg failed"));
            }
        });

        ffmpeg.on("error", (err) => {
            console.error(`❌ Job ${job.id} failed: ${err.message}`);
            reject(err);
        });
    });
});

queue.on("failed", async (job, err) => {
    console.error(`❌ Job ${job.id} failed: ${err.message}`);

    const MAX_RETRIES = 3;
    if (job.attemptsMade < MAX_RETRIES) {
        console.log(`🔄 Retrying job ${job.id} (Attempt ${job.attemptsMade + 1}/${MAX_RETRIES})...`);
        await job.retry();
    } else {
        console.log(`⚠ Job ${job.id} has permanently failed after ${MAX_RETRIES} attempts.`);
    }
});

cron.schedule('*/10 * * * *', () => {
    console.log("🧹 Running periodic file cleanup...");
    deleteOldFiles(UPLOADS_DIR);
    deleteOldFiles(GIFS_DIR);
});
