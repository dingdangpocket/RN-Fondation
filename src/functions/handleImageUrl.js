/*打印标签类型 1：收货签，2：项次签，3：拣货签，4：出库签，5：包裹签*/
import { API_PRINT } from "src/api/apiConfig";
export const handleImageUrl = (
  printLabelType,
  storageId,
  idMap = {
    receivingNoteId: "",
    receivingNoteDetailId: "",
    pickingNoteDetailId: "",
    packageNoteId: "",
    outboundNoteDetailId: "",
    packageNoteNo: "",
  }
) => {
  const baseUrl = `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage`;
  const queryString = Object.entries(idMap)
    .map(([key, value]) => (value ? `${key}=${value}` : key))
    .join("&");

  const fullQueryString = `printLabelType=${printLabelType}&storageId=${storageId}&${queryString}`;
  console.log("`imgUrl", `${baseUrl}?${fullQueryString}`);

  return `${baseUrl}?${fullQueryString}`;
};
