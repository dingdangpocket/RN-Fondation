import {
  View,
  Text,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
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
import CountComp from "src/components/CountComp";
const ST = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
//清点详情
export default function BadGoodsHandleDetail({ route }) {
  const { receivingNoteDetailId } = route.params;

  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  const isFocused = useIsFocused();
  useEffect(() => {
    setBindLink(false);
    setScanResult("");
    setPositionCode("");
    if (isFocused) {
      //必须确保当前页面是激活状态！
      setRetake(!reTake);
      // setPositionCode(goodSetCode);
    }
  }, [isFocused]);

  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [skuInfo, setSkuInfo] = useState();
  const [loading, setLoading] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    const response = await fetchData({
      path: `/inbound/putAway/defectiveGoods/getInboundNoteDetail`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        receivingNoteDetailId: receivingNoteDetailId,
      },
    });
    // console.log("残品上架详情", response);
    if (response.code == 200) {
      setSkuInfo(response.data);
      setLoading(false);
      //0不数数，赋值;1数数,不赋值;
      setCountValue(response?.data?.inboundNum);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetail();
  }, [receivingNoteDetailId]);

  //货位扫码框;
  const [scanResult, setScanResult] = useState("");
  const [reTake, setRetake] = useState(false);

  const cancle = () => {
    setScanResult("");
  };
  const onTextChange = (result) => {
    setScanResult(result);
  };

  const [resultDone, setResultDone] = useState("");
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
      const asyncWrapper = async () => {
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
      asyncWrapper();
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
    if (!scanResult || !skuInfo || !ctxState || !timestampId) {
      ToastAndroid.show(`上架失败`, ToastAndroid.SHORT);
      return;
    }
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/putAway/defectiveGoods/putaway`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: skuInfo?.receivingNoteDetailId,
          operateNum: countValue,
          idempotentKey: timestampId,
          storageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
        },
      });
      // console.log("提交成功", response);
      if (response.code == 200) {
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
        navigation.goBack();
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

  const handleSubmit = () => {
    if (!scanResult.startsWith(SCAN_TAG)) return;
    if (scanResult) {
      const asyncWrapper = async () => {
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
            navigation.goBack();
          }
          setLoading(false);
        } else {
          checkToken(response);
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  };

  const [countValue, setCountValue] = useState(0);
  const onGetValue = (v) => {
    setCountValue(v);
  };

  useEffect(() => {
    if (positionCode) {
      onSubmit();
      return;
    }
  }, [positionCode]);

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );
  return (
    <View
      style={{
        ...ST,
      }}
    >
      <NoTabHeadBar
        titleA={"残品入库"}
        icon={<Text style={{ color: "white", width: 70 }}></Text>}
      ></NoTabHeadBar>
      {loading ? (
        <View
          style={{
            ...ST,
            marginTop: rpx2dp(50, false),
            width: w * 0.8,
            height: h * 0.1,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuInfo && !loading && (
        <>
          <GoodsPositionDetailCard
            width={"90%"}
            marginTop={rpx2dp(10, false)}
            item1_left={
              <Content
                color={"#004D92"}
                fontSize={18}
                value={skuInfo?.inboundNoteNo}
              />
            }
            item2_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"产品型号:"} />
            }
            item2_right={
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
                    color={"#222222"}
                    fontSize={15}
                    value={
                      skuInfo?.skuId?.length <= 30
                        ? skuInfo?.skuId
                        : skuInfo?.skuId.substring(0, 30) + "..."
                    }
                  />
                </TouchableOpacity>
              ) : null
            }
            item3_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"产品名称:"} />
            }
            item3_right={
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
                    color={"#222222"}
                    fontSize={15}
                    value={`${
                      skuInfo?.skuName.length <= 17
                        ? skuInfo?.skuName
                        : skuInfo?.skuName.substring(0, 17) + "..."
                    }`}
                  />
                </TouchableOpacity>
              ) : null
            }
            item4_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"入库类型:"} />
            }
            item4_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={`${skuInfo?.noteTypeText}`}
              />
            }
            item5_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"收货数量:"} />
            }
            item5_right={
              <Content
                color={"#E28400"}
                fontSize={15}
                value={`${skuInfo?.inboundNum}${skuInfo?.stockUnit}`}
              />
            }
          ></GoodsPositionDetailCard>
        </>
      )}
      <View
        style={{
          display: "flex",
          width: w * 0.9,
          height: h * 0.25,
          padding: 10,
          borderRadius: 10,
          backgroundColor: "white",
          marginTop: rpx2dp(10, false),
        }}
      >
        <View
          style={{
            width: "100%",
            padding: 10,
            display: "flex",
            flexDirection: "row",
            backgroundColor: "white",
            justifyContent: "space-between",
          }}
        >
          {bindLink ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommonContainerBindStack", {
                  containerCode: resultDone.startsWith(SCAN_TAG)
                    ? resultDone.slice(1)
                    : resultDone,
                  fromPage: "BadGoodsHandleDetail",
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
            padding: 5,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Content color={"#7A7A7A"} fontSize={17} value={"上架数量:"} />
          <CountComp getValue={onGetValue} initValue={countValue}></CountComp>
        </View>
      </View>
      <CustomButton
        title="确认上架"
        titleColor="white"
        fontSize={rpx2dp(18)}
        width={w * 0.95}
        height={rpx2dp(50, false)}
        backgroundColor="#004D92"
        borderRadius={rpx2dp(2.5)}
        marginTop={rpx2dp(15, false)}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </View>
  );
}
