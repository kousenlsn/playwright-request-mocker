import fs from "fs";
import url from "url";
import { RecordRequest } from "../models";

export const writeFile = (
  filePath: string,
  requests: RecordRequest[]
): Promise<void> => {
  return new Promise((resolve, reject) => {    
    fs.writeFile(filePath, JSON.stringify({ requests }, null, 2), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const removeFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const readFile = (filePath: string): Promise<RecordRequest[]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else {
        try {
          const requests = JSON.parse(data.toString()).requests;
          resolve(requests);
        } catch (e) {
          reject(e);
        }
      }
    });
  });
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitForFileExists = async (
  filePath: string,
  currentTime = 0,
  timeout = 10000
): Promise<boolean> => {
  if (fs.existsSync(filePath)) return true;
  if (currentTime === timeout) return false;

  await sleep(1000);

  return await waitForFileExists(filePath, currentTime + 1000, timeout);
};

export const getCallerFile = (): string => {
  const err = new Error();
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = err.stack as any;
  Error.prepareStackTrace = undefined;

  const callerFile = stack
    .map((s) => s.getFileName())
    .filter((s) => s && !s.includes("node_modules") && !s.includes("internal"))
    .pop();

  const isFileUrl = callerFile.includes("file:");
  const callerFilePath = isFileUrl ? url.fileURLToPath(callerFile) : callerFile;
 
  return callerFilePath;
};
