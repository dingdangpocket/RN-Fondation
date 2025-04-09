import {
  View,
  Text,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import Input from "src/components/Input";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import getTimeId from "src/functions/getTimeId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { rpx2dp, h, w } from "src/functions/responsive";
const ST = {
  width: "100%",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 10,
};
//容器上架详情
export default function ContainerHandleConfirmStack({ route }) {
  const { receivingNoteDetailId, containerCode, storageBinCode, fromPage } =
    route.params;

  //幂等key;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (fromPage && fromPage == "ContainerEmptyListStack") {
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

  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [skuInfo, setSkuInfo] = useState();
  const [loading, setLoading] = useState(false);

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  const onRightFun = () => {
    if (!skuInfo || !timestampId) return;
    const closeTask = async () => {
      const response = await fetchData({
        path: `/inbound/putAway/container/removeFromContainer`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          inboundNoteDetailId: skuInfo?.inboundNoteDetailId,
          idempotentKey: timestampId,
        },
      });
      // console.log("关闭结果", response);
      if (response.code == 200) {
        navigation.goBack();
        ToastAndroid.show(`已关闭成功${response?.msg}`, ToastAndroid.SHORT);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`关闭失败${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    closeTask();
  };

  useEffect(() => {
    //容器上架详情
    const getDetail = async () => {
      setLoading(true);
      const response = await fetchData({
        path: `/inbound/putAway/container/getInboundNoteDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: receivingNoteDetailId,
        },
      });
      // console.log("SKU详情", response);
      if (response.code == 200) {
        setSkuInfo(response.data);
        setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`获取失败${response?.msg}`, ToastAndroid.SHORT);
        setLoading(false);
      }
    };
    getDetail();
  }, [receivingNoteDetailId]);

  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [reTake, setRetake] = useState(false);
  const cancle = () => {
    setScanResult("");
    setPositionCode("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  useEffect(() => {
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  const [positionCode, setPositionCode] = useState("");
  const [bindLink, setBindLink] = useState(false);
  useEffect(() => {
    if (!resultDone.startsWith(SCAN_TAG)) return;
    if (resultDone) {
      const code = resultDone.slice(1);
      const checkContainer = async () => {
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
            setPositionCode(response.data.storageBinCode);
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
      checkContainer();
    }
  }, [resultDone]);

  useEffect(() => {
    if (positionCode) {
      onSubmit();
      return;
    }
  }, [positionCode]);

  const onSubmit = () => {
    // console.log("skuInfo", skuInfo);
    if (skuInfo.inboundNum == 0) {
      ToastAndroid.show(`上架数量不能为0`, ToastAndroid.SHORT);
      return;
    }
    if (!scanResult) {
      ToastAndroid.show(`请扫描容器编码后提交`, ToastAndroid.SHORT);
      return;
    }
    if (!scanResult || !skuInfo || !ctxState) return;
    const submitContainerTask = async () => {
      const response = await fetchData({
        path: `/inbound/putAway/container/putOn`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: skuInfo?.receivingNoteDetailId,
          storageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
          idempotentKey: timestampId,
          checkInContainer: false,
          //🚀TODO是否还需要？
          containerCode: skuInfo?.containerCode,
          operateNum: skuInfo?.inboundNum,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
        navigation.goBack();
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`上架失败${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    submitContainerTask();
  };

  const onFindContainer = () => {
    navigation.navigate("ContainerEmptyListStack");
  };
  const handleSubmit = () => {
    if (scanResult.startsWith(SCAN_TAG)) return;
    if (scanResult) {
      const checkContainer = async () => {
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
            setPositionCode(response.data.storageBinCode);
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
      checkContainer();
    }
  };
  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={containerCode}
        icon={<Text style={{ color: "white", width: 70 }}>关闭任务</Text>}
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            height: h * 0.48,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuInfo && !loading && (
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
              skuInfo?.skuId ? (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "详细",
                      `${skuInfo?.skuId}`,
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
                    color={skuInfo?.priority == "紧急" ? "red" : "#004D92"}
                    fontSize={15}
                    value={`产品型号:${
                      skuInfo?.skuId?.length <= 30
                        ? skuInfo?.skuId
                        : skuInfo?.skuId.substring(0, 30) + "..."
                    }`}
                  />
                </TouchableOpacity>
              ) : null
            }
            item3_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"采购类型:"} />
            }
            item3_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={
                  skuInfo?.purchaseType == 1
                    ? "MTS"
                    : skuInfo?.purchaseType == 0
                    ? "MTO"
                    : ""
                }
              />
            }
            item4_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"入库单号"} />
            }
            item4_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.inboundNoteNo ?? "-"}
              />
            }
            item5_left={
              skuInfo?.purchaseType == 1 ? (
                <Content
                  color={"#7A7A7A"}
                  fontSize={15}
                  value={"推荐上架货位:"}
                />
              ) : null
            }
            item5_right={
              skuInfo?.purchaseType == 1 ? (
                <Content
                  color={"#222222"}
                  fontSize={15}
                  value={skuInfo?.suggestStorageBinCode}
                />
              ) : null
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

          <View
            style={{
              height: 180,
              display: "flex",
              marginTop: 10,
              padding: 10,
              width: "90%",
              backgroundColor: "white",
              borderRadius: 5,
            }}
          >
            <View
              style={{
                ...ST,
              }}
            >
              {bindLink ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CommonContainerBindStack", {
                      containerCode: resultDone.startsWith(SCAN_TAG)
                        ? resultDone.slice(1)
                        : resultDone,
                      fromPage: "ContainerHandleConfirmStack",
                    })
                  }
                >
                  <Text style={{ fontSize: 18, color: "blue" }}>去绑定</Text>
                </TouchableOpacity>
              ) : (
                <Content
                  color={"#7A7A7A"}
                  fontSize={17}
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
            <View
              style={{
                width: "100%",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 5,
                alignItems: "center",
              }}
            >
              <Content color={"#7A7A7A"} fontSize={17} value={"上架数量"} />
              <Content
                color={"#E28400"}
                fontSize={25}
                value={skuInfo?.inboundNum ?? "-"}
              />
            </View>
          </View>
        </>
      )}
      <CustomButton
        title="查找空货位"
        titleColor="blue"
        fontSize={18}
        width={w * 0.9}
        height={rpx2dp(50, false)}
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
        height={rpx2dp(50, false)}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={10}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </View>
  );
}
