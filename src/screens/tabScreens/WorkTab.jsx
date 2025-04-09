import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import UesrMeta from "src/components/UesrMeta";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import routerAuth from "src/functions/routerAuth";
import { ContentContext } from "src/context/ContextProvider";
import { Tag } from "src/icons/index";
import { rpx2dp } from "src/functions/responsive";
//功能模块配置表
import { func } from "src/screens/tabScreens/taskStack/incoConfig";
const centerStyle = {
  alignItems: "center",
  justifyContent: "center",
};
const WorkTab = () => {
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [iconAuth, setIconAuth] = useState();
  //TAB即时响应;
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const TIMER = setTimeout(() => {
      setIsVisible(true);
    }, 0);
    return () => clearTimeout(TIMER);
  }, []);
  const noAlert = () => {
    Alert.alert(
      "提示",
      "您暂无权限访问该业务",
      [{ text: "确定", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  };
  useEffect(() => {
    //从context中提取用户的模块权限;
    if (!ctxState) return;
    if (!ctxState?.userInfo) return;
    setIconAuth([...ctxState?.userInfo?.authMap]);
  }, [ctxState]);
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <UesrMeta
        userName={ctxState?.userInfo?.userName}
        onPress={() => navigation.navigate("ChooseStashStack")}
        rightText={"重选仓库"}
        storage={
          ctxState?.userInfo?.storages?.find(
            (x) => x.storageId == ctxState?.optSet?.curStorageId
          )?.storageName ?? "——"
        }
      />
      {isVisible ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={6}
          data={func}
          keyExtractor={(section) => section.title}
          renderItem={({ item }) => (
            <View key={item.id}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <View
                  style={{
                    width: rpx2dp(30),
                    height: rpx2dp(55, false),
                    display: "flex",
                    flexDirection: "row",
                    ...centerStyle,
                  }}
                >
                  <Tag width="35%" height="35%" />
                </View>
                <View>
                  <Text style={{ fontSize: rpx2dp(20), fontWeight: "bold" }}>
                    {item.title}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginBottom: rpx2dp(30, false),
                }}
              >
                {item.funcs.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      margin: rpx2dp(15),
                      alignItems: "center",
                      width: rpx2dp(75),
                      height: rpx2dp(110, false),
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        routerAuth(iconAuth, item.auth)
                          ? navigation.navigate(item.navStack, "Params")
                          : noAlert();
                      }}
                    >
                      <Image
                        resizeMode="contain"
                        source={item.url}
                        style={{
                          width: rpx2dp(65),
                          height: rpx2dp(65, false),
                          margin: rpx2dp(10),
                          display: "flex",
                          ...centerStyle,
                        }}
                      />
                    </TouchableWithoutFeedback>
                    <Text style={{ fontSize: rpx2dp(14) }}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      ) : (
        <View
          style={{
            marginTop: rpx2dp(50, false),
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      )}
    </View>
  );
};
export default React.memo(WorkTab);
