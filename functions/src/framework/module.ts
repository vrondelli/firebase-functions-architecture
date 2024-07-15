import { Firestore } from "firebase-admin/firestore";
import { CloudFunction } from "firebase-functions/v2/core";
import { HttpsFunction } from "firebase-functions/v2/https";

export type Module = (db: Firestore) => {
  functions: {
    [key: string]: HttpsFunction;
  },
  firestoreTriggers: {
    [key: string]: CloudFunction<any>;
  }
}