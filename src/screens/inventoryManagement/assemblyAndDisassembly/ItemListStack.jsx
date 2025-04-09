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
import { ContentContext } from "src/context/ContextProvider";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import fetchData from "src/api/fetchData";
import { h, w } from "src/functions/responsive";

//03组装拆卸单待上架项次列表
const ItemListStack = ({ route }) => {
  const { packagingDetachNoteId } = route.params;
  const navigation = useNavigation();
  const [scanResult, setScanResult] = useState("");
  const [skuList, setSkulist] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      const asyncWrapper = async () => {
        setLoading(true);
        const response = await fetchData({
          path: "/inside/packagingDetach/listBinDetailUp",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { packagingDetachNoteId: packagingDetachNoteId },
        });
        console.log("SKU表", response);
        if (response.code == 200) {
          if (response.data.length == 0) {
            ToastAndroid.show("待处理为空", ToastAndroid.SHORT);
            setLoading(false);
            return;
          }
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
          ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
          setLoading(false);
          setSkulist("");
        }
      };
      asyncWrapper();
    }
  }, [isFocused]);

  const nav = (item) => {
    navigation.navigate("ItemDetailStack", {
      item: item,
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
        titleA={"组装拆卸"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
        nav={() => navigation.navigate("TaskListStack")}
      ></NoTabHeadBar>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            height: h * 0.64,
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
            width: w * 0.8,
          }}
        >
          <FlatList
            style={{
              height: h * 0.9,
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
                item2_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
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
                      <Text style={{ fontSize: 15 }}>
                        {item?.skuId?.length <= 30
                          ? item?.skuId
                          : item?.skuId.substring(0, 30) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                item3_left={<Text style={{ fontSize: 15 }}>上架数量</Text>}
                item3_right={
                  <Text style={{ fontSize: 15 }}>
                    {item?.packagingDetachNum}
                  </Text>
                }
                item4_left={<Text style={{ fontSize: 15 }}>推荐上架货位</Text>}
                item4_right={
                  <Text style={{ fontSize: 15 }}>{item.countNoteBin}</Text>
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
export default ItemListStack;
