import { chromium } from "@playwright/test";
import fs from "fs";

import {
  removeFile,
  waitForFileExists,
  writeFile,
  endpointOfUrl,
  setHttpLogs,
} from "./utils";
import { HAR, RecordRequest } from "./models";

const readHarFile = (path: string, host: string): Promise<RecordRequest[]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else {
        const result: HAR = JSON.parse(data.toString());

        const xgrRequests: RecordRequest[] = result.log.entries
          .filter((e) => {
            const url: string = e.request.url;

            return (
              !url.includes(host) &&
              !/(.png)|(.jpeg)|(.webp)|(.jpg)|(.gif)|(.css)|(.js)|(.woff2)/.test(
                url
              )
            );
          })
          .map(({ request, response }) => {
            const responseString = Buffer.from(
              response.content.text,
              "base64"
            ).toString();

            return {
              url: endpointOfUrl(request.url),
              request,
              requestData: JSON.parse(request?.postData?.text || "{}"),
              response: JSON.parse(responseString),
            };
          });
        resolve(xgrRequests);
      }
    });
  });
};

export const recordHar = async (
  route: string,
  filePath?: string,
  logRecording = false
): Promise<RecordRequest[]> => {
  const harPath = filePath.replace(".json", ".temp.har");

  console.log(harPath);

  const browser = await chromium.launchPersistentContext(
    "/tmp/chrome-user-data-dir",
    {
      headless: false,
      viewport: null,
      recordHar: {
        omitContent: false,
        path: harPath,
      },
    }
  );

  const page = await browser.newPage();
  await page.goto(route);

  logRecording && setHttpLogs(page);

  await page.pause();
  await browser.close();

  await waitForFileExists(filePath);

  const requests = await readHarFile(
    harPath,
    route.replace("https://", "").replace("http://", "").split("/")[0]
  );
  await writeFile(filePath, requests);
  await removeFile(harPath);

  return requests;
};
