import { expect } from 'chai';
import { testSetup } from './config/testSetup';
import { test } from 'mocha';



test('testRunner', async () => {
  const setup = await testSetup();
  expect(setup).to.be.true;
  require('./records/createRecord.test');
  require('./records/recordSetIncrementId.test') 
})



