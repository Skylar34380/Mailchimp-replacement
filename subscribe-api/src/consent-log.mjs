import { mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeConsentLog(path, entry) {
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(entry)}\n`, "utf8");
}
