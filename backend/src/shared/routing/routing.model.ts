export type Request<AdditionalHeaders extends {} = { [key: string]: string | boolean | number }, Payload = any> = {
  headers: {
    resource: string;
    action: string;
  } & AdditionalHeaders;
  payload?: Payload;
};
