import {
  View,
  Text,
  ToastAndroid,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import CustomButton from "src/components/CustomButton";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import { h, w } from "src/functions/responsive";
export default function CountMainListStack({ route }) {
  // console.log("opFloorCode", route.params.operatingFloorId);
  const { operatingFloorId } = route.params;
  const navigation = useNavigation();
  const { ctxState, dispatch } = useContext(ContentContext);
  const [stashArray, setStashArray] = useState([]);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    const Timer = setTimeout(() => {
      dispatch({
        type: "updateInventoryCheckOpt",
        payload: {
          operatingFloorId: operatingFloorId,
        },
      });
    }, 0);
    return () => clearTimeout(Timer);
  }, []);
  const getStorageBinGroups = async () => {
    setLoading(true);
    const response = await fetchData({
      path: `/inbound/check/getStorageBinGroups`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        operatingFloorId: operatingFloorId,
      },
    });
    // console.log(response);
    if (response.code == 200) {
      setStashArray(response?.data);
      setLoading(false);
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
      getStorageBinGroups();
    }
  }, [isFocused, operatingFloorId]);

  const onConfirm = () => {
    navigation.navigate("StartCountStack", {
      operatingFloorId: operatingFloorId,
    });
  };

  const onNav = (item) => {
    // console.log("item", item);
    if (item?.containerCode) {
      //封箱
      navigation.navigate("CloseContainerStack", {
        operatingFloorId: operatingFloorId,
        storageBinGroupId: item?.storageBinGroupId,
        containerCode: item?.containerCode,
        containerRelationId: item?.containerRelationId,
      });
      return;
    }
    if (!item?.containerCode) {
      //绑定;
      navigation.navigate("BindContainerStack", {
        operatingFloorId: operatingFloorId,
        storageBinGroupName: item?.storageBinGroupName,
        storageBinGroupId: item?.storageBinGroupId,
        containerRelationId: item?.containerRelationId,
        fromPage: "CountMainListStack",
      });
      return;
    }
  };
  const [loading, setLoading] = useState(false);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <NoTabHeadBar
        titleA={"待清点"}
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
            width: w * 0.8,
            height: h * 0.5,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {!loading ? (
        <FlatList
          style={{
            height: h * 0.75,
            width: w * 0.94,
            marginTop: 5,
          }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          scrollEventThrottle={10}
          data={stashArray}
          renderItem={({ item, index }) => (
            <GoodsPositionDetailCard
              marginTop={15}
              item1_left={
                <Text style={{ fontSize: 18, color: "#004D92" }}>
                  {item?.storageBinGroupName}
                </Text>
              }
              item2_left={
                <Text style={{ fontSize: 15 }}>
                  {item?.containerCode == ""
                    ? "未绑定容器"
                    : `已绑容器:${item?.containerCode}`}
                </Text>
              }
              item2_right={
                <Text style={{ fontSize: 15, color: "#004D92" }}>
                  {item?.containerCode ? "去封箱" : "去绑箱"}
                </Text>
              }
              onPress={() => onNav(item)}
            ></GoodsPositionDetailCard>
          )}
          keyExtractor={(item, index) => index}
        ></FlatList>
      ) : null}
      {!loading ? (
        <CustomButton
          title="开始清点"
          titleColor="white"
          fontSize={18}
          width={w * 0.9}
          height={50}
          marginTop={10}
          backgroundColor="#004D92"
          borderRadius={2.5}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onConfirm}
        />
      ) : null}
    </View>
  );
}
