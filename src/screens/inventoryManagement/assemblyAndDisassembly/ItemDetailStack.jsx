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
import getTimeId from "src/functions/getTimeId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { h, w } from "src/functions/responsive";

//🚀04组装拆卸上架;
export default function ItemDetailStack({ route }) {
  const {
    item,
    fromPage,
    storageBinCode,
    containerCode,
    bindStorageBinCode,
    bindContainerCode,
  } = route.params;

  //幂等key;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
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
    if (isFocused) {
      //必须确保当前页面是激活状态！
      setRetake(!reTake);
      // setPositionCode(goodSetCode);
    }
    setBindLink(false);
    setScanResult("");
    setPositionCode("");
  }, [isFocused]);

  //容器编码扫码框
  const cancle = () => {
    setPositionCode("");
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
    if (isFocused) {
      if (bindContainerCode) {
        setScanResult(bindContainerCode);
        return;
      }
    }
  }, [isFocused, bindContainerCode]);

  useEffect(() => {
    if (isFocused) {
      if (bindStorageBinCode) {
        setPositionCode(bindStorageBinCode);
        return;
      }
    }
  }, [isFocused, bindStorageBinCode]);

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
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  }, [resultDone]);
  const handleSubmit = () => {
    if (resultDone.startsWith(SCAN_TAG)) return;
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
            setPositionCode(response?.data?.storageBinCode);
          }
          setLoading(false);
        } else {
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  };

  //确认上架
  const onSubmit = () => {
    // console.log("item", item);
    if (!scanResult) {
      ToastAndroid.show(`请扫描货位编码后提交`, ToastAndroid.SHORT);
      return;
    }
    if (!timestampId) return;
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inside/packagingDetach/submitUp`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          //待确认;
          operateNum: item?.packagingDetachNum,
          idempotentKey: timestampId,
          storageBin: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
          packagingDetachNoteBinDetailId: item.packagingDetachNoteBinDetailId,
        },
      });
      // console.log("提交成功", response);
      if (response.code == 200) {
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
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

  const onFindContainer = () => {
    navigation.navigate("EmptyPositionStack");
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"组装拆卸"}
        icon={<Text style={{ color: "white", width: 70 }}></Text>}
      ></NoTabHeadBar>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            height: h * 0.105,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {item && (
        <>
          <GoodsPositionDetailCard
            width={"90%"}
            marginTop={10}
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
                  <Text style={{ color: "#004D92", fontSize: 18 }}>
                    {item?.skuName.length <= 24
                      ? item?.skuName
                      : item?.skuName.substring(0, 24) + "..."}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
            item2_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"产品型号:"} />
            }
            item2_right={
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
                  <Content
                    color={"#222222"}
                    fontSize={15}
                    value={
                      item?.skuId?.length <= 30
                        ? item?.skuId
                        : item?.skuId.substring(0, 30) + "..."
                    }
                  />
                </TouchableOpacity>
              ) : null
            }
            item3_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"上架数量:"} />
            }
            item3_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={`${item.packagingDetachNum} ${item.inventoryUnit}`}
              />
            }
            item4_left={
              <Content
                color={"#7A7A7A"}
                fontSize={15}
                value={"推荐上架货位:"}
              />
            }
            item4_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={item.countNoteBin}
              />
            }
            item5_left={
              <Content
                color={"#7A7A7A"}
                fontSize={15}
                value={"推荐上架货位组:"}
              />
            }
            item5_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={item.storageBinGroup}
              />
            }
          ></GoodsPositionDetailCard>
        </>
      )}
      <View
        style={{
          height: 130,
          display: "flex",
          width: "90%",
          marginTop: 10,
          padding: 10,
          backgroundColor: "white",
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
          {bindLink ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommonContainerBindStack", {
                  containerCode: resultDone.startsWith(SCAN_TAG)
                    ? resultDone.slice(1)
                    : resultDone,
                  fromPage: "ItemDetailStack",
                })
              }
            >
              <Text style={{ fontSize: 15, color: "blue" }}>去绑定</Text>
            </TouchableOpacity>
          ) : (
            <Content
              color={"#7A7A7A"}
              fontSize={15}
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
    </View>
  );
}
