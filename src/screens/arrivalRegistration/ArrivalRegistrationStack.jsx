import { View, ToastAndroid, Alert, Text, SafeAreaView } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "src/components/CustomButton";
import { ContentContext } from "src/context/ContextProvider";
import getTimeId from "src/functions/getTimeId";
import fetchData from "src/api/fetchData";
import printImage from "src/functions/printImage";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { API_PRINT } from "src/api/apiConfig";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import InputBar from "src/components/InputBar";
import { rpx2dp, h } from "src/functions/responsive";
import PrintModal from "src/components/PrintModal";
const CENTERSTYLE = {
  justifyContent: "center",
  alignItems: "center",
};
const ArrivalRegistration = () => {
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  const cancle = () => {
    setScanResult("");
    setResultDone("");
  };

  const handleScan = (result) => {
    setScanResult(result);
  };

  //扫码;
  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  useEffect(() => {
    setTimestampId(getTimeId());
  }, [resultDone]);

  const redirectLogin = (response) => {
    if (response.code == 1400) {
      ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
      navigation.navigate("Login");
      return;
    }
  };


  //扫码数据:scanResult=>"/nTK893773344"
  const onPress = async () => {
    if (!timestampId) return;
    if (scanResult) {
      //有扫描;
      const response = await fetchData({
        path: "/inbound/receiving/register",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          emsNo: scanResult.startsWith(SCAN_TAG)
            ? scanResult.slice(1)
            : scanResult,
          idempotentKey: timestampId,
        },
      });
      if (response.code == 200) {
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
        //未登记,直接打印；
        if (response?.data?.isRegistered == 0) {
          printImage(
            `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=1&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=${response.data.receivingNoteId}&receivingNoteDetailId=&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
            `Bearer ${ctxState?.userInfo?.token}`
          );
        }
        //已经登记，提示是否重新打印标签;
        const print = async (response) => {
          printImage(
            `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=1&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=${response.data.receivingNoteId}&receivingNoteDetailId=&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
            `Bearer ${ctxState?.userInfo?.token}`
          );
        };
        if (response?.data?.isRegistered == 1) {
          Alert.alert(
            "提示",
            `收货单号${response?.data.receivingNoteNo}已登记,是否重新打印标签?`,
            [
              {
                text: "取消",
                onPress: () => console.log("cancel"),
              },
              {
                text: "确认",
                onPress: () => print(response),
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        redirectLogin(response);
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
      }
    } else {
      setModalVisible(true);
    }
  };

  const handleSubmit = async () => {
    if (!timestampId) return;
    if (scanResult) {
      //有手动输入;
      const response = await fetchData({
        path: "/inbound/receiving/register",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          emsNo: scanResult.startsWith(SCAN_TAG)
            ? scanResult.slice(1)
            : scanResult,
          idempotentKey: timestampId,
        },
      });
      console.log(response);
      if (response.code == 200) {
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
        if (response?.data?.isRegistered == 0) {
          printImage(
            `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=1&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=${response.data.receivingNoteId}&receivingNoteDetailId=&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
            `Bearer ${ctxState?.userInfo?.token}`
          );
        }
        const print = async (response) => {
          printImage(
            `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=1&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=${response.data.receivingNoteId}&receivingNoteDetailId=&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
            `Bearer ${ctxState?.userInfo?.token}`
          );
        };
        if (response?.data?.isRegistered == 1) {
          Alert.alert(
            "提示",
            `收货单号${response?.data?.receivingNoteNo}已登记,是否重新打印标签?`,
            [
              {
                text: "确认",
                onPress: () => print(response),
              },
              {
                text: "取消",
                onPress: () => console.log("cancel"),
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        redirectLogin(response);
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
      }
    } else {
      //无手动输入、直接生成一个收货单号;
      const response = await fetchData({
        path: "/inbound/receiving/register",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: { idempotentKey: timestampId },
      });
      // console.log("收货单号", response);
      if (response.code == 200) {
        printImage(
          `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=1&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=${response.data.receivingNoteId}&receivingNoteDetailId=&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
          `Bearer ${ctxState?.userInfo?.token}`
        );
      } else {
        redirectLogin(response);
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
      }
    }
  };
  const [order, setOrder] = useState(1);
  //连续打印;
  const [modalVisible, setModalVisible] = useState(false);
  // const [printItem, setPrintItem] = useState("");
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const onChangeText = (value) => {
    setOrder(Number(value));
  };
  const handleComfirm = async () => {
    setModalVisible(false);
    for (const x of Array.from({ length: order }, (_, i) => i + 1)) {
      const response = await fetchData({
        path: "/inbound/receiving/register",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: { idempotentKey: timestampId },
      });
      // console.log(response);
      if (response.code == 200) {
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
        printImage(
          `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=1&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=${response.data.receivingNoteId}&receivingNoteDetailId=&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
          `Bearer ${ctxState?.userInfo?.token}`
        );
      } else {
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
      }
    }
  };
  const onDecrement = () => {
    if (order <= 1) return;
    setOrder((v) => parseFloat((Number(v) - 1).toFixed(4)));
  };
  const onIncrement = () => {
    setOrder((v) => parseFloat((Number(v) + 1).toFixed(4)));
  };
  return (
    <SafeAreaView>
      <View
        style={{
          ...CENTERSTYLE,
        }}
      >
        <NoTabHeadBar
          titleA={"到货登记"}
          icon={
            <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
          }
        ></NoTabHeadBar>
        <PrintModal
          order={order}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          modalVisible={modalVisible}
          onChangeText={onChangeText}
          handleCloseModal={handleCloseModal}
          handleComfirm={handleComfirm}
        />
        <InputBar
          marginTop={5}
          value={scanResult}
          placeholder={"请扫描包裹上的快递条码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={handleScan}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></InputBar>
      </View>
      <View
        style={{
          display: "flex",
          ...CENTERSTYLE,
        }}
      >
        <CustomButton
          title="打印收货签"
          titleColor="white"
          fontSize={rpx2dp(18)}
          width={rpx2dp(350)}
          height={rpx2dp(50)}
          backgroundColor="#004D92"
          borderRadius={rpx2dp(2.5)}
          marginTop={h * 0.7}
          align={{
            ...CENTERSTYLE,
          }}
          onPress={onPress}
        />
      </View>
    </SafeAreaView>
  );
};
export default ArrivalRegistration;
