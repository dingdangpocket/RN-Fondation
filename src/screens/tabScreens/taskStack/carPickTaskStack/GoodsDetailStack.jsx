import {
  View,
  Text,
  ToastAndroid,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import { ContentContext } from "src/context/ContextProvider";
import getTimeId from "src/functions/getTimeId";
import fetchData from "src/api/fetchData";
import printImage from "src/functions/printImage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import LostModal from "./Comp/LostModal";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import matchSkuId from "src/functions/matchSkuId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { API_PRINT } from "src/api/apiConfig";
import { w } from "src/functions/responsive";
import CountComp from "src/components/CountComp";
const GoodsDetailStack = ({ route }) => {
  const { pickingStorageBinCode, taskDetail, nextStorageCode, fromPage } =
    route?.params;
  const navigation = useNavigation();
  const [itemDetail, setItemDetail] = useState();
  const { ctxState } = useContext(ContentContext);
  const [timestampId, setTimestampId] = useState("");
  const [modalVisible_lost, setModalVisible_lost] = useState(false);
  const [check, setCheck] = useState(false);
  const remenberMe = () => {
    setCheck(!check);
  };
  //幂等key;
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    //获取高位任务详情；
    const getTask = async () => {
      const response = await fetchData({
        path: `/task/orderPicking/getPickingDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          taskId: taskDetail.taskId,
          pickingStorageBinCode: pickingStorageBinCode,
        },
      });
      // console.log("项次详情", response);
      if (response.code == 200) {
        setItemDetail("");
        setItemDetail(response.data);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        //无明细
        if (response.code == 201) {
          Alert.alert(
            "提示",
            `${response.msg}`,
            [{ text: "确定", onPress: () => navigation.goBack() }],
            { cancelable: false }
          );
          return;
        }
        //明细有取消
        if (response.code == 9999) {
          Alert.alert(
            "提示",
            `${response.msg}`,
            [{ text: "确定", onPress: () => navigation.goBack() }],
            { cancelable: false }
          );
          return;
        }
        if (response.code == 9000) {
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
          navigation.navigate("TasksTab");
          return;
        }
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        setLoading(false);
      }
    };
    if (isFocused) {
      getTask();
    }
  }, [isFocused, pickingStorageBinCode]);

  //防止多次点击
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(false);
    const response = await fetchData({
      path: `/task/orderPicking/submitPicking`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        ...itemDetail,
        idempotentKey: timestampId,
        isCommitStockout: check ? 1 : 0,
        taskId: itemDetail.taskId,
        pickingStorageBinId: itemDetail.pickingStorageBinId,
      },
    });
    // console.log("提交结果", response);
    if (response.code == 200) {
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
      if (itemDetail && itemDetail.pickingNoteDetails) {
        for (const x of itemDetail?.pickingNoteDetails) {
          if (x.pickingNoteDetailId) {
            await printImage(
              `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=3&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=&pickingNoteDetailId=${x.pickingNoteDetailId}&packageNoteId=&outboundNoteDetailId=`,
              `Bearer ${ctxState?.userInfo?.token}`
            );
          }
        }
      }
      setModalVisible_lost(false);
      if (response.data.isDone) {
        navigation.navigate("DropPositionDetailStack", {
          taskDetail: taskDetail,
        });
        setLoading(true);
        return;
      } else {
        navigation.goBack();
        setLoading(true);
        return;
      }
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        setLoading(false);
        return;
      }
      //如果是9999说明有取消异常场景;
      if (response.code == 9999) {
        Alert.alert(
          "提示",
          `${response.msg}`,
          [
            {
              text: "确定",
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
        setLoading(false);
        return;
      }
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setLoading(false);
    }
  };

  const handleConfirm_lost = async () => {
    submit();
  };

  //缺货数量;
  const [lostCount, setLostCount] = useState(0);
  useEffect(() => {
    const sum = itemDetail?.pickingNoteDetails?.reduce((ACC, NEXT) => {
      return Number(ACC) + Number(NEXT.pickingNum);
    }, 0);
    const offset = Number(itemDetail?.totalExpectNum) - Number(sum);
    setLostCount(parseFloat(offset.toFixed(4)));
  }, [itemDetail]);

  //校对SKU
  const [tag, setTag] = useState(true);
  useEffect(() => {
    if (itemDetail) {
      itemDetail.allowScanTag == 0 ? setTag(true) : setTag(true);
    }
  }, [itemDetail?.allowScanTag]);

  //确认拣货;
  const onSubmit = async () => {
    //需要扫描;
    if (!tag) {
      ToastAndroid.show("请扫描项次后提交", ToastAndroid.SHORT);
      return;
    }
    //超占用拦截;
    if (itemDetail.allowBeyondExpectNum == 0) {
      if (lostCount < 0) {
        ToastAndroid.show("不允许超占用拣货", ToastAndroid.SHORT);
        return;
      }
      if (lostCount > 0) setModalVisible_lost(true);
      if (lostCount == 0) submit();
    }
    if (itemDetail.allowBeyondExpectNum == 1) {
      lostCount > 0 ? setModalVisible_lost(true) : submit();
    }
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color, height: 30 }}>
      {value}
    </Text>
  );
  const handleCloseModal_lost = () => {
    setModalVisible_lost(false);
  };

  //PureCount
  const onChangeText = (value, index) => {
    const regex = /^\d*\.?\d{0,4}$/;
    if (regex.test(value)) {
      itemDetail?.pickingNoteDetails.forEach((x, idx) => {
        if (idx == index) {
          x.pickingNum = Number(value);
        }
      });
      setItemDetail({ ...itemDetail });
    }
  };
  //项次标签
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook

  useEffect(() => {
    if (isFocused) setRetake(!reTake);
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
    setTag(true);
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //150ms延时后如果没有扫描数据进入，说明扫码已经完成;
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
    if (resultDone) {
      if (itemDetail?.allowScanTag == 1) {
        const skuId = matchSkuId(
          scanResult.startsWith(SCAN_TAG) ? scanResult.slice(1) : scanResult
        );
        if (itemDetail.skuId != skuId) {
          ToastAndroid.show("项次不匹配,请重新扫描", ToastAndroid.SHORT);
          setScanResult("");
          setTag(true);
          return;
        } else {
          setTag(true);
          ToastAndroid.show("校验通过", ToastAndroid.SHORT);
        }
      }
      if (itemDetail?.allowScanTag == 0) {
        ToastAndroid.show("无需校验", ToastAndroid.SHORT);
        setTag(true);
      }
    }
  }, [resultDone]);
  const handleSubmit = () => {};

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"叉车拣货项次详情"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
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
          placeholder={"请扫描项次标签"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></InputBar>
      </View>
      {itemDetail && (
        <GoodsPositionDetailCard
          width={"90%"}
          marginTop={5}
          item1_left={
            itemDetail?.skuName ? (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "详细",
                    `${itemDetail?.skuName}`,
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
                <Content
                  color={"#004D92"}
                  fontSize={18}
                  value={
                    itemDetail?.skuName.length <= 24
                      ? itemDetail?.skuName
                      : itemDetail?.skuName.substring(0, 24) + "..."
                  }
                />
              </TouchableOpacity>
            ) : (
              ""
            )
          }
          item1_right={
            <Content
              color={"#004D92"}
              fontSize={15}
              value={
                tag ? (
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("src/static/lock.png")}
                  ></Image>
                ) : null
              }
            />
          }
          item2_left={<Content fontSize={15} value={`产品型号`} />}
          item2_right={
            itemDetail?.skuId ? (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "详细",
                    `${itemDetail?.skuId}`,
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
                <Content
                  fontSize={15}
                  value={`${
                    itemDetail?.skuId?.length <= 30
                      ? itemDetail?.skuId
                      : itemDetail?.skuId.substring(0, 30) + "..."
                  }`}
                />
              </TouchableOpacity>
            ) : null
          }
          item4_left={<Content fontSize={15} value={`应拣`} />}
          item4_right={
            <Content
              color={"#E28400"}
              fontSize={20}
              value={`${itemDetail?.totalExpectNum}${itemDetail?.unit}`}
            />
          }
        ></GoodsPositionDetailCard>
      )}
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={{
          height: "40%",
          width: "90%",
          marginTop: 10,
        }}
      >
        {itemDetail &&
          itemDetail?.pickingNoteDetails.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  width: "100%",
                  height: 60,
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  marginTop: 10,
                }}
              >
                <Content color={"#7A7A7A"} fontSize={15} value={"实拣数量:"} />
                <CountComp
                  getValue={(value) => onChangeText(value, index)}
                  initValue={item?.pickingNum}
                ></CountComp>
              </View>
            );
          })}
      </ScrollView>
      <LostModal
        check={check}
        remenberMe={remenberMe}
        lostCount={lostCount}
        modalVisible={modalVisible_lost}
        handleCloseModal={handleCloseModal_lost}
        handleConfirm={handleConfirm_lost}
      ></LostModal>
      {itemDetail && (
        <CustomButton
          disabled={loading}
          title={`确认拣货${nextStorageCode ? "下一个" : ""}${nextStorageCode}`}
          titleColor="white"
          fontSize={18}
          width={w * 0.9}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={15}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onSubmit}
        />
      )}
    </View>
  );
};
export default GoodsDetailStack;
