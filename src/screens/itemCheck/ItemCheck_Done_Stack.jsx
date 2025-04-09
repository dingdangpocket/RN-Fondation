import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation } from "@react-navigation/native";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
import { rpx2dp, h, w } from "src/functions/responsive";
const ItemCheck_Done_Stack = ({ route }) => {
  const navigation = useNavigation();
  // const { receivingNoteNo } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [checked, setCheckeds] = useState();
  const getItemCheck_Done = async () => {
    setLoading(true);
    const response = await fetchData({
      path: "/inbound/receiving/getCheckedReceivingNoteDetails",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { receivingNoteNo: ctxState?.receivingNoteNo },
    });
    console.log("response", response);
    if (response.code == 200) {
      setCheckeds(response.data);
      setLoading(false);
      return;
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        setLoading(false);
        return;
      }
      setLoading(false);
      ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
    }
  };
  useEffect(() => {
    if (!ctxState) return;
    getItemCheck_Done();
  }, []);

  const onCancel = (item) => {
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: "/inbound/receiving/deleteReceivingNoteDetail",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: { receivingNoteDetailId: item.receivingNoteDetailId },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("成功移出", ToastAndroid.SHORT);
        getItemCheck_Done();
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`移出失败${response.msg}`, ToastAndroid.SHORT);
      }
    };
    Alert.alert(
      "提示",
      "是否移出核对结果？",
      [
        {
          text: "取消",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "确认移出", onPress: () => asyncWrapper() },
      ],
      { cancelable: true }
    );
  };

  const onPrint = async (item) => {
    printImage(
      `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=2&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=${item.receivingNoteDetailId}&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
      `Bearer ${ctxState?.userInfo?.token}`
    );
  };

  const [loading, setLoading] = useState(false);
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"已核对"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      {checked?.length == 0 && (
        <Text style={{ marginTop: 50, color: "rgb(170,170,170)" }}>
          暂无数据
        </Text>
      )}
      {loading && (
        <View
          style={{
            height: h * 0.2,
            marginTop: 50,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      )}
      {checked?.length != 0 && !loading ? (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
          }}
        >
          <FlatList
            style={{
              height: h * 0.85,
              width: w * 0.95,
              marginTop: 5,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            scrollEventThrottle={10}
            data={checked}
            renderItem={({ item }) => (
              <GoodsPositionDetailCard
                onPress={() => onCancel(item)}
                marginTop={20}
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
                item1_right={
                  <View
                    style={{
                      width: 70,
                      height: 70,
                    }}
                  >
                    {item?.noInspection == 1 ? (
                      <Image
                        source={require("src/static/mianjian.jpg")}
                        style={{ width: 50, height: 50, marginLeft: 30 }}
                      ></Image>
                    ) : null}
                  </View>
                }
                item2_left={
                  <Text
                    style={{
                      fontSize: 15,
                      color:
                        item?.priority == 0
                          ? "red"
                          : item?.priority < 0
                          ? "#004D92"
                          : "black",
                      width: rpx2dp(300),
                    }}
                  >
                    {item?.priority == 0
                      ? "紧急"
                      : item?.priority < 0
                      ? "正常"
                      : item?.priority > 0
                      ? "逾期"
                      : null}
                  </Text>
                }
                item3_left={
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
                      <Text style={{ fontSize: 15, color: "#222222" }}>
                        {item?.skuId?.length <= 30
                          ? item?.skuId
                          : item?.skuId.substring(0, 30) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                item4_left={
                  <Text style={{ fontSize: 15, color: "#222222" }}>
                    {item?.purchaseType == 1 ? "MTS" : "MTO"}
                  </Text>
                }
                item5_left={
                  <Text style={{ fontSize: 15, color: "#222222" }}>
                    {item?.receivingNoteDetailId}
                  </Text>
                }
                item6_left={
                  <Text style={{ fontSize: 15, color: "#222222" }}>
                    {item?.arrivalNum} {item?.stockUnit}
                  </Text>
                }
                item6_right={
                  <TouchableOpacity onPress={() => onPrint(item)}>
                    <View
                      style={{
                        height: rpx2dp(30, false),
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#006DCF",
                          marginLeft: 60,
                        }}
                      >
                        打印
                      </Text>
                    </View>
                  </TouchableOpacity>
                }
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      ) : null}
    </View>
  );
};
export default ItemCheck_Done_Stack;
