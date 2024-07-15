import { CreateRecordRequest } from "../assemblers/requestAssemblers";
import { Record, RecordRepository } from "../repositories/recordsRepository";
import errorMessage from "../../res/errorMessage";

export type RecordService = {
  createRecord(createRecordRequest: CreateRecordRequest): Promise<Record>;
}
export const RecordService = (recordRepository: RecordRepository): RecordService => {
  const createRecord = async (createRecordRequest: CreateRecordRequest): Promise<Record> => {
    try {
      const record = await recordRepository.create(createRecordRequest);
      return record
    } catch (error: any) {
      console.log(`Record Service Error: creating record: ${error.message}`);
      throw errorMessage.internalError
    }
  }

  return {
    createRecord
  }
}  