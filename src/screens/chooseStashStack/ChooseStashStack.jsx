/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableNativeFeedback,
  ToastAndroid,
  Linking,
  Alert,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { CellIcon } from "src/icons/index";
const Width = Dimensions.get("window").width;
import UesrMeta from "src/components/UesrMeta";
import { ContentContext } from "src/context/ContextProvider";
import TabBar from "./Comp/TabBar";
import delAsyncStorageItem from "src/functions/delAsyncStorageItem";
import CustomButton from "src/components/CustomButton";
import fetchData from "src/api/fetchData";
import { KEY, VERSION } from "src/api/apiConfig";
const ChooseStashStack = () => {
  const navigation = useNavigation();
  const { ctxState, dispatch } = useContext(ContentContext);
  const Nav = (id) => {
    dispatch({ type: "updateOptSet", payload: { curStorageId: id } });
    navigation.navigate("HomeTabs", { fromPage: "ChooseStashStack" });
  };
  const onLoginOut = async () => {
    if (!ctxState?.userInfo?.token) return;
    dispatch({ type: "updateOptSet", payload: "" });
    dispatch({ type: "updateUserInfo", payload: "" });
    delAsyncStorageItem("userInfo");
    ToastAndroid.show("登出成功", ToastAndroid.SHORT);
    navigation.navigate("Login");
  };
  const Cell = ({ name, onPress }) => {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        activeOpacity={0.4}
        delayPressIn={2}
        delayPressOut={5}
      >
        <View
          style={{
            width: Width,
            height: 70,
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginLeft: 15,
            }}
          >
            {name}
          </Text>
          <CellIcon width="20%" height="20%" />
        </View>
      </TouchableNativeFeedback>
    );
  };
  const isFocused = useIsFocused();
  const checkVersion = async () => {
    const response = await fetchData({
      path: `/base/config/getSettingByKey?key=${KEY}`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (response.code == 200) {
      const url = response?.data?.value;
      if (url) {
        if (JSON.parse(url).version == VERSION) {
          return;
        }
        if (JSON.parse(url).version > VERSION) {
          Alert.alert(
            "检查有新版本更新",
            `版本号:${JSON.parse(url).version}`,
            [
              {
                text: "关闭退出",
                onPress: () => navigation.navigate("Login"),
              },
              {
                text: "下载更新",
                onPress: () => Linking.openURL(JSON.parse(url).url),
              },
            ],
            { cancelable: false }
          );
          console.log(JSON.parse(url).version, VERSION);
        }
        return;
      }
    }
  };
  useEffect(() => {
    if (isFocused) {
      checkVersion();
    }
  }, [isFocused]);
  const onUpdate = async () => {
    const response = await fetchData({
      path: `/base/config/getSettingByKey?key=${KEY}`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (response.code == 200) {
      const url = response?.data?.value;
      if (url) {
        if (JSON.parse(url).version == VERSION) {
          ToastAndroid.show("当前版本是最新版本", ToastAndroid.SHORT);
          return;
        }
        if (JSON.parse(url).version > VERSION) {
          Alert.alert(
            "检查有新版本更新",
            `版本号:${JSON.parse(url).version}`,
            [
              {
                text: "关闭退出",
                onPress: () => navigation.navigate("Login"),
              },
              {
                text: "下载更新",
                onPress: () => Linking.openURL(JSON.parse(url).url),
              },
            ],
            { cancelable: false }
          );
          console.log(JSON.parse(url).version, VERSION);
        }
        return;
      }
    }
  };
  return (
    <>
      <TabBar titleA={"选择仓库"}></TabBar>
      <UesrMeta
        userName={ctxState?.userInfo?.userName}
        avator={
          ctxState?.userInfo?.avatarUrl ??
          "https://img2.baidu.com/it/u=1241008353,1619926618&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {ctxState?.userInfo?.storages ? (
          ctxState?.userInfo?.storages?.map((item, index) => (
            <Cell
              key={index}
              name={item.storageName}
              onPress={() => Nav(item.storageId)}
            />
          ))
        ) : (
          <Text>账号暂无绑定仓库</Text>
        )}
      </ScrollView>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CustomButton
          title={`检查更新-${VERSION}`}
          titleColor="#004D92"
          fontSize={16}
          width={300}
          height={30}
          borderRadius={2.5}
          marginTop={5}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onUpdate}
        />
      </View>
      <CustomButton
        title="退出登录"
        titleColor="white"
        fontSize={18}
        height={60}
        marginTop={5}
        backgroundColor="#004D92"
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onLoginOut}
      />
    </>
  );
};
export default ChooseStashStack;
