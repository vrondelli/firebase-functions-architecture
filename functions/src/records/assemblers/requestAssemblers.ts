import { CallableRequest, Request } from "firebase-functions/v2/https";

export type CreateRecordRequest = {
  name: string;
}

export const assembleHttpCreateRecordRequest = (req: Request): CreateRecordRequest => {
  return {
    name: req.body.name
  };
}

export const assembleCallableCreateRecordRequest = (req: CallableRequest): CreateRecordRequest => {
  return {
    name: req.data.name
  };
}
