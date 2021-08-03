# playwright-request-mocker

*Automatically generate and use network request mocks inside Playwright!*

### Features :mag_right:

Mocking your API requests takes too much effort, this library strives to make it effortless by:
- Allowing you to declare just once the mock file location;
- If the mock file does not exist yet, it will open a Playwright's chromium tab, and record all your XHR requests and responses;
- It'll automatically intercept all registered http requests defined in the mock file for any future runs.


### Install :construction_worker:
1. Install the package:
  -   ``npm install playwright-request-mocker -D``
  -   or ``yarn add playwright-request-mocker -D ``;
2. Be sure to have ``@playwright/test`` also installed.

### Using :electric_plug:
1. Add to a ``.spec`` file ``beforeEach`` or ``test`` method, the method call ``useNetworkRecordMocks``, passing the test context page, identifier of the mock (only necessary if each test scenario has a different mock), and a route for loading the recording page to if there is no mock file yet;

    - e.g.
```
test.describe('Your test', () => {
  // If your network requests/responses are the same for every test scenario, define it here.
  test.beforeEach(async ({ page }) => {
    await useNetworkRecordMocks(page, undefined, `${process.env.APP_URL}/page-you-are-testing`);
    await page.goto(`${process.env.APP_URL}/page-you-are-testing`);
  });

  // else use it here if each test scenario expects different results.
  test('scenario1', async ({ page }) => {
    // It'll generate a new file if it doesn't exist (".spec.scenario1.mocks.json")
    // then it'll read it and mock all defined network requests.
    await useNetworkRecordMocks(page, 'scenario1', `${process.env.APP_URL}/page-you-are-testing`);

    await page.goto(`${process.env.APP_URL}/page-you-are-testing`);

    //... your steps and asserts.
  });
});
```

2. Run in debug mode and headed;

    - e.g. ``PWDEBUG=console playwright test --headed``;

- if the mock file does not exist yet, it will open a new tab and will be recording all the XHR requests. When you think you recorded everything you needed, press the resume button in the ``playwright/test`` UI.
- After it, or if the mock file ever exists, it will use the results to run your test scenario.


### How it works :question:

- useNetworkRecordMocks checks if there is a file ``[invoker-file-name].mocks.json`` (or ``[invoker-file-name].[identifier].mocks.json``), if it doesn't exist, it'll open a chromiun tab using chrome's recordHAR option. When the Playwright debug mode is unpaused, it'll process such file removing every request other than XHR ones;
- useNetworkRecordMocks will parse the existing file, and mock every request declared in it.


----


Feel free to contribute, report bugs, or [contact me](https://github.com/kousenlsn).
