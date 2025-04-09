import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  Alert,
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
import { TouchableOpacity } from "react-native-gesture-handler";
//商品上架；
const GoodHandleTaskList = () => {
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [skuList, setSkulist] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const getSku = async () => {
    setLoading(true);
    const response = await fetchData({
      path: "/inbound/putAway/sku/getWaitForPutawaySkus",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    console.log("SKU表", response);
    if (response.code == 200) {
      setSkulist(response.data);
      setLoading(false);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        setLoading(false);
        return;
      }
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setLoading(false);
      setSkulist("");
    }
  };

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      setScanResult("");
      getSku();
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
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

  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!scanResult) {
      return;
    }
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const receivingNoteDetailId = matchDetailId(resultDone.slice(1));
    navigation.navigate("GoodHandleTaskDetail", {
      receivingNoteDetailId: receivingNoteDetailId,
    });
  }, [resultDone]);

  const handleSubmit = () => {
    if (resultDone.startsWith(SCAN_TAG)) return;
    setRetake(!reTake);
    if (!scanResult) {
      ToastAndroid.show(`请输入项次签`, ToastAndroid.SHORT);
      return;
    }
    navigation.navigate("GoodHandleTaskDetail", {
      receivingNoteDetailId: scanResult,
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
        titleA={"待上架任务"}
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width * 0.8,
            height: Height * 0.64,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuList && !loading && (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width * 0.8,
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
                  <Text style={{ fontSize: 15, color: "#E28400" }}>
                    {item?.inboundNum}
                  </Text>
                }
                item3_left={
                  <Text style={{ fontSize: 15 }}>
                    推荐货位
                  </Text>
                }
                item3_right={
                  <Text style={{ fontSize: 15 }}>
                    {item?.suggestStorageBinCode ?? ""}
                  </Text>
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
export default GoodHandleTaskList;
