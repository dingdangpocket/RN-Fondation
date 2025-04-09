const formatNumber = (num) => {
  let numStr = num.toString();
  let dotIndex = numStr.indexOf(".");
  if (dotIndex === -1) return numStr;
  let decimalPart = numStr.slice(dotIndex + 1);
  decimalPart = decimalPart.replace(/0+$/, "");
  if (decimalPart === "") return numStr.slice(0, dotIndex);
  return numStr.slice(0, dotIndex + 1 + decimalPart.length);
};
export default formatNumber;
