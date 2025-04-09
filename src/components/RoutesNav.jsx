import React, { useState, useEffect, useRef, useContext } from "react";
import { AppState, ToastAndroid } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { containStackRoutes } from "src/router/index";
import HomeTabRoutes from "./HomeTabsRoutes";
import Login from "src/screens/loginStack/Login";
import chooseStashStack from "../screens/chooseStashStack/ChooseStashStack";
import BackButton from "./BackButton";
import getAsyncStorage from "src/functions/getAsyncStorage";
import { ContentContext } from "src/context/ContextProvider";
import fetchDataAms from "src/api/fetchDataAms";

const Stack = createStackNavigator();
const RoutesNav = () => {
  const [bool, setBool] = useState(false);
  const [initPage, setInitPage] = useState();
  const { ctxState, dispatch } = useContext(ContentContext);
  const navigationRef = useRef(null);
  const onCheckToken = async (res) => {
    const response = await fetchDataAms({
      path: "/api/at-ams-api/security/checkToken",
      method: "POST",
      header: { token: `Bearer ${res.userInfo.token}` },
      bodyParams: {
        token: `${res.userInfo.token}`,
      },
    });
    // console.log("token检查", response);
    return response;
  };

  const refreshToken = async () => {
    const refresh = await fetchDataAms({
      path: "/api/at-ams-api/security/refreshToken",
      method: "POST",
      header: { token: `Bearer ${res.userInfo.refreshToken}` },
      bodyParams: {
        clientId: "admin-app",
        refreshToken: res.userInfo.refreshToken,
        token: res.userInfo.token,
      },
    });
    // console.log("刷新TOKEN", refresh);
    if (refresh.code == 200) {
      const userMeta = {
        ...ctxState.userInfo,
        token: refresh.data.data.token,
        refreshToken: refresh.data.data.refreshToken,
      };
      dispatch({ type: "updateUserInfo", payload: userMeta });
    } else {
      ToastAndroid.show("登陆过期，请重新登陆", ToastAndroid.SHORT);
      navigationRef.current.navigate("Login");
    }
  };
  //case:1程序重新启动时登陆过期检查，如果存在且没有过期，将初始页面设置为选择仓库；否则初始页设置为登陆页用户进行登陆;
  useEffect(() => {
    setBool(false);
    //初始路由视图拦截，初始化JS线程代码优先执行;
    const fetchLocalStorage = async () => {
      const storageUserInfo = await getAsyncStorage("userInfo");
      //case:1.1第一次安装应用从未登陆过数据全部为空;
      if (!storageUserInfo) {
        setInitPage("Login");
        setBool(true);
        return;
      }
      //case:1.2用户登陆但未选择仓库直接退出应用,无仓库数据,下次进入程序将检验token并跳转到选择仓库页面;
      if (
        storageUserInfo !== undefined &&
        storageUserInfo.userInfo &&
        !storageUserInfo.optSet
      ) {
        const response = await onCheckToken(storageUserInfo);
        if (response && response.code == 200) {
          //当历史Token检查通过时/重新派发storage数据到临时缓存context;
          dispatch({
            type: "updateUserInfo",
            payload: storageUserInfo.userInfo,
          });
          setInitPage("ChooseStashStack");
          setBool(true);
        } else {
          refreshToken();
        }
        return;
      }
      //case:1.3用户选择了仓库，退出应用，下次进入程序将跳转到首页直接开始作业;
      if (
        storageUserInfo !== undefined &&
        storageUserInfo.userInfo &&
        storageUserInfo.optSet
      ) {
        const response = await onCheckToken(storageUserInfo);
        if (response && response.code == 200) {
          //当历史Token检查通过时/重新派发storage数据到临时缓存context;
          dispatch({
            type: "updateUserInfo",
            payload: storageUserInfo.userInfo,
          });
          dispatch({ type: "updateOptSet", payload: storageUserInfo.optSet });
          setInitPage("HomeTabs");
          setBool(true);
        } else {
          refreshToken();
        }
      } else {
        // console.log("未曾登陆过或历史Token数据异常,定向到LOGIN页重新登陆;");
        setInitPage("Login");
        setBool(true);
      }
    };
    fetchLocalStorage();
  }, []);

  //case:2每次后台进入前台程序时登陆时效过期检查;
  const [appState, setAppState] = useState(AppState.currentState);
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState === "background" && nextAppState === "active") {
        const fetchLocalStorage = async () => {
          const res = await getAsyncStorage("userInfo");
          if (res && res.userInfo) {
            const response = await onCheckToken(res);
            if (response && response.code !== 200) {
              refreshToken();
            } else return;
          }
        };
        fetchLocalStorage();
      } else if (appState === "active" && nextAppState === "background") {
      }
      setAppState(nextAppState);
    };
    const appStateChangeSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      appStateChangeSubscription.remove();
    };
  }, [appState]);
  return (
    <NavigationContainer ref={navigationRef}>
      {bool && (
        <Stack.Navigator initialRouteName={initPage}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ header: () => null, title: "登陆" }}
          />
          <Stack.Screen
            name="ChooseStashStack"
            component={chooseStashStack}
            options={{ header: () => null, title: "选择仓库" }}
          />
          <Stack.Screen
            name="HomeTabs"
            component={HomeTabRoutes}
            options={{ header: () => null, title: "首页" }}
          />
          {containStackRoutes.map((item) => {
            return (
              <Stack.Screen
                key={item.name}
                name={item.name}
                options={({ navigation }) => ({
                  ...item.option,
                  headerStyle: {
                    backgroundColor: "#004D92",
                    elevation: 0,
                  },
                  headerTitleAlign: "center",
                  headerTintColor: "#fff",
                  headerLeft: () => <BackButton />,
                })}
                component={item.component}
              />
            );
          })}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
export default RoutesNav;
