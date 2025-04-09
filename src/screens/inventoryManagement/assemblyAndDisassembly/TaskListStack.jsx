import {
  View,
  ToastAndroid,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { rpx2dp, h, w } from "src/functions/responsive";

//01组装拆卸任务；
export default function TaskListStack() {
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [stashArray, setStashArray] = useState([]);

  const getList = async () => {
    const response = await fetchData({
      path: "/inside/packagingDetach/listPackagingDetachNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    console.log("拆卸任务列表", response);
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
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      //必须确保当前页面是激活状态！
      getList();
    }
  }, [isFocused]);

  const onNav = (x) => {
    if (x.noteStatus == 89 || x.noteStatus == 99) {
      // ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
      return;
    }
    if (x.noteStatus == 25) {
      navigation.navigate("ItemListStack", {
        packagingDetachNoteId: x.packagingDetachNoteId,
      });
      return;
    }
    if (x.noteStatus == 15) {
      navigation.navigate("ContainerPositionListStack", { item: x });
      return;
    }
  };
  return (
    <SafeAreaView>
      <NoTabHeadBar
        titleA={"组装拆卸"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: w,
        }}
      >
        <FlatList
          style={{
            height: h * 0.9,
            width: w,
            marginTop: 5,
          }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          scrollEventThrottle={10}
          data={stashArray}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onNav(item)}>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "white",
                  height: rpx2dp(100, false),
                  width: "100%",
                  padding: 10,
                  marginBottom: 1,
                  position: "relative",
                }}
              >
                <View
                  style={{
                    position: "absolute", // 绝对定位
                    top: 10, // 角标距离顶部的距离
                    left: 0,
                    backgroundColor:
                      item.noteTypeText == "组装" ? "#006DCF1F" : "#FFF7EA", // 角标的背景颜色
                    padding: 5, // 角标的内边距
                    borderRightRadius: 10, // 角标的圆角
                    minWidth: 35, // 角标的宽度
                    textAlign: "center", // 角标文字居中
                    borderTopRightRadius: 10,
                    borderBottomEndRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color:
                        item.noteTypeText == "组装" ? "#006DCF" : "#B48032",
                      fontSize: 9,
                    }}
                  >
                    {item.noteTypeText}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 15 }}>
                    {item.packagingDetachNoteNo}
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#004D92",
                        marginRight: 5,
                      }}
                    ></View>
                    <Text style={{ fontSize: 15 }}>
                      {item.noteStatusText} {">"}
                    </Text>
                  </View>
                </View>
                <Text>创建时间 {item.createOn}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index}
        ></FlatList>
      </View>
    </SafeAreaView>
  );
}
