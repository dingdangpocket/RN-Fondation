import { API_URL_TEST, VERSION } from "src/api/apiConfig";
// @params;
// const options = {
//   path: "/mock/12/wms-pda-api/base/config/getConfig",
//   method: "GET",
//  authorization: `Bearer ${options?.token ?? null}`,
//   storageId: "1",
//   bodyParams: { name: "张三", id: 98986763, idempotentKey: "87289789736" },
//   onNav: function onNav(params) {},
// };
const fetchDataTest = async (options) => {
  if (options) console.log("options", options.bodyParams);
  const timestamp = new Date();
  const response = await fetch(`${API_URL_TEST}${options.path}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      "Client-Version": VERSION,
      Timestamp: timestamp.getTime(),
      authorization: `Bearer ${options?.token ?? null}`,
      Storage: options?.storageId ?? null,
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
export default fetchDataTest;
