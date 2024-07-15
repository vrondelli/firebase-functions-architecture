import { RecordService } from "../services/recordService";
import { CreateRecordRequest} from "../assemblers/requestAssemblers";

export const createRecordHandler = (recordService: RecordService) => async (request: CreateRecordRequest) => {
  try {
    const record = await recordService.createRecord(request);
    return record
  } catch (error) {
    throw error
  }
}