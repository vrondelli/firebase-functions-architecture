import { Firestore } from 'firebase-admin/firestore';

import { CallableHandlerFactory, HttpHandlerFactory, HttpMethods, setIncrementIdTriggerFactory } from '../framework/handlerFactory';
import { createRecordHandler } from './handlers/createRecord';
import { RecordRepository, RecordsCollection } from './repositories/recordsRepository';
import { RecordService } from './services/recordService';
import { validateCallCreateRecordRequest, validateHttpCreateRecordRequest } from './validators/requestValidator';
import { assembleCallableCreateRecordRequest, assembleHttpCreateRecordRequest } from './assemblers/requestAssemblers';
import { Module } from '../framework/module';

export const RecordsModule: Module = (db: Firestore) => {
  const recordRepository = RecordRepository(db);
  const recordService = RecordService(recordRepository);

  const createRecord = HttpHandlerFactory(
    HttpMethods.POST,
    createRecordHandler(recordService),
    validateHttpCreateRecordRequest,
    assembleHttpCreateRecordRequest
  );

  const callCreateRecord = CallableHandlerFactory(
    createRecordHandler(recordService),
    validateCallCreateRecordRequest,
    assembleCallableCreateRecordRequest
  );

  const recordSetIncrementId = setIncrementIdTriggerFactory(RecordsCollection, db)

  return {
    functions: {
      createRecord,
      callCreateRecord,
    },
    firestoreTriggers: {
      recordSetIncrementId
    }
  };
};
