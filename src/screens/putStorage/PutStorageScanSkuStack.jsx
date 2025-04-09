import {
  View,
  Text,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import matchDetailId from "src/functions/matchDetailId";

//入库落放
const PutStorageScanSkuStack = ({ route }) => {
  const { storageDetail } = route.params;
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [skuList, setSkulist] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) setRetake(!reTake);
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
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
    const receivingNoteDetailId = matchDetailId(resultDone.slice(1));
    setLoading(true);
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/placement/getReceivingNoteDetailAndPlacement`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: receivingNoteDetailId,
          storageBinCode: storageDetail.storageBinCode,
        },
      });
      console.log("扫码提交", response);
      if (response.code == 200) {
        setSkulist(response.data);
        setScanResult("");
        ToastAndroid.show("落放成功", ToastAndroid.SHORT);
        setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
        setScanResult("");
        setSkulist("");
        setLoading(false);
      }
    };
    asyncWrapper();
  }, [resultDone]);

  const handleSubmit = () => {
    if (resultDone.startsWith(SCAN_TAG)) return;
    setRetake(!reTake);
    setLoading(true);
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/placement/getReceivingNoteDetailAndPlacement`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: scanResult,
          storageBinCode: storageDetail.storageBinCode,
        },
      });
      console.log("扫码提交", response);
      if (response.code == 200) {
        setSkulist(response.data);
        setScanResult("");
        ToastAndroid.show("落放成功", ToastAndroid.SHORT);
        setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
        setScanResult("");
        setSkulist("");
        setLoading(false);
      }
    };
    asyncWrapper();
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"入库落放"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描项次标签"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
      <View
        style={{
          width: "90%",
          height: 50,
          backgroundColor: "#C6E4FF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 15 }}>
          {storageDetail.storageBinCode}
          {storageDetail.priorityText}
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width * 0.8,
            height: Height * 0.2,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuList && !loading && (
        <GoodsPositionDetailCard
          width={"90%"}
          marginTop={15}
          item1_left={
            skuList?.skuName ? (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "详细",
                    `${skuList?.skuName}`,
                    [
                      {
                        text: "确认",
                        onPress: () => console.log(""),
                      },
                    ],
                    { cancelable: false }
                  )
                }
              >
                <Text style={{ fontSize: 18 }}>
                  {skuList?.skuName.length <= 24
                    ? skuList?.skuName
                    : skuList?.skuName.substring(0, 24) + "..."}
                </Text>
              </TouchableOpacity>
            ) : null
          }
          item2_left={<Text style={{ fontSize: 15 }}>数量</Text>}
          item2_right={
            <Text style={{ fontSize: 15, color: "#E28400" }}>
              {skuList?.arrivalNum}
            </Text>
          }
          item3_left={<Text style={{ fontSize: 15 }}>收货单编号</Text>}
          item3_right={
            <Text style={{ fontSize: 15 }}>{skuList?.receivingNoteNo}</Text>
          }
          item4_left={<Text style={{ fontSize: 15 }}>收货单明细</Text>}
          item4_right={
            <Text style={{ fontSize: 15 }}>{skuList?.receivingNoteDetailId}</Text>
          }
          receivingNoteDetailId
        ></GoodsPositionDetailCard>
      )}
    </View>
  );
};
export default PutStorageScanSkuStack;
