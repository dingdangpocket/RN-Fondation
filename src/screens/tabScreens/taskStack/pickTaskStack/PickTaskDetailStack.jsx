import {
  View,
  Text,
  ToastAndroid,
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
import { ScrollView } from "react-native-gesture-handler";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import matchSkuId from "src/functions/matchSkuId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { API_PRINT } from "src/api/apiConfig";
import CountComp from "src/components/CountComp";

//按单拣货任务详情;
const PickTaskDetailStack = ({ route }) => {
  const {
    pickingStorageBinCode,
    last_taskDetail,
    nextStorageCode,
    containerCode,
    fromPage,
    curSetItem,
  } = route?.params;
  //🚀pickingStorageBinCode数据是最新的货位;
  //🚀last_taskDetail是任务参数不发生变更/循环传递;
  const navigation = useNavigation();
  const [itemDetail, setItemDetail] = useState();
  const { ctxState } = useContext(ContentContext);
  const [timestampId, setTimestampId] = useState("");
  const [modalVisible_lost, setModalVisible_lost] = useState(false);
  const [check, setCheck] = useState(false);
  const [container, setContainer] = useState();
  const remenberMe = () => {
    setCheck(!check);
  };

  useEffect(() => {
    if (fromPage == "FeatAblePositionStack") {
      setContainer(curSetItem.containerCode);
      return;
    } else {
      setContainer(containerCode);
      return;
    }
  }, [fromPage]);

  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  //onActivehook
  const isFocused = useIsFocused();
  //获取任务详情;
  const getTask = async () => {
    const response = await fetchData({
      path: `/task/orderPicking/getPickingDetail`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: last_taskDetail.taskId,
        pickingStorageBinCode: pickingStorageBinCode,
      },
    });
    // console.log("刷新任务详情,货位参数已经变更", response);
    if (response.code == 200) {
      setItemDetail("");
      setItemDetail(response.data);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      //明细取消详情刷新;
      if (response.code == 9000) {
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        navigation.navigate("TasksTab");
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
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
    }
  };
  useEffect(() => {
    //这里必须在isFocused里面调用，否则会重复调用;
    if (isFocused) {
      getTask();
    }
  }, [isFocused, pickingStorageBinCode]);

  //防止多次点击
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    // console.log("明细id", itemDetail.pickingNoteDetails[0].pickingNoteDetailId);
    setLoading(true);
    const response = await fetchData({
      path: `/task/orderPicking/submitPicking`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        ...itemDetail,
        idempotentKey: timestampId,
        isCommitStockout: check ? 1 : 0,
        //🚀last_taskDetail.taskId不变;
        taskId: last_taskDetail.taskId,
        //🚀发生变化;
        pickingStorageBinId: itemDetail.pickingStorageBinId,
      },
    });
    // console.log("提交结果", response, itemDetail);
    if (response.code == 200) {
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
      if (itemDetail && itemDetail.pickingNoteDetails) {
        for (const x of itemDetail?.pickingNoteDetails) {
          if (x.pickingNoteDetailId) {
            // console.log("x.pickingNoteDetailId", x.pickingNoteDetailId);
            await printImage(
              `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=3&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=&pickingNoteDetailId=${x.pickingNoteDetailId}&packageNoteId=&outboundNoteDetailId=`,
              `Bearer ${ctxState?.userInfo?.token}`
            );
          }
        }
      }

      setModalVisible_lost(false);
      if (response?.data?.isDone) {
        navigation.navigate("PickTaskDropStack", {
          taskDetail: last_taskDetail,
        });
        setLoading(false);
        return;
      } else {
        navigation.navigate("PickTaskGoodsPositionListStack");
        setLoading(false);
        return;
      }
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        setLoading(false);
        return;
      }
      //整单取消;
      if (response.code == 9000) {
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        navigation.navigate("TasksTab");
        return;
      }
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
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
    //不允许超占用;
    if (itemDetail.allowBeyondExpectNum == 0) {
      if (lostCount < 0) {
        ToastAndroid.show("不允许超占用拣货", ToastAndroid.SHORT);
        return;
      }
      if (lostCount > 0) setModalVisible_lost(true);
      if (lostCount == 0) submit();
    }
    //允许超占用;
    if (itemDetail.allowBeyondExpectNum == 1) {
      lostCount > 0 ? setModalVisible_lost(true) : submit();
    }
  };
  const handleCloseModal_lost = () => {
    setModalVisible_lost(false);
  };

  //PureCountModal
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

  const onNav = () => {
    navigation.navigate("AblePositionStack", {
      last_taskDetail: last_taskDetail,
      last_itemDetail: itemDetail,
      //params1:last_taskDetail循环传递；
      //params2:查看可用库存需要用到的参数当前任务详情itemDetail;
    });
  };

  //项次标签
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [reTake, setRetake] = useState(false);

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

  const handleSubmit = () => {
    if (scanResult) {
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
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color, height: 30 }}>
      {value}
    </Text>
  );
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"拣货任务"}
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
      {itemDetail && (
        <GoodsPositionDetailCard
          width={"90%"}
          marginTop={30}
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
            ) : null
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
          item2_left={<Content fontSize={17} value={`应拣`} />}
          item2_right={
            <Content
              color={"#E28400"}
              fontSize={15}
              value={`${itemDetail?.totalExpectNum}${itemDetail?.unit}`}
            />
          }
          item3_left={<Content fontSize={17} value={`项次型号:`} />}
          item3_right={<Content fontSize={17} value={`${itemDetail?.skuId}`} />}
          item4_left={<Content fontSize={17} value={`容器编码:`} />}
          item4_right={<Content fontSize={17} value={`${container}`} />}
        ></GoodsPositionDetailCard>
      )}
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={{
          height: "35%",
          width: "90%",
          marginTop: 10,
        }}
      >
        {itemDetail &&
          itemDetail?.pickingNoteDetails.map((item, index) => {
            return (
              <View key={index} style={{ marginTop: 10 }}>
                <View
                  style={{
                    width: "100%",
                    height: 60,
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>{`应拣`}</Text>
                  <Text style={{ fontSize: 15, color: "#E28400" }}>
                    {`${item.expectNum}${itemDetail.unit}`}
                  </Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 60,
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Content
                    color={"#7A7A7A"}
                    fontSize={15}
                    value={`实拣 (${itemDetail.unit})`}
                  />
                  <CountComp
                    getValue={(value) => onChangeText(value, index)}
                    initValue={item?.pickingNum}
                  ></CountComp>
                </View>
              </View>
            );
          })}
      </ScrollView>
      {/* 🚀todo,是否允许更换货位; */}
      {itemDetail && itemDetail?.noteType == 2003 ? (
        <CustomButton
          title={`查看可用库存`}
          titleColor="#006DCF"
          fontSize={18}
          width={380}
          height={60}
          backgroundColor="white"
          borderRadius={2.5}
          marginTop={0}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onNav}
        />
      ) : null}

      {itemDetail && (
        <CustomButton
          disabled={loading}
          title={`确认拣货${nextStorageCode ? "下一个" : ""}${nextStorageCode}`}
          titleColor="white"
          fontSize={18}
          width={380}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={10}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onSubmit}
        />
      )}
      <LostModal
        check={check}
        remenberMe={remenberMe}
        lostCount={lostCount}
        modalVisible={modalVisible_lost}
        handleCloseModal={handleCloseModal_lost}
        handleConfirm={handleConfirm_lost}
      ></LostModal>
    </View>
  );
};
export default PickTaskDetailStack;
