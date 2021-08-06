export interface HAR {
  log: {
    entries: [
      {
        request: {
          url: string;
          postData: {
            text: string;
          };
        };
        response: {
          content: {
            text: string;
            mimeType: string;
          };
        };
      }
    ];
  };
}