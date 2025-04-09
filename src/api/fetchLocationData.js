import { API_GET_EXPRESS_ADDRESS } from "src/api/apiConfig";
const fetchLocationData = async (options, pCode) => {
  console.log("path", `${API_GET_EXPRESS_ADDRESS}${pCode}`);
  const response = await fetch(`${API_GET_EXPRESS_ADDRESS}${pCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${options?.token ?? null}`,
    },
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error("请求异常", error);
    });
  return response;
};
export default fetchLocationData;
