// src/api/apiConfig.js
export const API_URL = "your_api_url";
export const VERSION = "your_app_version";

// src/api/fetchData.js
import { API_URL, VERSION } from "./apiConfig";

// 配置常量
const DEFAULT_TIMEOUT = 15000;
const VALID_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);

export const fetchData = async (options) => {
  // 参数校验
  if (!options?.path) throw new Error("API path is required");
  if (!VALID_METHODS.has(options.method?.toUpperCase())) {
    throw new Error(`Invalid method: ${options.method}`);
  }

  const controller = new AbortController();
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // 构造请求头
    const headers = {
      "Content-Type": "application/json",
      "Client-Version": VERSION,
      app: "wms",
      timestamp: Date.now().toString(),
      Authorization: `Bearer ${options.token}`,
    };
    // 发送请求
    const response = await fetch(`${API_URL}${options.path}`, {
      method: options.method.toUpperCase(),
      headers,
      body: options.bodyParams,
    });

    // 处理响应
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        responseData.message ||
          `HTTP Error ${response.status}: ${response.statusText}`
      );
    }
    // 处理业务错误码（根据实际API规范调整）
    if (responseData.code !== undefined && responseData.code !== 0) {
      return {
        data: null,
        success: false,
        code: responseData.code,
        message: responseData.message || "Business logic error",
      };
    }
    return {
      data: responseData.data ?? responseData,
      success: true,
      code: 0,
    };
  } catch (error) {
    return error;
  }
};

// 使用示例
const getData = async () => {
  const result = await fetchData({
    path: "/endpoint",
    method: "GET",
    token: "your_token",
    storageId: "storage_1",
    bodyParams: { page: 1 },
  });
  if (!result.success) {
    console.error(`Error ${result.code}: ${result.message}`);
    return;
  }
  console.log("Received data:", result.data);
};
