import { Page } from "@playwright/test";
import fs from "fs";

import { RecordRequest } from "./models";
import { recordHar } from "./recorder";
import { getCallerFile, mockRequests, readFile } from "./utils";

const mergeOverriddenResponses = (
  override: { [key: string]: any },
  requests: RecordRequest[]
): RecordRequest[] => {
  return requests.map((r) => ({
    ...r,
    response: override[r.url] || r.response,
  }));
};

/**
 *
 * @param identifier For when you need to have more than one Mock version for a single .spec, it will look for a file containing such identifier (e.g. for test.specs.ts, and identifier "test2", it will look for ``test.spec.test2.mocks.json``).
 * @param recordRoute When recording a new network mock file, it will use this path to open the new page.
 * @param logRecording When recording a new network mock file, enables console logging of every xhr request happening.
 * @param overrideResponses To use other values instead of the ones recorded for given tests.
 *
 *  ```e.g. { ["/url_to_override"]: myCustomMockData }```
 * @returns
 */
export const useNetworkRecordMocks = async (
  page: Page,
  configs: {
    identifier?: string;
    recordRoute?: string;
    logRecording?: boolean;
    overrideResponses?: { [key: string]: any };
  } = {}
): Promise<RecordRequest[]> => {
  const {
    identifier,
    recordRoute,
    logRecording,
    overrideResponses,
  } = configs || {};

  const path = `${getCallerFile().replace(".ts", "").replace(".js", "")}${
    identifier ? `.${identifier}` : ""
  }.mocks.json`;

  if (fs.existsSync(path)) {
    console.log(`Using "${path}" for network request mocks.`);
    const requests = await readFile(path);

    const nextRequests = !overrideResponses
      ? requests
      : mergeOverriddenResponses(overrideResponses, requests);

    await mockRequests(nextRequests, page);

    return requests;
  } else {
    console.log(
      `Mocks file not found${
        identifier ? ` for ${identifier}` : ""
      }, recording a new one!`
    );
    const requests = await recordHar(recordRoute, path, logRecording);

    await mockRequests(requests, page);

    return requests;
  }
};
