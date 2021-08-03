import { Page } from "@playwright/test";
import fs from "fs";

import { RecordRequest } from "./models";
import { recordHar } from "./recorder";
import { getCallerFile, mockRequests, readFile } from "./utils";

/**
 *
 * @param identifier For when you need to have more than one Mock version for a single .spec, it will look for a file containing such identifier (e.g. for test.specs.ts, and identifier "test2", it will look for ``test.spec.test2.mocks.json``).
 * @param recordRoute When recording a new network mock file, it will use this path to open the new page.
 * @param logRecording When recording a new network mock file, enables console logging of every xhr request happening.
 * @returns
 */
export const useNetworkRecordMocks = async (
  page: Page,
  identifier = "",
  recordRoute = "",
  logRecording = false
): Promise<RecordRequest[]> => {
  const path = `${getCallerFile().replace(".ts", "").replace(".js", "")}${
    identifier ? `.${identifier}` : ""
  }.mocks.json`;

  if (fs.existsSync(path)) {
    console.log(`Using "${path}" for network request mocks.`);
    const requests = await readFile(path);
    
    await mockRequests(requests, page);

    return requests;
  } else {
    console.log(
      `Mocks file not found for "${
        identifier || "the test"
      }", recording a new one!`
    );
    const requests = await recordHar(recordRoute, path, logRecording);

    await mockRequests(requests, page);

    return requests;
  }
};
