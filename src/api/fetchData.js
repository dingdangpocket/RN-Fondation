import { API_URL, VERSION } from "src/api/apiConfig";
const fetchData = async (options, handleCode) => {
  const response = await fetch(`${API_URL}${options.path}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options?.token ?? null}`,
      "Client-Version": VERSION,
      app: "wms",
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
      return res;
    })
    .catch((error) => {
       console.error("请求异常", error);
    });
  return response;
};
export default fetchData;
