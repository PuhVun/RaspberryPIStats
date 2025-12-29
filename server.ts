import express, { Request, Response } from "express";
import cors from "cors";
import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";

const app = express();
app.use(cors());

const PORT = 3001;

function cmd(command: string): string {
  try {
    return execSync(command).toString().trim();
  } catch {
    return "N/A";
  }
}

function getCPUModel(): string {
  try {
    const cpuinfo = fs.readFileSync("/proc/cpuinfo", "utf-8");
    const line = cpuinfo.split("\n").find(l => l.startsWith("Model"));
    return line ? line.split(":")[1].trim() : "Unknown";
  } catch {
    return "Unknown";
  }
}

app.get("/api/system", (_req: Request, res: Response) => {
  res.json({
    cpuModel: getCPUModel(),
    cpuCores: os.cpus().length,
    temperature: cmd("vcgencmd measure_temp"),
    clockSpeed: cmd("vcgencmd measure_clock arm"),
    voltage: cmd("vcgencmd measure_volts core"),
    memory: {
      total: Math.round(os.totalmem() / 1024 / 1024) + " MB",
      free: Math.round(os.freemem() / 1024 / 1024) + " MB",
    },
    uptime: os.uptime(),
    os: `${os.type()} ${os.release()} (${os.arch()})`,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
