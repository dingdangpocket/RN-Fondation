
// @params
// userRouterList=["1001","1002"]
// targetRouter="1001"
const routerAuth = (userRouterList, targetRouter) => {
  // console.log(userRouterList, targetRouter);
  return userRouterList.find((x) => x === targetRouter) == undefined ? false : true;
};
export default routerAuth;
