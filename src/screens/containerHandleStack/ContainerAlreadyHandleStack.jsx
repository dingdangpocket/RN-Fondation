import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";

const ContainerAlreadyHandleStack = ({ route }) => {
  const { containerCode } = route.params;
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [skuList, setSkulist] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/inbound/putAway/container/getSkus",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { containerCode: containerCode, isDone: 1 },
        });
        // console.log("已上架列表", response);
        if (response.code == 200) {
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
      asyncWrapper();
    }
  }, [isFocused]);
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"已上架列表"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
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
            marginBottom: 0,
          }}
        >
          <FlatList
            style={{
              height: Height * 0.85,
              width: Width * 0.94,
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
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      )}
    </View>
  );
};
export default ContainerAlreadyHandleStack;
