import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import { RightTagIcon } from "src/icons/index";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { h, w } from "src/functions/responsive";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
import getTimeId from "src/functions/getTimeId";

const ItemCheck_WR_DetailStack = ({ route }) => {
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);
  const navigation = useNavigation();
  //原始单号（收货通知单号）
  const { poNote } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [loading, setLoading] = useState(true);
  const [skuList, setSkuList] = useState("");
  //入库申请单ID
  // const [inboundApplyNoteId, setInboundApplyNoteId] = useState("");
  const [inboundApplyNoteNo, setInboundApplyNoteNo] = useState("");
  //收货单ID
  // const [receivingNoteId, setReceivingNoteId] = useState("");
  //收货单号
  const [receivingNoteNo, setReceivingNoteNo] = useState("");
  //是否数数
  const [receivingCheckNumber, setReceivingCheckNumber] = useState("");

  const [poNo, setPoNo] = useState("");

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);

  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack");
  };
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      setScanResult("");
      getPolist();
    }
  }, [isFocused]);

  const getPolist = async () => {
    // console.log("ctxState", ctxState, "poNote?.id", poNote?.id);
    setLoading(true);
    const response = await fetchData({
      path: `/inbound/receiving/getInboundApplyNoteDetails?inboundApplyNoteId=${poNote?.id}&receivingNoteNo=${ctxState?.receivingNoteNo}`,
      method: "GET",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    console.log("response", response);
    if (response.code == 200) {
      setSkuList(response?.data?.details);
      setReceivingNoteNo(response?.data?.receivingNoteNo);
      setReceivingCheckNumber(response?.data?.receivingCheckNumber);
      setInboundApplyNoteNo(response?.data?.inboundApplyNoteNo);
      setLoading(false);
      setPoNo(response?.data?.poNo);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      setLoading(false);
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
    }
  };

  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const cancle = () => {
    setScanResult("");
    getPolist();
  };
  const onTextChange = (result) => {
    setScanResult(result);
  };

  //搜索筛选;
  useEffect(() => {
    if (scanResult.startsWith(SCAN_TAG)) return;
    if (!scanResult) {
      getPolist();
      return;
    }
    if (skuList && scanResult) {
      const filteredArr = skuList.filter((item) =>
        item?.skuId.includes(scanResult)
      );
      setSkuList([...filteredArr]);
    }
  }, [scanResult]);

  //100ms后未输入值、获取扫描值,存储到resultDone缓存;
  useEffect(() => {
    if (scanResult.startsWith(SCAN_TAG)) setLoading(true);
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  const getFirstSegmentBeforeSemicolon = (str) => {
    const semicolonIndex = str.indexOf(";");
    return semicolonIndex !== -1 ? str.substring(0, semicolonIndex) : str;
  };
  //匹配输入值的详细信息;
  //case1.1标准单位;
  //case1.2辅助单位;
  useEffect(() => {
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const res = getFirstSegmentBeforeSemicolon(resultDone.slice(1));
    if (resultDone) {
      const item = skuList.find((x) => {
        return String(x?.scmNo) == String(res);
      });
      if (!item) {
        ToastAndroid.show("未匹配到数据,请重新扫描或输入", ToastAndroid.SHORT);
        setScanResult("");
        setLoading(false);
      } else {
        setLoading(false);
        if (!poNote?.originalNoteNo) {
          ToastAndroid.show("数据异常", ToastAndroid.SHORT);
          return;
        }
        //无辅助单位
        item?.extUnit == ""
          ? navigation.navigate("ItemCheck_SKU_DetailStack", {
              skuDetail: item,
              receivingNoteNo: receivingNoteNo,
              originalNoteNo: poNote?.originalNoteNo,
              inboundApplyNoteDetailId: item.id,
              receivingCheckNumber: receivingCheckNumber,
            })
          : //有辅助单位
            navigation.navigate("ItemCheck_SKU_ExtUnit_DetailStack", {
              skuDetail: item,
              receivingNoteNo: receivingNoteNo,
              originalNoteNo: poNote?.originalNoteNo,
              inboundApplyNoteDetailId: item.id,
              receivingCheckNumber: receivingCheckNumber,
            });
      }
    }
  }, [resultDone]);

  const handleSubmit = () => {
    if (resultDone.startsWith(SCAN_TAG)) return;
    setRetake(!reTake);
    setLoading(true);
    if (scanResult) {
      const item = skuList.find((x) => {
        return String(x.skuId) == String(scanResult);
      });
      if (!item) {
        ToastAndroid.show("未匹配到项次,请重新扫描或输入", ToastAndroid.SHORT);
        setScanResult("");
        setLoading(false);
      } else {
        setLoading(false);
        if (!poNote?.originalNoteNo) return;
        item?.extUnit == ""
          ? navigation.navigate("ItemCheck_SKU_DetailStack", {
              skuDetail: item,
              inboundApplyNoteDetailId: item.id,
              receivingNoteNo: receivingNoteNo,
              receivingCheckNumber: receivingCheckNumber,
            })
          : navigation.navigate("ItemCheck_SKU_ExtUnit_DetailStack", {
              skuDetail: item,
              inboundApplyNoteDetailId: item.id,
              receivingNoteNo: receivingNoteNo,
              receivingCheckNumber: receivingCheckNumber,
            });
      }
    }
  };

  const onCheckPrint = async (item) => {
    if (item?.extUnit == "") {
      // return;
      //(1)非多单位核对并打印;
      const response = await fetchData({
        path: "/inbound/receiving/addReceivingNoteDetail",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          idempotentKey: timestampId,
          arrivalNum: Number(item.purchaseComingNum),
          inboundApplyNoteDetailId: item.id,
          purchaseArrivalNum: Number(item.purchaseComingNum),
          receivingNoteNo: ctxState?.receivingNoteNo,
        },
      });
      // console.log("response", response);
      if (response.code != 200) {
        ToastAndroid.show(response?.msg, ToastAndroid.LONG);
      } else {
        ToastAndroid.show("核对提交成功", ToastAndroid.SHORT);
        printImage(
          `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=2&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=${response.data}&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
          `Bearer ${ctxState?.userInfo?.token}`
        );
        setTimeout(() => {
          getPolist();
        }, 90);
        return;
        //打印Todo;
      }
    }
    if (item?.extUnit != "") {
      // return;
      //(2)多单位核对并打印;
      const response = await fetchData({
        path: "/inbound/receiving/addReceivingNoteDetail",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          idempotentKey: timestampId,
          //到货数量（采购单位）
          purchaseArrivalNum: Number(item.purchaseComingNum),
          //到货数量（库存单位）
          arrivalNum: Number(item.stockComingNum),
          //arrivalExtNum[{"name":"到货根数","num":0,"unit":"根"} {"name":"单根米数","num":0,"unit":"米"}]]
          arrivalExtNum: JSON.stringify(item.extUnit),
          inboundApplyNoteDetailId: item.id,
          receivingNoteNo: ctxState?.receivingNoteNo,
        },
      });
      if (response.code != 200) {
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
        return;
      } else {
        ToastAndroid.show("核对提交成功", ToastAndroid.SHORT);
        printImage(
          `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=2&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=${response.data}&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
          `Bearer ${ctxState?.userInfo?.token}`
        );
        setTimeout(() => {
          getPolist();
        }, 90);
        return;
      }
    }
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={poNote?.originalNoteNo}
        icon={<Text style={{ color: "white", width: 45 }}>已核对</Text>}
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描SMC签或搜索产品型号"}
        handleSubmit={handleSubmit}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
      ></InputBar>
      {skuList && (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
          }}
        >
          {loading ? (
            <View
              style={{
                marginTop: 50,
              }}
            >
              <ActivityIndicator size="large" color="rgb(180,180,180)" />
            </View>
          ) : (
            <FlatList
              style={{
                height: h * 0.75,
                width: w * 0.9,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              removeClippedSubviews={true}
              data={skuList}
              renderItem={({ item }) => (
                <GoodsPositionDetailCard
                  onPress={() => {
                    item?.extUnit == ""
                      ? navigation.navigate("ItemCheck_SKU_DetailStack", {
                          skuDetail: item,
                          inboundApplyNoteDetailId: item.id,
                          receivingNoteNo: receivingNoteNo,
                          receivingCheckNumber: receivingCheckNumber,
                        })
                      : navigation.navigate(
                          "ItemCheck_SKU_ExtUnit_DetailStack",
                          {
                            skuDetail: item,
                            inboundApplyNoteDetailId: item.id,
                            receivingNoteNo: receivingNoteNo,
                            receivingCheckNumber: receivingCheckNumber,
                          }
                        );
                  }}
                  marginTop={20}
                  item1_left={
                    item?.skuName ? (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "详细",
                            `${item?.skuName}`,
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
                        <Text style={{ fontSize: 18, color: "#004D92" }}>
                          {item?.skuName.length <= 18
                            ? item?.skuName
                            : item?.skuName.substring(0, 18) + "..."}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                  item1_right={
                    item?.noInspection == 1 ? (
                      <Image
                        source={require("src/static/mianjian.jpg")}
                        style={{ width: 30, height: 30, marginLeft: 30 }}
                      ></Image>
                    ) : null
                  }
                  item2_left={<Text style={{ fontSize: 15 }}>紧急程度</Text>}
                  item2_right={
                    <Text
                      style={{
                        fontSize: 15,
                        color:
                          item?.priority == 0
                            ? "red"
                            : item?.priority < 0
                            ? "#004D92"
                            : "black",
                      }}
                    >
                      {item?.priority == 0
                        ? "紧急"
                        : item?.priority < 0
                        ? "正常"
                        : item?.priority > 0
                        ? "逾期"
                        : null}
                    </Text>
                  }
                  item3_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
                  item3_right={
                    item?.skuId ? (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "详细",
                            `${item?.skuId}`,
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
                        <Text style={{ fontSize: 15, color: "black" }}>
                          {item?.skuId?.length <= 30
                            ? item?.skuId
                            : item?.skuId.substring(0, 30) + "..."}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                  item4_left={<Text style={{ fontSize: 15 }}>类型</Text>}
                  item4_right={
                    <Text style={{ fontSize: 15, color: "black" }}>
                      {item?.purchaseType == 1 ? "MTS" : "MTO"}
                    </Text>
                  }
                  item5_left={<Text style={{ fontSize: 15 }}>入库申请单</Text>}
                  item5_right={
                    <Text style={{ fontSize: 15, color: "black" }}>
                      {inboundApplyNoteNo}
                    </Text>
                  }
                  item6_left={<Text style={{ fontSize: 15 }}>定向值</Text>}
                  item6_right={
                    item?.targetOccupyValue ? (
                      <Text style={{ fontSize: 15, color: "black" }}>
                        {item?.targetOccupyValue}
                      </Text>
                    ) : null
                  }
                  item7_left={<Text style={{ fontSize: 15 }}>SCM单号</Text>}
                  item7_right={
                    <Text style={{ fontSize: 15, color: "black" }}>
                      {item?.scmNo}
                    </Text>
                  }
                  item8_left={<Text style={{ fontSize: 15 }}>采购单号</Text>}
                  item8_right={
                    <Text style={{ fontSize: 15, color: "black" }}>
                      {poNo ?? ""}
                    </Text>
                  }
                  item9_left={
                    <Text
                      style={{
                        fontSize: 18,
                        color: "#E28400",
                        fontWeight: "bold",
                      }}
                    >
                      {item?.purchaseComingNum} {item?.purchaseUnit}
                    </Text>
                  }
                  item9_right={
                    item?.extUnit == "" ? (
                      <TouchableOpacity onPress={() => onCheckPrint(item)}>
                        <View
                          style={{
                            width: 130,
                            height: 30,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              color: "#006DCF",
                              marginLeft: 20,
                              marginRight: -20,
                            }}
                          >
                            核对并打印
                          </Text>
                          <RightTagIcon width={"50%"} height={"50%"} />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      ""
                    )
                  }
                ></GoodsPositionDetailCard>
              )}
              keyExtractor={(item, index) => index}
            ></FlatList>
          )}
        </View>
      )}
    </View>
  );
};
export default ItemCheck_WR_DetailStack;
