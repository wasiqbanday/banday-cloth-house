import { rmSync } from "node:fs";
import { join, resolve } from "node:path";

const projectRoot = process.cwd();
const nextDir = resolve(projectRoot, ".next");
const expectedNextDir = join(projectRoot, ".next");

if (nextDir !== expectedNextDir) {
  throw new Error(`Refusing to clean unexpected path: ${nextDir}`);
}

rmSync(nextDir, { recursive: true, force: true });
