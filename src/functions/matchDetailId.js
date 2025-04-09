const matchDetailId = (params) => {
  const matchDetailId = params.match(/-(\d+)$/);
  console.log(params);
  return matchDetailId ? matchDetailId[1] : "";
};
export default matchDetailId;
