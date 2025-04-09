import {
  View,
  Text,
  ToastAndroid,
  Image,
  Alert,
  TouchableOpacity,
  Keyboard,
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
import { API_PRINT } from "src/api/apiConfig";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { rpx2dp } from "src/functions/responsive";
import CountComp from "src/components/CountComp";
import formatNumber from "./fun/formatNumber";

//按单拣货任务详情;
const FeatTaskDetailStack = ({ route }) => {
  const {
    pickingStorageBinCode,
    pickingStorageBinId,
    last_taskDetail,
    nextStorageCode,
    containerCode,
    fromPage,
    curSetItem,
  } = route?.params;
  //🚀pickingStorageBinCode数据是最新的;
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
  //幂等key;
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  useEffect(() => {
    if (fromPage == "FeatAblePositionStack") {
      setContainer(curSetItem?.containerCode);
      return;
    } else {
      setContainer(containerCode);
      return;
    }
  }, [fromPage]);

  //onActivehook
  //pickingStorageBinCode数据是最新的;
  //last_taskDetail是任务参数不发生变更/循环传递;
  const getDetail = async () => {
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
    console.log("刷新一次任务详情,货位参数已经变更", response);
    if (response.code == 200) {
      setItemDetail(response.data);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
    }
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    if (fromPage == "FeatAblePositionStack") {
      return;
    }
    if (isFocused) {
      getDetail();
    }
  }, [isFocused, pickingStorageBinCode]);

  const submit = async () => {
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
        //更换后传pickingStorageBinId;
        pickingStorageBinId: pickingStorageBinId
          ? pickingStorageBinId
          : itemDetail.pickingStorageBinId,
      },
    });
    // console.log("提交结果", response);
    if (response.code == 200) {
      //多张打印;
      if (response?.data?.pickingNoteDetailIds) {
        response?.data?.pickingNoteDetailIds?.map((x) => {
          printImage(
            `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=3&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=&pickingNoteDetailId=${x}&packageNoteId=&outboundNoteDetailId=`,
            `Bearer ${ctxState?.userInfo?.token}`
          );
        });
      }
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
      setModalVisible_lost(false);
      if (response.data.isDone) {
        navigation.navigate("FeatTaskDropStack", {
          taskDetail: last_taskDetail,
        });
        return;
      } else {
        navigation.navigate("FeatTaskListStack");
        return;
      }
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(`${response.msg}`, ToastAndroid.SHORT);
    }
  };

  const handleConfirm_lost = async () => {
    submit();
  };

  //缺货数量;
  const [lostCount, setLostCount] = useState(0);
  useEffect(() => {
    const sum = itemDetail?.pickingNoteDetails.reduce((ACC, NEXT) => {
      return Number(ACC) + Number(NEXT.pickingNum);
    }, 0);
    const offset = Number(itemDetail?.totalExpectNum) - Number(sum);
    setLostCount(parseFloat(offset.toFixed(4)));
  }, [itemDetail]);

  //校对SKU
  const [tag, setTag] = useState(false);
  useEffect(() => {
    if (itemDetail) {
      itemDetail?.allowScanTag == 0 ? setTag(true) : setTag(true);
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
    if (itemDetail?.allowBeyondExpectNum == 0) {
      if (lostCount < 0) {
        ToastAndroid.show("不允许超占用拣货", ToastAndroid.SHORT);
        return;
      }
      if (lostCount > 0) setModalVisible_lost(true);
      if (lostCount == 0) submit();
    }
    //允许超占用;
    if (itemDetail?.allowBeyondExpectNum == 1) {
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
      itemDetail?.pickingNoteDetails?.forEach((x, idx) => {
        if (idx == index) {
          x.pickingNum = Number(value);
        }
      });
    }
    setItemDetail({ ...itemDetail });
  };
  const onNav = () => {
    navigation.navigate("FeatAblePositionStack", {
      last_taskDetail: last_taskDetail,
      last_itemDetail: itemDetail,
      //params1:last_taskDetail循环传递；
      //params2:查看可用库存需要用到的参数当前任务详情itemDetail;
    });
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

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

  useEffect(() => {
    if (!resultDone.startsWith(SCAN_TAG)) return;
    if (resultDone) {
      if (itemDetail?.allowScanTag == 1) {
        const skuId = matchSkuId(
          scanResult.startsWith(SCAN_TAG) ? scanResult.slice(1) : scanResult
        );
        // console.log(scanResult, skuId, itemDetail.skuId);
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

  //(1)聚合总实拣数量；
  const [reslSum, setReslSum] = useState();
  useEffect(() => {
    if (itemDetail) {
      setReslSum(onSumPick(itemDetail?.pickingNoteDetails));
    }
  }, [itemDetail]);
  const onSumPick = (pickingNoteDetails) => {
    let totalPickingNum = 0;
    pickingNoteDetails.forEach((x) => {
      if (
        x?.pickingNum
        //单项状态为未取消;
      ) {
        if (x.mixPickingNoteDetailStatus != 99) {
          //多个明细情况，状态是99取消将不参与聚合计算;
          totalPickingNum += x.pickingNum;
        }
      }
    });
    return formatNumber(totalPickingNum?.toFixed(4));
  };

  //(2)聚合应拣总数量；
  const [shouldSum, setShouldSum] = useState();
  useEffect(() => {
    if (itemDetail) {
      setShouldSum(onShouldSum(itemDetail?.pickingNoteDetails));
    }
  }, [itemDetail]);
  const onShouldSum = (pickingNoteDetails) => {
    let totalExpectNum = 0;
    pickingNoteDetails.forEach((x) => {
      if (x.mixPickingNoteDetailStatus != 99) {
        //多个明细情况，状态是99取消将不参与聚合计算;
        totalExpectNum += x.expectNum;
      }
    });
    return formatNumber(totalExpectNum?.toFixed(4));
  };

  const [mg, setMg] = useState(false);
  Keyboard.addListener("keyboardDidShow", () => {
    setMg(true);
  });
  Keyboard.addListener("keyboardDidHide", () => {
    setMg(false);
  });
  return (
    <View
      style={{
        alignItems: "center",
        marginTop: mg ? -180 : 0,
      }}
    >
      <NoTabHeadBar
        titleA={"领料出库"}
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
                <Text style={{ fontSize: 20, color: "#004D92" }}>
                  {itemDetail?.skuName.length <= 24
                    ? itemDetail?.skuName
                    : itemDetail?.skuName.substring(0, 24) + "..."}
                </Text>
              </TouchableOpacity>
            ) : null
          }
          item1_right={
            <Content
              color={"#004D92"}
              fontSize={25}
              value={
                tag ? (
                  <Image
                    style={{ width: 20, height: 20 }}
                    source={require("src/static/lock.png")}
                  ></Image>
                ) : null
              }
            />
          }
          item2_left={<Content fontSize={15} value={`产品型号`} />}
          item2_right={
            <Content
              fontSize={15}
              value={
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
                      value={
                        itemDetail?.skuId.length <= 30
                          ? itemDetail?.skuId
                          : itemDetail?.skuId.substring(0, 30) + "..."
                      }
                    />
                  </TouchableOpacity>
                ) : null
              }
            />
          }
          item3_left={<Content fontSize={15} value={`容器编码`} />}
          item3_right={<Content fontSize={15} value={`${container}`} />}
          item4_left={
            <Content
              fontSize={15}
              color={"#E28400"}
              value={`应拣总数:${shouldSum}`}
            />
          }
          item4_right={
            <Content
              fontSize={15}
              color={"#E28400"}
              value={`实拣总数:${reslSum}`}
            />
          }
          item5_left={
            <Content
              fontSize={15}
              color={"#E28400"}
              value={`差值:${parseFloat((reslSum - shouldSum).toFixed(4))}`}
            />
          }
          item5_right={<Text></Text>}
        ></GoodsPositionDetailCard>
      )}
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={{
          height: "32%",
          width: "90%",
        }}
      >
        {itemDetail &&
          itemDetail?.pickingNoteDetails.map((item, index) => {
            return (
              <View key={index} style={{ marginTop: 5 }}>
                <View
                  style={{
                    width: "100%",
                    height: 45,
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>{`用料要求:`}</Text>
                  <Text style={{ fontSize: 16, color: "#E28400" }}>
                    {`${item.usageRequirements}`}
                  </Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 45,
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>{`应拣`}</Text>
                  <Text style={{ fontSize: 16, color: "#E28400" }}>
                    {`${item.expectNum} ${itemDetail.unit}`}
                  </Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 45,
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
                    iconWH={35}
                  ></CountComp>
                </View>
              </View>
            );
          })}
      </ScrollView>
      {/* 🚀todo,是否允许更换货位; */}
      {/* {itemDetail && itemDetail?.allowChangePickingStorageBin == 1 ? (
      ) : null} */}
      {itemDetail && itemDetail?.noteType == 2003 ? (
        <CustomButton
          title={`查看可用库存`}
          titleColor="#006DCF"
          fontSize={18}
          width={rpx2dp(340)}
          height={rpx2dp(45, false)}
          backgroundColor="white"
          borderRadius={2.5}
          marginTop={5}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onNav}
        />
      ) : null}
      {itemDetail && (
        <CustomButton
          title={`确认拣货${nextStorageCode ? "下一个" : ""}${nextStorageCode}`}
          titleColor="white"
          fontSize={18}
          width={rpx2dp(340)}
          height={rpx2dp(45, false)}
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
export default FeatTaskDetailStack;
