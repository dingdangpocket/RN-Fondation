import {
  View,
  Text,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import getTimeId from "src/functions/getTimeId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import matchDetailId from "src/functions/matchDetailId";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { h, w } from "src/functions/responsive";
import CountComp from "src/components/CountComp";
//清点详情
export default function Count_SKU() {
  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //幂等key;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    handleSubmit();
  }, [isFocused]);
  const navigation = useNavigation();
  const [itemCode, setItemCode] = useState("");
  const [resultDone, setResultDone] = useState("");
  const { ctxState } = useContext(ContentContext);
  const [skuInfo, setSkuInfo] = useState();
  const [loading, setLoading] = useState(false);

  const cancle = () => {
    setItemCode("");
    setSkuInfo("");
    setLoading(false);
  };
  const onTextChange = (value) => {
    setItemCode(value);
  };

  //200ms秒延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (itemCode) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(itemCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [itemCode]);
  const getItemDetail = async (code) => {
    setLoading(true);
    const response = await fetchData({
      path: `/inbound/check/getForSkuCount`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        receivingNoteDetailId: code,
      },
    });
    // console.log("response", response);
    if (response.code == 200) {
      setSkuInfo("");
      setSkuInfo(response?.data);
      setLoading(false);
      setCount("");
      setCount(response?.data?.inboundNum);
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
    if (!resultDone || !itemCode) return;
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const code = matchDetailId(resultDone.slice(1));
    getItemDetail(code);
  }, [resultDone]);

  const handleSubmit = () => {
    if (resultDone.startsWith(SCAN_TAG)) return;
    if (!resultDone || !itemCode) return;
    // const code = matchDetailId(itemCode);
    getItemDetail(itemCode);
  };
  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  const onSubmit = () => {
    const asyncWrapper = async () => {
      if (!ctxState || !skuInfo || !timestampId) return;
      const response = await fetchData({
        path: `/inbound/check/singleSkuCheck`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          inboundNoteDetailId: skuInfo.inboundNoteDetailId,
          countNum: count,
          idempotentKey: timestampId,
        },
      });
      // console.log("提交成功", response);
      if (response.code == 200) {
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
        cancle();
        setRetake(!reTake);
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

  const [count, setCount] = useState(0);
  const onGetValue = (value) => {
    setCount(value);
  };

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      behavior="padding"
      keyboardVerticalOffset={20}
    >
      <NoTabHeadBar
        titleA={"入库清点"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <InputBar
        marginTop={10}
        value={itemCode}
        placeholder={"请扫描项次签"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
        reTake={reTake}
      ></InputBar>
      {loading ? (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            height: h * 0.3,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuInfo && !loading && (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "95%",
          }}
        >
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
              <Content
                color={skuInfo?.priority == "紧急" ? "red" : "#004D92"}
                fontSize={15}
                value={`优先级:${skuInfo?.priority >= 0 ? "紧急" : "正常"}`}
              />
            }
            item3_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"采购类型:"} />
            }
            item3_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.purchaseType == 1 ? "MTS" : "MTO"}
              />
            }
            item4_left={
              skuInfo?.purchaseType == 1 ? (
                <Content color={"#7A7A7A"} fontSize={15} value={"货位分组:"} />
              ) : null
            }
            item4_right={
              skuInfo?.purchaseType == 1 ? (
                <Content
                  color={"#222222"}
                  fontSize={15}
                  value={skuInfo?.suggestStorageBinCode ?? "-"}
                />
              ) : null
            }
            item5_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"入库单号:"} />
            }
            item5_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.inboundNoteNo ?? "-"}
              />
            }
          ></GoodsPositionDetailCard>
          <View
            style={{
              height: 100,
              width: "95%",
              marginTop: 10,
              padding: 10,
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <Content color={"#7A7A7A"} fontSize={15} value={"收货数量:"} />
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.inboundNum ?? "-"}
              />
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
                value={"清点数量(个):"}
              />
              <CountComp getValue={onGetValue} initValue={count}></CountComp>
            </View>
          </View>
        </View>
      )}
      {skuInfo && (
        <CustomButton
          title="提交"
          titleColor="white"
          fontSize={18}
          width={w * 0.9}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={h * 0.25}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onSubmit}
        />
      )}
    </View>
  );
}
