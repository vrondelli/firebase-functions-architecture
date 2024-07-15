const {expect} = require('chai')
import { db } from '../config/testSetup';
import { RecordsModule } from '../../records/recordsModule';
import { clearCollection, mockRequest, mockResponse } from '../testUtils';
import { RecordsCollection } from '../../records/repositories/recordsRepository';

const { functions: {createRecord} } = RecordsModule(db);

describe('Create Record Handler', () => {
  before(async () => {
    await clearCollection(db, RecordsCollection);
  });
  it('should create a new record with valid name', async () => {
    const req = mockRequest({ name: 'Test Record' });
    const res = mockResponse();

    await createRecord(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('name', 'Test Record');
    const recordDoc = await db.collection(RecordsCollection).doc(res.body.id).get();
    expect(recordDoc.exists).to.be.true;
    expect(recordDoc.data()).to.have.property('name', 'Test Record');
  });

  it('should return error for missing name', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    await createRecord(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Field name is required');
  });
});
