import { Firestore } from "firebase-admin/firestore";

export type BaseRepository<T> = {
  create(item: Partial<T>): Promise<T>;
  get(id: string): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export const RepositoryFactory = <T>(db: Firestore, collection: string): BaseRepository<T> => {
  const create = async (item: Partial<T>): Promise<T> => {
    try {
      const newDoc = await db.collection(collection).add(item);
      return newDoc.get().then(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error: any) {
      throw new Error(`${collection} Repository Error: creating record: ${error.message}`);
    }
  }

  const get = async (id: string): Promise<T> => {
    try {
      const doc = await db.collection(collection).doc(id).get();
      if (!doc.exists) {
        throw new Error('Record not found');
      }
      return { id: doc.id, ...doc.data() } as T;
    } catch (error: any) {
      throw new Error(`${collection} Repository Error: getting record: ${error.message}`);
    }
  }

  const update = async (id: string, item: Partial<T>): Promise<T> => {
    try {
      await db.collection(collection).doc(id).set(item);
      return { id, ...item } as T;
    } catch (error: any) {
      throw new Error(`${collection} Repository Error: updating record: ${error.message}`);
    }
  }

  const deleteRecord = async (id: string): Promise<void> => {
    try {
      await db.collection(collection).doc(id).delete();
    } catch (error: any) {
      throw new Error(`${collection} Repository Error: deleting record: ${error.message}`);
    }
  }

  return {
    create,
    get,
    update,
    delete: deleteRecord
  }
}