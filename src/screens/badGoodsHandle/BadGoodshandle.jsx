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
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import matchDetailId from "src/functions/matchDetailId";
import InputBar from "src/components/InputBar";
import { h, w } from "src/functions/responsive";
import { TouchableOpacity } from "react-native-gesture-handler";
const CENTERSTYLE = {
  justifyContent: "center",
  alignItems: "center",
};
const BadGoodshandle = () => {
  const navigation = useNavigation();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [skuList, setSkulist] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();

  const getList = async () => {
    setLoading(true);
    const response = await fetchData({
      path: "/inbound/putAway/defectiveGoods/getSkus",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    // console.log("残品SKU表", response);
    if (response.code == 200) {
      setScanResult("");
      setLoading(false);
      setSkulist(response.data);
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
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      getList();
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
    if (!resultDone.startsWith(SCAN_TAG)) return;
    if (!scanResult) {
      ToastAndroid.show(`请扫描项次签`, ToastAndroid.SHORT);
      return;
    }
    const receivingNoteDetailId = matchDetailId(resultDone.slice(1));
    navigation.navigate("BadGoodsHandleDetail", {
      receivingNoteDetailId: receivingNoteDetailId,
    });
  }, [resultDone]);

  const handleSubmit = () => {
    if (!scanResult) {
      ToastAndroid.show(`请输入项次签`, ToastAndroid.SHORT);
      return;
    }
    setRetake(!reTake);
    navigation.navigate("BadGoodsHandleDetail", {
      receivingNoteDetailId: scanResult,
    });
  };

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"残品入库"}
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
            display: "flex",
            marginTop: 50,
            width: w * 0.8,
            height: h * 0.65,
            ...CENTERSTYLE,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuList && !loading && (
        <View
          style={{
            display: "flex",
            width: w * 0.8,
            ...CENTERSTYLE,
          }}
        >
          <FlatList
            style={{
              height: h * 0.8,
              width: w * 0.95,
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
                item3_left={<Text style={{ fontSize: 15 }}>入库单号</Text>}
                item3_right={
                  <Text style={{ fontSize: 15 }}>{item?.inboundNoteNo}</Text>
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
export default BadGoodshandle;
