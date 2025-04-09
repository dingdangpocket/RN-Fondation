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
//质检落放
const GetGoodsSetListStack = ({ route }) => {
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [skuList, setSkulist] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      const asyncWrapper = async () => {
        setLoading(true);
        const response = await fetchData({
          path: "/inbound/inspect/placement/getReceivingNoteDetails",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
        });
        // console.log("SKU表", response);
        if (response.code == 200) {
          setScanResult("");
          setLoading(false);
          if (response.data) setSkulist(response.data);
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
    }
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
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const receivingNoteDetailId = matchDetailId(resultDone.slice(1));
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/inspect/placement/getReceivingNoteDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: receivingNoteDetailId,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        response.data.inspectType == 1
          ? ToastAndroid.show("免检项次请操作入库落放;", ToastAndroid.SHORT)
          : navigation.navigate("GetGoodsSetComfirmStack", {
              detail: response.data,
            });
        return;
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
  }, [resultDone]);

  const handleSubmit = () => {
    //被联动触发了；
    if (!scanResult) {
      ToastAndroid.show(`请输入项次签后查询`, ToastAndroid.SHORT);
      return;
    }
    setRetake(!reTake);
    if (resultDone.startsWith(SCAN_TAG)) return;
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/inspect/getReceivingNoteDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          receivingNoteDetailId: scanResult,
        },
      });
      if (response.code == 200) {
        // console.log("落放项次详情", response);
        response.data.inspectType == 1
          ? ToastAndroid.show("免检项次请操作入库落放;", ToastAndroid.SHORT)
          : navigation.navigate("GetGoodsSetComfirmStack", {
              detail: response.data,
            });
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`获取失败${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };

  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"质检落放"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
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
              height: Height * 0.8,
              width: Width * 0.95,
              marginTop: 5,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            scrollEventThrottle={10}
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
                      <Text style={{ fontSize: 18, color: "#004D92" }}>
                        {item?.skuName.length <= 24
                          ? item?.skuName
                          : item?.skuName.substring(0, 24) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                item2_left={<Text style={{ fontSize: 15 }}>数量</Text>}
                item2_right={
                  <Text style={{ fontSize: 15, color: "#E28400" }}>
                    {item?.arrivalNum}
                    {item?.stockUnit}
                  </Text>
                }
                item3_left={<Text style={{ fontSize: 15 }}>收货单号</Text>}
                item3_right={
                  <Text style={{ fontSize: 15 }}>{item?.receivingNoteNo}</Text>
                }
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      )}
    </View>
  );
};
export default GetGoodsSetListStack;
