import { SCAN_TAG } from "src/scanConfig/scanConfig";
import matchSkuId from "./matchSkuId";
import matchDetailId from "./matchDetailId";
const getScanText = (scanText, type) => {
  let text = scanText.includes(SCAN_TAG) ? scanText.slice(1) : scanText;
  if (type === "middle") {
    // 'JH-XKY-10001-10000095-10926';去掉首尾元素,返回XKY-10001-10000095
    text = matchSkuId(text);
  }
  if (type === "end") {
    // 'JH-XKY-10001-10000095-10926';返回10926
    text = matchDetailId(text);
  }
  return text;
};
export default getScanText;
