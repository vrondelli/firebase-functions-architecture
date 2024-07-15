import * as admin from 'firebase-admin';
import { Change, Response } from "firebase-functions/v1";
import { CallableRequest, HttpsError, HttpsFunction, Request, onCall, onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted, onDocumentWritten, QueryDocumentSnapshot, DocumentSnapshot } from "firebase-functions/v2/firestore";
import { Firestore } from "firebase-admin/firestore";


export type HandlerFunction<T, K> = (request: K) => Promise<T>;
export type HttpHandler<T> = (req: Request, res: Response) => Promise<void>;

export type HttpValidator = (req: Request) => void;
export type HttpRequestAssembler<K> = (req: Request) => K;

export enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH"
}

export const HttpHandlerFactory = <T, K>(method: HttpMethods, handler: HandlerFunction<T, K>, validator: HttpValidator, assembler: HttpRequestAssembler<K>): HttpsFunction => {
  return onRequest(async (req: Request, res: Response) => {
    if (req.method !== method) res.status(405).send("Method Not Allowed");
    try {
      logger.info("Request received", { request: req });
      validator(req);
      const request = assembler(req);
      const response = await handler(request);
      logger.info("Response sent", { response });
      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Error occurred", { error });
      res.status(error.httpCode).json(error);
    }
  })
}

export type CallableValidator = (req: CallableRequest) => void;
export type CallableRequestAssembler<K> = (req: CallableRequest) => K;

// TODO: Add RBAC middleware
export const CallableHandlerFactory = <T, K>(
  handler: HandlerFunction<T, K>, 
  validator: CallableValidator, 
  assembler: CallableRequestAssembler<K>,
  requireAuth: boolean = true,
): HttpsFunction => {
  return onCall(async (request: CallableRequest<K>) => {
    if (requireAuth && !request.auth) {
      logger.error('Authentication required');
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    try {
      logger.info("Request received", { request });
      validator(request);
      const response = await handler(assembler(request));
      logger.info("Response sent", { response });
      return response;
    } catch (error: any) {
      logger.error("Error occurred", { error });
      throw new HttpsError('internal', error.message, error);
    }
  });
};

export enum FirestoreEventNames {
  onCreate = 'onCreate',
  onUpdate = 'onUpdate',
  onDelete = 'onDelete',
  onWrite ='onWrite',
};

export type FirestoreEventOnCreateEventData = QueryDocumentSnapshot | undefined
export type FirestoreEventOnUpdateEventData = Change<QueryDocumentSnapshot> | undefined
export type FirestoreEventOnDeleteEventData = QueryDocumentSnapshot | undefined
export type FirestoreEventOnWriteEventData = Change<DocumentSnapshot> | undefined

export type FirestoreOnCreateTriggerHandler = (db: Firestore, eventData: FirestoreEventOnCreateEventData) => Promise<void>;
export type FirestoreOnUpdateTriggerHandler = (db: Firestore, eventData: FirestoreEventOnUpdateEventData) => Promise<void>;
export type FirestoreOnDeleteTriggerHandler = (db: Firestore, eventData: FirestoreEventOnDeleteEventData) => Promise<void>;
export type FirestoreOnWriteTriggerHandler = (db: Firestore, eventData: FirestoreEventOnWriteEventData) => Promise<void>;

export const FirestoreOnCreateTriggerFactory = (
  collection: string,
  handler: FirestoreOnCreateTriggerHandler,
  db: Firestore
) => {
  const document = `${collection}/{docId}`;
  return onDocumentCreated(document, (event) => {
    return handler(db, event.data);
  });
};

export const FirestoreOnUpdateTriggerFactory = (
  collection: string,
  handler: FirestoreOnUpdateTriggerHandler,
  db: Firestore
) => {
  const document = `${collection}/{docId}`;
  return onDocumentUpdated(document, (event) => {
    return handler(db, event.data);
  });
};

export const FirestoreOnDeleteTriggerFactory = (
  collection: string,
  handler: FirestoreOnDeleteTriggerHandler,
  db: Firestore
) => {
  const document = `${collection}/{docId}`;
  return onDocumentDeleted(document, (event) => {
    return handler(db, event.data);
  });
};

export const FirestoreOnWriteTriggerFactory = (
  collection: string,
  handler: FirestoreOnWriteTriggerHandler,
  db: Firestore
) => {
  const document = `${collection}/{docId}`;
  return onDocumentWritten(document, (event) => {
    return handler(db, event.data);
  });
};

const setIncrementIdHandler = (collection: string) => async (db: Firestore, eventData: FirestoreEventOnCreateEventData, ) => {
  const counterRef = db.collection(collection).doc('counter');
  if (!eventData) {
    logger.error('No event data provided');
    return;
  }
  try {
    await counterRef.set({ currentId: admin.firestore.FieldValue.increment(1) }, { merge: true });
    const counterDoc = await counterRef.get();
    const newId = counterDoc.data()?.currentId;
    if (newId == null) {
      throw new Error('Failed to retrieve new increment ID');
    }
    await eventData.ref.update({ incrementId: newId });
    logger.info(`New ${collection} increment ID: ${newId}`);
  } catch (error) {
    logger.error('Error incrementing ID:', error);
  }
}

export const setIncrementIdTriggerFactory = (collection: string, db: Firestore) => {
  return FirestoreOnCreateTriggerFactory(collection, setIncrementIdHandler(collection), db);
} 