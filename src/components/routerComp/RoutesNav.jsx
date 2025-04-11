import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { containStackRoutes } from "src/router/index";
import HomeTabRoutes from "./HomeTabsRoutes";
import Login from "src/screens/loginStack/Login";

const Stack = createStackNavigator();
const RoutesNav = () => {
  const [initPage, setInitPage] = useState();
  //case:1程序重新启动时登陆过期检查，如果存在且没有过期，将初始页面设置HOME；否则初始页设置为登陆页用户进行登陆;
  return (
    <NavigationContainer>
      {true && (
        <Stack.Navigator initialRouteName={initPage}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ header: () => null, title: "登陆" }}
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
