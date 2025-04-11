import { API_URL, VERSION } from "src/api/apiConfig";

const fetchData = async (params, retryCount = 0) => {
  if (!params || !params.path || !params.method) {
    throw new Error("Invalid params: 'path' and 'method' are required.");
  }
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 10000;
  try {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);
    const response = await fetch(`${API_URL}${params.path}`, {
      method: params.method,
      headers: {
        "Content-Type": "application/json",
        ...(params.token && { Authorization: `Bearer ${params.token}` }),
        "Client-Version": VERSION,
        app: "wms",
      },
      body: params.bodyParams ? JSON.stringify(params.bodyParams) : null,
      signal,
    });
    clearTimeout(timeoutId);
    const res = await response.json();
    return res;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("网络请求异常,请稍后再试");
    } else {
      console.error("网络请求异常,请稍后再试", error);
    }
    if (retryCount < MAX_RETRIES) {
      return fetchData(params, retryCount + 1);
    } else {
      console.error("网络请求异常,请稍后再试");
    }
  }
};
export default fetchData;
