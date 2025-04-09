/* eslint-disable curly */
/* eslint-disable eqeqeq */
/* eslint-disable no-dupe-keys */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from "react";

import LoginInput from "src/components/LoginInput";
import {
  View,
  Text,
  Dimensions,
  PermissionsAndroid,
  ImageBackground,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
// import codePush from "react-native-code-push";
import BleManager from "react-native-ble-manager";
import { useState, useContext } from "react";
import CustomButton from "src/components/CustomButton";
import { LogoIcon, UncheckIcon, CheckIcon, CancleIcon } from "src/icons/index";
import { useNavigation } from "@react-navigation/native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { ContentContext } from "src/context/ContextProvider";
import delAsyncStorageItem from "src/functions/delAsyncStorageItem";
import setAsyncStorage from "src/functions/setAsyncStorage";
import getAsyncStorage from "src/functions/getAsyncStorage";
import fetchDataAms from "src/api/fetchDataAms";
import fetchData from "src/api/fetchData";
import { setNavigation, setToastAndroid } from "src/functions/tool";
import { VERSION } from "src/api/apiConfig";

const Login = () => {
  const { width } = Dimensions.get("window");
  const { dispatch, ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const requestPermission = async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    // await PermissionsAndroid.request(
    //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    // );
  };
  requestPermission();
  // 设置全局变量navigation、ToastAndroid
  useEffect(() => {
    setNavigation(navigation);
    setToastAndroid(ToastAndroid);
  }, [navigation]);

  const checkBluetoothState = async () => {
    BleManager.enableBluetooth()
      .then(() => {
        console.log("The bluetooth is already enabled or the user confirm");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    checkBluetoothState();
  }, []);
  //热部署CODEPUSH;
  // const checkForUpdate = async () => {
  //   codePush.checkForUpdate().then(async (update) => {
  //     console.log("update", update);
  //     setLog(JSON.stringify(update));
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
  //       bundle.install(codePush.InstallMode.IMMEDIATE);
  //     })
  //     .catch((error) => {
  //       console.error("Error downloading update", error);
  //     });
  // };
  //fetchDataAms为业务方的接口；
  //fetchData为非业务方封装的接口；
  //此处登录信息是由多个接口获得拼合的;
  const onLogin = async () => {
    if (!password || !account) {
      ToastAndroid.show("请输入账号密码后登录", ToastAndroid.SHORT);
      return;
    }
    //(1)
    const tokenInfo = await fetchDataAms({
      path: "/api/at-ams-api/security/login",
      method: "POST",
      bodyParams: {
        loginType: 1,
        username: account,
        password: password,
        clientId: "admin-app",
      },
    });
    console.log("tokenInfo", tokenInfo);
    if (tokenInfo.data.code == 200) {
      //(2)
      const userInfo = await fetchDataAms({
        path: "/api/at-ums-api/user/getUserInfo",
        method: "GET",
        header: {
          token: `Bearer ${tokenInfo?.data?.data?.token}`,
        },
      });
      // console.log("userInfo", userInfo);
      if (userInfo.code == 200) {
        //(3)
        const authInfo = await fetchDataAms({
          path: "/api/at-ams-api/userMenu/tree",
          method: "POST",
          header: {
            token: `Bearer ${tokenInfo?.data?.data?.token}`,
          },
          bodyParams: {
            hidden: false,
            moduleId: 1724742993,
            roleIds: [],
          },
        });
        // console.log(authInfo);
        const authArray = [];
        if (authInfo.code == 200) {
          authInfo.data.map((x) => {
            x.children.map((k) => {
              if (k.existLimit == 1) {
                authArray.push(k.icon);
              }
            });
          });
        }
        if (tokenInfo && userInfo) {
          const storage = await fetchData({
            path: "/base/auth/listEmployeeStorageRelations",
            method: "GET",
            token: `${tokenInfo?.data?.data?.token}`,
          });
          // console.log("storage", storage);
          //🚀仓库数据todo;
          if (storage.code == 200) {
            const userMeta = {
              userId: userInfo.data.id,
              userName: userInfo.data.fullName,
              token: tokenInfo.data.data.token,
              refreshToken: tokenInfo.data.data.refreshToken,
              avatarUrl:
                "https://img0.baidu.com/it/u=3975419446,2493426273&fm=253&fmt=auto&app=120&f=PNG?w=500&h=536",
              storages: storage.data,
              authMap: authArray,
            };
            // console.log("userMeta", userMeta);
            if (userMeta) {
              ToastAndroid.show("登录成功", ToastAndroid.SHORT);
              dispatch({ type: "updateUserInfo", payload: userMeta });
              //🚀Todo将refreshToken和accessToken赋值到context中;
              if (check) {
                setAsyncStorage("loginMeta", {
                  account: account,
                  password: password,
                });
              } else {
                delAsyncStorageItem("loginMeta");
              }
              setAccount("");
              setPassword("");
              navigation.navigate("ChooseStashStack");
            } else {
              ToastAndroid.show("登陆失败", ToastAndroid.SHORT);
            }
          }
        }
      }
    } else {
      if (tokenInfo.data.code == 10401) {
        ToastAndroid.show(
          "登录失败,请检查账号密码是否正确",
          ToastAndroid.SHORT
        );
        return;
      }
    }
  };

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const onAccount = (res) => {
    setAccount(res);
    // console.log(res);
  };
  const onPassword = (res) => {
    setPassword(res);
    // console.log(res);
  };

  const cancleAccount = () => {
    setAccount("");
  };
  const canclePassword = () => {
    setPassword("");
  };

  const [check, setCheck] = useState(true);
  const remenberMe = () => {
    setCheck(!check);
  };
  const [poper, setPoper] = useState(false);
  const onFocus = () => {
    const sync = async () => {
      const res = await getAsyncStorage("loginMeta");
      if (res) setPoper(true);
    };
    sync();
  };
  const onBlur = () => {
    setPoper(false);
  };
  const getLoginMeta = async () => {
    const res = await getAsyncStorage("loginMeta");
    if (res.account && res.password) {
      setAccount(res.account);
      setPassword(res.password);
      setPoper(false);
    }
  };
  const InputTitle = (name) => {
    return (
      <View
        style={{
          display: "flex",
          justifyContent: "flex-start",
          width: width * 0.85,
        }}
      >
        <Text style={{ fontSize: 15 }}>{name}</Text>
      </View>
    );
  };
  useEffect(() => {
    const atomSymbol = `
      '         ++         ',
      '        +  +        ',
      '       +    +       ',
      '      +      +      ',
      '     +        +     ',
      '    +          +    ',
      '   +     ⚛️     +   ',
      '  +    Design    +  ',
      ' ++     +by+     ++ ',
      '  +    NieGang   +  ',
      '   +  HuangSiYu +   ',
      '    +          +    ',
      '     +        +     ',
      '      +      +      ',
      '       +    +       ',
      '        +  +        ',
      '         ++         ',
    `;
    console.log(`${atomSymbol} Design by NieGang / HuangSiYu 2024-11-29`);
  }, []);

  return (
    <ImageBackground
      source={require("src/static/back.jpg")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LogoIcon width="45%" height="45%" />
        <View
          style={{
            width: width * 0.88,
            padding: 5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: width * 0.2,
            }}
          >
            <Text style={{ fontSize: 15 }}>账号</Text>
          </View>
          {poper ? (
            <TouchableOpacity
              onPress={() => getLoginMeta()}
              style={{
                width: 150,
                height: 30,
                backgroundColor: "rgb(150,150,150)",
                padding: 5,
                display: "flex",
                borderRadius: 8,
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white" }}>使用上次登陆账户</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <LoginInput
          value={account}
          placeholder={"请输入账户号"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          onIcon1Fun={cancleAccount}
          onTextChange={onAccount}
          inputColor={"white"}
          onFocus={onFocus}
          onBlur={onBlur}
        ></LoginInput>
        {InputTitle("密码")}
        <LoginInput
          value={password}
          placeholder={"请输入账号密码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          onIcon1Fun={canclePassword}
          onTextChange={onPassword}
          inputColor={"white"}
          secureTextEntry={true}
        ></LoginInput>
        <View
          style={{
            display: "flex",
            width: width * 0.85,
            height: 25,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 10,
            marginLeft: -20,
          }}
        >
          <TouchableWithoutFeedback onPress={() => remenberMe()}>
            <View style={{ width: 40, height: 40, padding: 10 }}>
              {check ? (
                <CheckIcon width="120%" height="120%" />
              ) : (
                <UncheckIcon width="120%" height="120%" />
              )}
            </View>
          </TouchableWithoutFeedback>
          <Text>记住密码</Text>
        </View>
        <Text style={{ marginTop: 5, color: "rgb(185,185,185)" }}>
          AppVersion {VERSION}
        </Text>
        <CustomButton
          title="登录"
          titleColor="white"
          fontSize={18}
          width={width * 0.85}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={50}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onLogin}
        />
      </View>
    </ImageBackground>
  );
};
export default Login;
