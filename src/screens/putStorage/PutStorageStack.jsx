import { View, Text, ToastAndroid } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import Warn from "src/components/Warn";

//入库落放
const PutStorageStack = () => {
  const navigation = useNavigation();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const { ctxState } = useContext(ContentContext);
  // const [notes, setNotes] = useState("");

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) setRetake(!reTake);
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
    // setNotes("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //1秒延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const storageBinCode = resultDone.slice(1);
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/placement/scanStorageBin`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          storageBinCode: storageBinCode,
        },
      });
      // console.log("落放位置详情", response);
      if (response.code == 200) {
        navigation.navigate("PutStorageScanSkuStack", {
          storageDetail: response.data,
        });
        setScanResult("");
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
        onLight();
      }
    };
    asyncWrapper();
  }, [resultDone]);

  const handleSubmit = () => {
    setRetake(!reTake);
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/inspect/getReceivingNoteDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          storageBinCode: scanResult,
        },
      });
      if (response.code == 200) {
        console.log("落放项次详情", response);
        navigation.navigate("PutStorageScanSkuStack", {
          storageDetail: response.data,
        });
        setScanResult("");
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };

   //遮罩;
   const [isVisible, setIsVisible] = useState(false);
   const onLight = () => {
     setIsVisible(true);
     const timer = setTimeout(() => {
       setIsVisible(false);
     }, 2000);
     return () => clearTimeout(timer);
   };

  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Warn light={isVisible}></Warn>
      <NoTabHeadBar
        titleA={"入库落放"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描收货落放位"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
    </View>
  );
};
export default PutStorageStack;
