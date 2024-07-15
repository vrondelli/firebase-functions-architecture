import { expect } from 'chai';
import { db, testEnv } from '../config/testSetup';
import { RecordsModule } from '../../records/recordsModule';
import { clearCollection } from '../testUtils';
import { RecordsCollection } from '../../records/repositories/recordsRepository';

const { firestoreTriggers: { recordSetIncrementId } } = RecordsModule(db);

describe('recordSetIncrementId Trigger', () => {
  before(async () => clearCollection(db, RecordsCollection));

  after(async () => testEnv.cleanup());

  it('should set incrementId correctly on document creation', async () => {
    // Set up the trigger
    const wrapped = testEnv.wrap(recordSetIncrementId);
    
    // Create a new record
    const docRef = db.collection(RecordsCollection).doc();
    await docRef.set({ name: 'Test Record' });

    // Trigger the onCreate function
    await wrapped({ data: { id: docRef.id }, params: { docId: docRef.id } });

    // Verify the incrementId
    const doc = await docRef.get();
    expect(doc.data()).to.have.property('incrementId', 1);

    // Create another new record
    const docRef2 = db.collection(RecordsCollection).doc();
    await docRef2.set({ name: 'Test Record 2' });

    // Trigger the onCreate function again
    await wrapped({ data: { id: docRef2.id }, params: { docId: docRef2.id } });

    // Verify the incrementId
    const doc2 = await docRef2.get();
    expect(doc2.data()).to.have.property('incrementId', 2);
  });
});