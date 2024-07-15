/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";

import { RecordsModule } from "./records/recordsModule";

const app = admin.initializeApp();
const db = app.firestore();

const {functions: recordFunctions, firestoreTriggers: recordTriggers} = RecordsModule(db);

module.exports = {
  ...module.exports,
  ...recordFunctions,
  ...recordTriggers
}