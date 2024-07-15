import { Firestore } from "firebase-admin/firestore";
import { BaseRepository, RepositoryFactory } from "../../framework/repositoryFactory";

export type Record = {
  id: string;
  name: string;
  increment_id: number;
}

export const RecordsCollection = 'records';
export type RecordRepository = BaseRepository<Record>;
export const RecordRepository = (db: Firestore): RecordRepository => RepositoryFactory<Record>(db, RecordsCollection);
  