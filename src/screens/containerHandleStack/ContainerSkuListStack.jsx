import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import matchDetailId from "src/functions/matchDetailId";
const ST = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const ContainerSkuListStack = ({ route }) => {
  const { containerCode } = route.params;
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [skuList, setSkulist] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      //获取容器内sku列表(入库单明细)
      const asyncWrapper = async () => {
        setLoading(true);
        const response = await fetchData({
          path: "/inbound/putAway/container/getSkus",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { containerCode: containerCode, isDone: 0 },
        });
        // console.log("response", response);
        if (response.code == 200) {
          setScanResult("");
          setLoading(false);
          if (response.data) {
            setSkulist(response.data);
          }
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          setSkulist(response.data);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
          setLoading(false);
        }
      };
      asyncWrapper();
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
    setNotes("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //1秒延时后如果没有扫描数据进入，说明扫码已经完成;
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
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const receivingNoteDetailId = matchDetailId(resultDone.slice(1));
    // console.log("receivingNoteDetailId", receivingNoteDetailId, skuList);
    const res = skuList.find((x) => {
      return x.receivingNoteDetailId == Number(receivingNoteDetailId);
    });
    // console.log("匹配项次结果", res);
    if (!res) {
      Alert.alert(
        "提示",
        `${receivingNoteDetailId}项次不在容器内，是否继续上架？`,
        [
          {
            text: "取消",
            onPress: () => console.log("cancel"),
          },
          {
            text: "确定",
            onPress: () =>
              navigation.navigate("ContainerHandleConfirmStack", {
                receivingNoteDetailId: receivingNoteDetailId,
                containerCode: containerCode,
                checkInContainer: false,
              }),
          },
        ],
        { cancelable: false }
      );
    } else {
      navigation.navigate("ContainerHandleConfirmStack", {
        receivingNoteDetailId: receivingNoteDetailId,
        containerCode: containerCode,
        checkInContainer: false,
      });
    }
  }, [resultDone]);

  const handleSubmit = () => {
    // console.log("scanResult", scanResult);
    setRetake(!reTake);
    navigation.navigate("ContainerHandleConfirmStack", {
      receivingNoteDetailId: scanResult,
      containerCode: containerCode,
    });
  };

  const nav = (item) => {
    navigation.navigate("ContainerHandleConfirmStack", {
      receivingNoteDetailId: item.receivingNoteDetailId,
      containerCode: containerCode,
    });
  };
  const onRightFun = () => {
    navigation.navigate("ContainerAlreadyHandleStack", {
      containerCode: containerCode,
    });
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"容器内项次"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}>
            已上架
          </Text>
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描项次签"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>

      {!skuList && <Text style={{ marginTop: 10 }}> 容器内无待上架商品</Text>}
      {loading ? (
        <View
          style={{
            marginTop: 50,
            width: Width * 0.8,
            height: Height * 0.64,
            ...ST,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuList && !loading && (
        <View
          style={{
            width: Width * 0.8,
            ...ST,
          }}
        >
          <FlatList
            style={{
              height: Height * 0.7,
              width: Width * 0.94,
              marginTop: 5,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={10}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            data={skuList}
            renderItem={({ item }) => (
              <GoodsPositionDetailCard
                marginTop={15}
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
                item2_left={<Text style={{ fontSize: 15 }}>数量</Text>}
                item2_right={
                  <Text style={{ color: "#E28400", fontSize: 15 }}>
                    {item?.inboundNum}
                  </Text>
                }
                item3_left={<Text style={{ fontSize: 15 }}>推荐货位</Text>}
                item3_right={
                  <Text style={{ fontSize: 15 }}>
                    {item?.suggestStorageBinCode}
                  </Text>
                }
                item4_left={<Text style={{ fontSize: 15 }}>入库单号</Text>}
                item4_right={
                  <Text style={{ fontSize: 15 }}>{item?.inboundNoteNo}</Text>
                }
                onPress={() => nav(item)}
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      )}
    </View>
  );
};
export default ContainerSkuListStack;
