import { View, Text, ToastAndroid } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";

import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";

const ContainerTransferScanStack = ({ route }) => {
  const navigation = useNavigation();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState, dispatch } = useContext(ContentContext);

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) setRetake(!reTake);
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
    setNotes("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //200ms延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  const checkToken = (response) => {
    if (response.code == 1400) {
      ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
      navigation.navigate("Login");
      return;
    }
  };

  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    if (resultDone) {
      const code = resultDone.slice(1);
      dispatch({ type: "updateReceivingNoteNo", payload: code });
      setLoading(true);
      const scanContainerCode = async () => {
        const response = await fetchData({
          path: "/inside/storageBinTransfer/getSkuInventoryByContainer",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { containerCode: code },
        });
        console.log("response", response);
        if (response.code == 200) {
          setNotes(response?.data.skus);
          navigation.navigate("ContainerTransferSubmitStack", {
            list: response?.data.skus,
            storageBinCode:response?.data.storageBinCode,
            containerCode: scanResult.startsWith(SCAN_TAG)
              ? scanResult.slice(1)
              : scanResult,
          });
          setScanResult("");
          setLoading(false);
        } else {
          checkToken(response);
          setScanResult("");
          setLoading(false);
          if (response.code == 9001) {
            ToastAndroid.show(response.msg, ToastAndroid.SHORT);
            setNotes("");
            return;
          }
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
          setScanResult("");
          setLoading(false);
        }
      };
      scanContainerCode();
    }
  }, [resultDone]);

  const handleSubmit = () => {
    if (scanResult.startsWith(SCAN_TAG)) return;
    if (scanResult) {
      dispatch({ type: "updateReceivingNoteNo", payload: scanResult });
      setLoading(true);
      const scanContainerCode = async () => {
        const response = await fetchData({
          path: "/inside/storageBinTransfer/getSkuInventoryByContainer",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { containerCode: scanResult },
        });
        console.log("response", response);
        if (response.code == 200) {
          setNotes(response?.data.skus);
          navigation.navigate("ContainerTransferSubmitStack", {
            list: response?.data.skus,
            containerCode: scanResult.startsWith(SCAN_TAG)
              ? scanResult.slice(1)
              : scanResult,
          });
          setScanResult("");
          setLoading(false);
        } else {
          checkToken(response);
          setScanResult("");
          setLoading(false);
          if (response.code == 9001) {
            ToastAndroid.show(response.msg, ToastAndroid.SHORT);
            setNotes("");
            return;
          }
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
          setScanResult("");
          setLoading(false);
        }
      };
      scanContainerCode();
    }
  };

  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack");
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"货位转移"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <View
        style={{
          backgroundColor: "#004D92",
          width: "100%",
          height: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InputBar
          reTake={reTake}
          value={scanResult}
          placeholder={"请扫描需转移容器编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></InputBar>
      </View>
    </View>
  );
};
export default ContainerTransferScanStack;
