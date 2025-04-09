import {
  View,
  Text,
  ToastAndroid,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import Input from "src/components/Input";
import { CancleIcon, ScanIcon } from "src/icons/index";
import getTimeId from "src/functions/getTimeId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import useWindow from "src/hooks/useWindow";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { w } from "src/functions/responsive";
import CountComp from "src/components/CountComp";
const ST = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const ST1 = {
  width: "100%",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
};
//🚀根据策略判断是否可修改数量;
export default function GoodHandleTaskDetail({ route }) {
  const { receivingNoteDetailId, containerCode, storageBinCode, fromPage } =
    route.params;
  // console.log("containerCode", storageBinCode, containerCode);
  //幂等key;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  const [Width, Height] = useWindow();
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [skuInfo, setSkuInfo] = useState({});
  const [loading, setLoading] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (fromPage && fromPage == "GoodHandleSearchPositionStack") {
      setPositionCode(storageBinCode);
      setScanResult(containerCode);
    }
  }, [isFocused]);
  useEffect(() => {
    if (!fromPage) {
      setBindLink(false);
      setScanResult("");
      setPositionCode("");
    }
    if (isFocused) {
      //必须确保当前页面是激活状态！
      setRetake(!reTake);
    }
  }, [isFocused]);

  //初始加载上架详情;
  useEffect(() => {
    const getDetail = async () => {
      setLoading(true);
      const response = await fetchData({
        path: `/inbound/putAway/sku/getInboundNoteDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: receivingNoteDetailId,
        },
      });
      // console.log("商品上架详情", response);
      if (response.code == 200) {
        if (response?.data?.receivingCheckNumber == 1) {
          setOptCount(response?.data?.inboundNum);
        }
        setSkuInfo(response.data);
        setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          setLoading(false);
          return;
        }
        ToastAndroid.show(`获取失败${response?.msg}`, ToastAndroid.SHORT);
        setLoading(false);
      }
    };
    getDetail();
  }, [receivingNoteDetailId]);

  //容器编码扫码框
  const cancle = () => {
    setScanResult("");
  };
  const onTextChange = (result) => {
    setScanResult(result);
  };
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [reTake, setRetake] = useState(false);
  const [bindLink, setBindLink] = useState(false);
  const [positionCode, setPositionCode] = useState("");
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
      const code = resultDone.slice(1);
      const getStorageBinByContainer = async () => {
        const response = await fetchData({
          path: "/base/getStorageBinByContainer",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { code: code },
        });
        // console.log("response", response);
        if (response.code == 200) {
          if (response.data.binding == 0) {
            ToastAndroid.show(
              "容器暂未绑定货位,请绑定货位后提交",
              ToastAndroid.SHORT
            );
            setBindLink(true);
          }
          if (response.data.binding == 1) {
            setBindLink(false);
            setPositionCode(response?.data?.storageBinCode);
          }
          setLoading(false);
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
      getStorageBinByContainer();
    }
  }, [resultDone]);

  useEffect(() => {
    if (positionCode) {
      onSubmit();
      return;
    }
  }, [positionCode]);

  //确认上架
  const onSubmit = () => {
    if (!scanResult) {
      ToastAndroid.show(`请扫描容器编码后提交`, ToastAndroid.SHORT);
      return;
    }
    if (!scanResult || !skuInfo || !ctxState || !timestampId || !positionCode) {
      ToastAndroid.show(`上架失败`, ToastAndroid.SHORT);
      return;
    }
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/putAway/sku/putaway`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: skuInfo.receivingNoteDetailId,
          operateNum: optCount,
          idempotentKey: timestampId,
          storageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
        },
      });
      // console.log("提交成功", response);
      if (response.code == 200) {
        navigation.goBack();
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`上架失败${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };

  const onFindContainer = () => {
    navigation.navigate("GoodHandleSearchPositionStack");
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  const handleSubmit = () => {
    if (!scanResult.startsWith(SCAN_TAG)) return;
    if (scanResult) {
      const getStorageBinByContainer = async () => {
        const response = await fetchData({
          path: "/base/getStorageBinByContainer",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { code: scanResult },
        });
        // console.log("response", response);
        if (response.code == 200) {
          if (response.data.binding == 0) {
            ToastAndroid.show(
              "容器暂未绑定货位,请绑定货位后提交",
              ToastAndroid.SHORT
            );
            setBindLink(true);
          }
          if (response.data.binding == 1) {
            setBindLink(false);
            setPositionCode(response?.data?.storageBinCode);
            navigation.goBack();
          }
          setLoading(false);
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
      getStorageBinByContainer();
    }
  };

  const [optCount, setOptCount] = useState(0);
  const onGetValue = (v) => {
    setOptCount(v);
  };

  return (
    <KeyboardAvoidingView
      style={{
        ...ST,
      }}
    >
      <NoTabHeadBar
        titleA={"上架详情"}
        icon={<Text style={{ color: "white", width: 70 }}></Text>}
      ></NoTabHeadBar>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            width: Width * 0.8,
            height: Height * 0.105,
            ...ST,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuInfo?.skuName && !loading && (
        <>
          <GoodsPositionDetailCard
            width={"90%"}
            marginTop={10}
            item1_left={
              skuInfo?.skuName ? (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "详细",
                      `${skuInfo?.skuName}`,
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
                      skuInfo?.skuName.length <= 24
                        ? skuInfo?.skuName
                        : skuInfo?.skuName.substring(0, 24) + "..."
                    }
                  />
                </TouchableOpacity>
              ) : null
            }
            item2_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"产品型号:"} />
            }
            item2_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={`${skuInfo?.skuId}`}
              />
            }
            item3_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"入库单号:"} />
            }
            item3_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={`${
                  skuInfo?.inboundNoteNo ? skuInfo?.inboundNoteNo : "-"
                }`}
              />
            }
            item4_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"上架数量:"} />
            }
            item4_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={`${skuInfo?.inboundNum}${skuInfo?.stockUnit}`}
              />
            }
            item5_left={
              <Content
                color={"#7A7A7A"}
                fontSize={15}
                value={"推荐上架货位:"}
              />
            }
            item5_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.suggestStorageBinCode}
              />
            }
            item6_left={
              <Content
                color={"#7A7A7A"}
                fontSize={15}
                value={"推荐上架货位组:"}
              />
            }
            item6_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.groupName}
              />
            }
          ></GoodsPositionDetailCard>
        </>
      )}
      <View
        style={{
          height: 180,
          display: "flex",
          width: "90%",
          marginTop: 10,
          padding: 10,
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            ...ST1,
          }}
        >
          {bindLink ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommonContainerBindStack", {
                  containerCode: resultDone.startsWith(SCAN_TAG)
                    ? resultDone.slice(1)
                    : resultDone,
                  fromPage: "GoodHandleTaskDetail",
                })
              }
            >
              <Text style={{ fontSize: 18, color: "blue" }}>去绑定</Text>
            </TouchableOpacity>
          ) : (
            <Content
              color={"#7A7A7A"}
              fontSize={18}
              value={`上架货位:${positionCode ? positionCode : ""}`}
            />
          )}
        </View>
        <Input
          iptWidth={"90%"}
          reTake={reTake}
          value={scanResult}
          placeholder={"请扫描容器编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          handleSubmit={handleSubmit}
        ></Input>
        {/* //0不数数,不编辑提交;1数数,赋值编辑提交; */}
        {skuInfo?.receivingCheckNumber == 0 ? (
          ""
        ) : (
          <View
            style={{
              width: "100%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 5,
            }}
          >
            <Content color={"#7A7A7A"} fontSize={17} value={"上架数量:"} />
            <CountComp getValue={onGetValue} initValue={optCount}></CountComp>
          </View>
        )}
      </View>
      <CustomButton
        title="查找空货位"
        titleColor="blue"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="white"
        borderRadius={2.5}
        marginTop={10}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onFindContainer}
      />
      <CustomButton
        title="确认上架"
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
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
    </KeyboardAvoidingView>
  );
}
