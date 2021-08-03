export interface RecordRequest {
  url: string;
  request: any;
  requestData: { [key: string]: any };
  response: { [key: string]: any };
}
