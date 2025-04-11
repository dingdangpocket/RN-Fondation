/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TasksTab from "src/screens/tabScreens/TasksTab";
import WorkTab from "src/screens/tabScreens/WorkTab";
import { TouchableOpacity } from "react-native";
import { WorkTabIcon } from "src/icons";
const Tab = createBottomTabNavigator();
const IconSet = {
  ACTIVE_WorkTab: <WorkTabIcon width="68%" height="68%" color="#1296db" />,
  UNACTIVE_WorkTab: <WorkTabIcon width="68%" height="68%" color="#6b6a62" />,
  ACTIVE_TasksTab: <WorkTabIcon width="63%" height="63%" color="#1296db" />,
  UNACTIVE_TasksTab: <WorkTabIcon width="63%" height="63%" color="#6b6a62" />,
};
const HomeTabsRoutes = () => {
  const HomeTabRoutesConfig = [
    {
      name: "TasksTab",
      component: TasksTab,
      option: { title: "任务列表" },
      tabBarBadge: null,
    },
    {
      name: "WorkTab",
      component: WorkTab,
      option: { title: "工作台" },
      tabBarBadge: null,
    },
  ];
  return (
    <Tab.Navigator
      initialRouteName="WorkTab"
      detachInactiveScreens={false}
      tabBarOptions={{
        activeTintColor: "black",
        inactiveTintColor: "#6b6a62",
        labelStyle: { fontSize: 10 },
        style: { height: 55 },
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          return focused
            ? IconSet["ACTIVE_" + route.name]
            : IconSet["UNACTIVE_" + route.name];
        },
        tabBarButton: (props) => (
          <TouchableOpacity activeOpacity={0.6} {...props} />
        ),
      })}
    >
      {HomeTabRoutesConfig.map((item) => {
        return (
          <Tab.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.option.title,
              tabBarBadge: item.tabBarBadge,
              tabBarBadgeStyle: {
                maxWidth: 20,
                maxHeight: 16,
                fontSize: 9,
                lineHeight: 15,
                backgroundColor: "rgba(255,51,0,0.9)",
              },
            }}
            component={item.component}
            initialParams={{ fromPage: "" }} //初始参数
          />
        );
      })}
    </Tab.Navigator>
  );
};
export default HomeTabsRoutes;
