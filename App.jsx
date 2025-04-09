/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
// import codePush from "react-native-code-push";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import RoutesNav from "./src/components/RoutesNav";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  // useEffect(() => {
  //   checkForUpdate();
  // }, []);
  // const checkForUpdate = async () => {
  //   codePush.checkForUpdate().then(async (update) => {
  //     if (update) {
  //       // 如果有更新，则弹窗询问用户是否下载
  //       Alert.alert(
  //         "更新提示",
  //         "是否需要更新呢?",
  //         [
  //           { text: "Later", style: "cancel" },
  //           { text: "Update", onPress: () => downloadUpdate(update) },
  //         ],
  //         { cancelable: false }
  //       );
  //     }
  //   });
  // };
  // const downloadUpdate = (update) => {
  //   update
  //     .download(async (progress) => {
  //       console.log(
  //         `Downloaded ${progress.receivedBytes} of${progress.totalBytes}`
  //       );
  //     })
  //     .then((bundle) => {
  //       // 安装更新
  //       bundle.install(codePush.InstallMode.ON_NEXT_RESUME);
  //     })
  //     .catch((error) => {
  //       console.error("Error downloading update", error);
  //     });
  // };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoutesNav />
    </SafeAreaView>
  );
};
export default App;
