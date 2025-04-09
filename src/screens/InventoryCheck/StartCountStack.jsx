import {
  View,
  TouchableOpacity,
  Text,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import InputBar from "src/components/InputBar";
import Input from "src/components/Input";
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
import CountComp from "src/components/CountComp";
import { h, w } from "src/functions/responsive";
const ST = {
  backgroundColor: "white",
  justifyContent: "space-between",
  flexDirection: "row",
  alignItems: "center",
};
//开始入库清点
export default function StartCountStack({ route }) {
  const { operatingFloorId } = route.params;
  //幂等key;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      handleSubmit();
    }
  }, [isFocused]);
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [skuInfo, setSkuInfo] = useState();
  const [loading, setLoading] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [resultDone, setResultDone] = useState("");
  const cancle = () => {
    setItemCode("");
  };
  const onTextChange = (value) => {
    setItemCode(value);
  };

  //200ms秒延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (itemCode) {
      const TIMER = setTimeout(() => {
        setItemCode("");
        setResultDone("");
        setResultDone(itemCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [itemCode]);

  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    if (!ctxState) return;
    const receivingNoteDetailId = matchDetailId(resultDone);
    const asyncWrapper = async () => {
      setLoading(true);
      const response = await fetchData({
        path: `/inbound/check/getSkuCheckDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: receivingNoteDetailId,
          opFloorId: operatingFloorId,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        setLoading(false);
        setSkuInfo(response?.data);
        setCount("");
        setCount(response?.data?.inboundNum);
        setTimestampId(getTimeId());
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        setSkuInfo("");
        setLoading(false);
      }
    };
    asyncWrapper();
  }, [resultDone]);

  //扫码提交;
  const handleSubmit = () => {
    // console.log("扫项次刷新数据...refreshDatas...", itemCode);
    if (!ctxState || !itemCode) return;
    // const receivingNoteDetailId = matchDetailId(itemCode);
    const asyncWrapper = async () => {
      setLoading(true);
      const response = await fetchData({
        path: `/inbound/check/getSkuCheckDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: itemCode,
          opFloorId: operatingFloorId,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        setSkuInfo(response?.data);
        setLoading(false);
        setTimestampId(getTimeId());
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        setLoading(false);
      }
    };
    asyncWrapper();
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  const onNav = (skuInfo) => {
    // console.log("skuInfo", skuInfo);
    //封箱;
    if (skuInfo?.storageBinGroups[0]?.containerCode)
      navigation.navigate("CloseContainerStack", {
        operatingFloorId: operatingFloorId,
        storageBinGroupId: skuInfo?.storageBinGroups[0]?.storageBinGroupId,
        containerCode: skuInfo?.storageBinGroups[0]?.containerCode,
        containerRelationId: skuInfo?.storageBinGroups[0]?.containerRelationId,
        canUnbind: skuInfo?.canUnbind,
      });
    //绑箱;
    if (!skuInfo?.storageBinGroups[0]?.containerCode)
      navigation.navigate("BindContainerStack", {
        operatingFloorId: operatingFloorId,
        storageBinGroupId: skuInfo?.storageBinGroups[0]?.storageBinGroupId,
        containerCode: skuInfo?.storageBinGroups[0]?.containerCode,
        fromPage: "StartCountStack",
      });
  };
  //放入容器;
  const onSubmit = () => {
    const asyncWrapper = async () => {
      if (!skuInfo) {
        ToastAndroid.show("请先扫描项次签", ToastAndroid.SHORT);
        return;
      }
      if (!skuInfo?.storageBinGroups[0]?.containerCode && !containerCode) {
        ToastAndroid.show("请先扫描容器编码", ToastAndroid.SHORT);
        return;
      }
      //case1.1无货位、无分组、已经扫描绑定容器框、提交路线;
      if (ableContainer) {
        const response = await fetchData({
          path: `/inbound/check/containerCount`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            countNum: count,
            idempotentKey: timestampId,
            inboundNoteDetailId: skuInfo?.inboundNoteDetailId,
            containerCode: ableContainer.containerCode,
            //为了兼容此情况只要第0个;
            operatingFloorId: operatingFloorId,
            containerRelationId: ableContainer.containerRelationId,
          },
        });
        // console.log("放入成功", response);
        if (response.code == 200) {
          navigation.goBack();
          ToastAndroid.show("放入成功", ToastAndroid.SHORT);
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
        }
        return;
      }
      if (!ctxState || !skuInfo || !timestampId || !operatingFloorId) {
        return;
      }
      //case1.2有货位、有分组、不需要扫描绑定容器框、提交路线;
      const response = await fetchData({
        path: `/inbound/check/containerCount`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          countNum: count,
          idempotentKey: timestampId,
          inboundNoteDetailId: skuInfo?.inboundNoteDetailId,
          containerCode: skuInfo?.storageBinGroups[0]?.containerCode,
          operatingFloorId: operatingFloorId,
          containerRelationId:
            skuInfo?.storageBinGroups[0]?.containerRelationId,
        },
      });
      // console.log("放入成功", response);
      if (response.code == 200) {
        navigation.goBack();
        ToastAndroid.show("放入成功", ToastAndroid.SHORT);
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

  //容器编码框;
  const [reTakeItem, setReTakeItem] = useState(false);
  const [containerCode, setContainerCode] = useState("");
  const [containerCodeDone, setContainerCodeDone] = useState("");
  useEffect(() => {
    if (containerCode) {
      const TIMER = setTimeout(() => {
        setContainerCodeDone("");
        setContainerCodeDone(containerCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [containerCode]);

  const [ableContainer, setAbleContainer] = useState();

  useEffect(() => {
    //清点台编码为空;
    //检查是否为扫码枪输入;
    if (!containerCodeDone) return;
    if (!containerCodeDone.startsWith(SCAN_TAG)) return;
    console.log(containerCodeDone);
    const asyncWrapper = async () => {
      // setLoading(true);
      const response = await fetchData({
        path: `/inbound/check/getStorageBinByContainerCode`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          containerCode: containerCodeDone.slice(1),
          operatingFloorId: operatingFloorId,
        },
      });
      // console.log("可用容器", response);
      if (response.code == 200) {
        setAbleContainer(response.data);
        // setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
        // setLoading(false);
      }
    };
    asyncWrapper();
  }, [containerCodeDone]);
  
  const cancleContainerCode = () => {
    setContainerCode("");
  };

  const onContainerCodeChange = (value) => {
    setContainerCode(value);
  };

  const onContainerCodeHandleSubmit = () => {
    if (!containerCode) return;
    const asyncWrapper = async () => {
      setLoading(true);
      const response = await fetchData({
        path: `/inbound/check/getSkuCheckDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          storageBinCode: containerCode,
          operatingFloorId: operatingFloorId,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          setLoading(false);
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
        setLoading(false);
      }
    };
    asyncWrapper();
  };

  const [count, setCount] = useState(0);
  const onGetValue = (value) => {
    setCount(value);
  };
  return (
    <KeyboardAvoidingView
      style={{
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"开始清点"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <InputBar
        marginTop={5}
        value={itemCode}
        placeholder={"请扫描项次签"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            height: h * 0.5,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuInfo && !loading && (
        <View
          style={{
            width: w * 0.9,
            alignItems: "center",
          }}
        >
          <GoodsPositionDetailCard
            width={w * 0.9}
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
                value={`优先级:${skuInfo?.priorityText}`}
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
                  value={`${
                    skuInfo?.suggestStorageBinId > -1
                      ? skuInfo?.storageBinGroups[0]?.storageBinGroupName ?? "-"
                      : "-"
                  }`}
                />
              ) : null
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
                  value={
                    skuInfo?.suggestStorageBinId > -1
                      ? skuInfo?.suggestStorageBinCode
                      : "-"
                  }
                />
              ) : null
            }
          ></GoodsPositionDetailCard>
          <View
            style={{
              ...ST,
              height: 70,
              display: "flex",
              width: w * 0.9,
              marginTop: 10,
              padding: 10,
            }}
          >
            {skuInfo?.storageBinGroups[0]?.containerCode ? (
              <Text>绑定容器{skuInfo?.storageBinGroups[0].containerCode}</Text>
            ) : (
              <Input
                reTake={reTakeItem}
                value={containerCode}
                iptWidth={175}
                placeholder={"请扫描容器编码"}
                Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
                onIcon1Fun={cancleContainerCode}
                onTextChange={onContainerCodeChange}
                handleSubmit={onContainerCodeHandleSubmit}
              ></Input>
            )}
            <View>
              {!skuInfo?.storageBinGroups[0]?.storageBinGroupName &&
              !skuInfo?.suggestStorageBinCode ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CountMainListStack")}
                >
                  <View style={{ marginLeft: -100 }}>
                    <Text
                      style={{ fontSize: 15, color: "blue", marginLeft: 25 }}
                    >
                      去清点台绑箱
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : //无推荐货位;
              skuInfo?.suggestStorageBinId > -1 ? (
                <TouchableOpacity onPress={() => onNav(skuInfo)}>
                  <Text style={{ fontSize: 15 }}>
                    {skuInfo?.storageBinGroups[0]?.containerCode
                      ? "去封箱"
                      : "去绑箱"}
                  </Text>
                </TouchableOpacity>
              ) : (
                //有推荐货位;
                <TouchableOpacity onPress={() => onNav(skuInfo)}>
                  <Text style={{ fontSize: 15 }}>
                    {skuInfo?.storageBinGroups[0].containerCode
                      ? "去封箱"
                      : "去绑箱"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View
            style={{
              height: 100,
              width: w * 0.95,
              padding: 10,
            }}
          >
            <View
              style={{
                borderRadius: 5,
                width: "100%",
                backgroundColor: "white",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <Content color={"#7A7A7A"} fontSize={17} value={"收货数量:"} />
              <Content
                color={"#222222"}
                fontSize={15}
                value={skuInfo?.inboundNum ?? "-"}
              />
            </View>
            <View
              style={{
                height: 60,
                width: "100%",
                padding: 10,
                ...ST,
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
      <CustomButton
        title="放入容器"
        titleColor="white"
        fontSize={18}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        width={w * 0.9}
        marginTop={skuInfo ? h * 0.2 : h * 0.7}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </KeyboardAvoidingView>
  );
}
