import { API_URL_LOGIN, VERSION } from "src/api/apiConfig";
// @params;
// const options = {
//   path: "/mock/12/wms-pda-api/base/config/getConfig",
//   method: "GET",
//   token: "TYBWY2898239827432",
//   storageId: "1",
//   bodyParams: { name: "张三", id: 98986763, idempotentKey: "87289789736" },
//   onNav: function onNav(params) {},
// };
const fetchDataAms = async (options) => {
  if (options) console.log("options", options);
  const response = await fetch(`${API_URL_LOGIN}${options.path}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      authorization: options?.header?.token ?? null,
      "Client-Version": VERSION,
      app: "wms",
    },
    body: options?.bodyParams
      ? JSON.stringify({
          ...options?.bodyParams,
        })
      : null,
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error("请求异常", error);
    });
  return response;
};
export default fetchDataAms;
// http://ams.uat.ant2world.com/api/at-ams-api/security/login