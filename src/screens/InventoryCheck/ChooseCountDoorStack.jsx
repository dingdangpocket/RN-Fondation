import {
  View,
  ToastAndroid,
  Image,
  Text,
  FlatList,
} from "react-native";
import Cell from "src/components/Cell";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useContext } from "react";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import NoTabHeadBar from "src/components/NoTabHeadBar";

//选择清点台；
export default function ChooseCountDoorStack() {
  const { ctxState } = useContext(ContentContext);
  const [Width, Height] = useWindow();
  // console.log("props", props.route.params);
  const navigation = useNavigation();
  const [stashArray, setStashArray] = useState([]);
  const onPress = (operatingFloorId) => {
    navigation.navigate("CountMainListStack", {
      operatingFloorId: operatingFloorId,
    });
  };
  useEffect(() => {
    // 使用示例
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: "/inbound/check/getOperatingFloors",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
      });
      console.log("清点台", response);
      if (response.code == 200) {
        setStashArray(response?.data);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  }, []);
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"选择清点台"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <FlatList
        style={{
          height: Height * 0.9,
          width: Width * 0.98,
          marginTop: 5,
          padding: 2,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={10}
        data={stashArray}
        renderItem={({ item }) => (
          <Cell
            marginTop={6}
            name={item.operatingFloorCode}
            onPress={() => onPress(item?.operatingFloorId)}
            right={
              <Image
                source={require("src/static/blackLeftArrow.png")}
                style={{ width: 20, height: 20, marginRight: 20 }}
              ></Image>
            }
          />
        )}
        keyExtractor={(item, index) => index}
      ></FlatList>
    </View>
  );
}
