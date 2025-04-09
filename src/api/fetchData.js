import { API_URL, VERSION } from "src/api/apiConfig";
import { getNavigation, getToastAndroid } from "src/functions/tool";
// @params;
// const options = {
//   path: "/mock/12/wms-pda-api/base/config/getConfig",
//   method: "GET",
//  authorization: `Bearer ${options?.token ?? null}`,
//   storageId: "1",
//   bodyParams: { name: "张三", id: 98986763, idempotentKey: "87289789736" },
//   onNav: function onNav(params) {},
// };
const fetchData = async (options, handleCode) => {
  // if (options) console.log("path", options.path);
  if (options) console.log("请求参数", options.bodyParams);
  const timestamp = new Date();
  const response = await fetch(`${API_URL}${options.path}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options?.token ?? null}`,
      "Client-Version": VERSION,
      app: "wms",
      timestamp: timestamp.getTime(),
      Storage: options?.storageId ?? null,
    },
    body: options?.bodyParams
      ? JSON.stringify({
          ...options?.bodyParams,
        })
      : null,
  })
    .then(async (response) => {
      const res = await response.json();
      // 特殊code处理
      if (res.code === 1400 || res.code === 401) {
        const navigation = getNavigation();
        const ToastAndroid = getToastAndroid();
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        setTimeout(() => {
          navigation.navigate("Login"); // 跳转到登录页
        }, 600);
      }
      return res;
    })
    .catch((error) => {
      // console.error("请求异常", error);
      return Promise.resolve({
        code: 999,
        msg: "网络错误，请稍后再试",
      });
    });
  return response;
};
export default fetchData;
