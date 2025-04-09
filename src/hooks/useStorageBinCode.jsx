import { useContext } from "react";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";

const useStorageBinCode = (
  setStorageBinCode,
  setContainerCode,
  notification,
  setBindLoading
) => {
  const { ctxState } = useContext(ContentContext);
  // callback获取到货位编码后执行的回调
  const getStorageBinCodeByContainerCode = async (scanText, callback) => {
    setBindLoading(true);
    if (setContainerCode) {
      setContainerCode(scanText);
    }
    // 通过容器编码获取货位编码
    const res = await fetchData({
      path: "/base/getStorageBinByContainer",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        code: scanText,
      },
    });
    setBindLoading(false);
    if (res?.code === 200) {
      if (!res?.data) {
        notification.open({ message: "扫描容器为空" });
        setStorageBinCode("");
      } else {
        if (!res?.data?.storageBinCode) {
          notification.open({ message: `【${scanText}】未绑定货位` });
          setStorageBinCode("");
          return;
        }
        setStorageBinCode(res?.data?.storageBinCode);
        callback?.(res?.data?.storageBinCode);
      }
    } else {
      setStorageBinCode("");
      if (setContainerCode) {
        setContainerCode("");
      }
      notification.open({ message: res?.msg });
    }
  };

  return { getStorageBinCodeByContainerCode };
};

export default useStorageBinCode;
