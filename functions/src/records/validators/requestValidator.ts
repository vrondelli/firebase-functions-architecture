import { CallableRequest, Request } from "firebase-functions/v2/https";
import errorMessage from "../../res/errorMessage";

export const validateHttpCreateRecordRequest = (request: Request): void => {
  const { name } = request.body;
  if (!name) throw errorMessage.fieldRequired('name');
}

export const validateCallCreateRecordRequest = (request: CallableRequest): void => {
  const { name } = request.data;
  if (!name) throw errorMessage.fieldRequired('name');
}