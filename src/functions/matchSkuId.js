export default function matchSkuId(data) {
  let skuId = null;
  const pattern = /-.*-/;
  if (pattern.test(data)) {
    const startIndex = data.indexOf("-");
    const endIndex = data.lastIndexOf("-");
    if (endIndex + 1 < data.length) {
      skuId = data.substring(startIndex + 1, endIndex);
    }
  }
  return skuId ? skuId : null;
}
