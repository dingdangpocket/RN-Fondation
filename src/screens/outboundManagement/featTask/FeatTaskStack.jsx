import {
  View,
  ToastAndroid,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import useWindow from "src/hooks/useWindow";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";

const CENTERSTYLE = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

//领取领料任务
const FeatTaskStack = ({ route }) => {
  const { fromPage } = route.params;
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [refreshing, setRefreshing] = useState(false);
  const [task, setTask] = useState();
  const [Width, Height] = useWindow();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // console.log("formPage", fromPage);
      if (fromPage == "FeatTaskDropStack") {
        setTask("");
        return;
      }
    }
  }, [isFocused]);
  const getTask = async () => {
    const response = await fetchData({
      path: `/task/orderPicking/getTask`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskType: 2030107,
      },
    });
    console.log("领料任务表", response);
    if (response.code == 200) {
      setTask({ ...response.data });
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
      setTask("");
    }
  };
  const onRefresh = () => {
    getTask();
  };
  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  const onNav = (task) => {
    navigation.navigate("FeatTaskListStack", { taskDetail: task });
  };
  return (
    <View>
      <View
        style={{
          ...CENTERSTYLE,
        }}
      >
        <NoTabHeadBar
          titleA={"领料任务"}
          icon={
            <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
          }
        ></NoTabHeadBar>
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={{
            width: "95%",
            height: "85%",
            marginTop: 10,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            style={{
              ...CENTERSTYLE,
            }}
          >
            {task ? (
              <GoodsPositionDetailCard
                width={"100%"}
                marginTop={10}
                onPress={() => onNav(task)}
                item1_left={
                  <Content
                    color={"#004D92"}
                    fontSize={17}
                    value={`${task?.taskTypeText ?? "—"}`}
                  />
                }
                item1_right={
                  <Content
                    color={"#004D92"}
                    fontSize={17}
                    value={`${task?.statusName ?? ""}`}
                  />
                }
                item2_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={15}
                    value={`原始单号:${task?.originalNoteNo ?? "-"}`}
                  />
                }
                item3_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={15}
                    value={`任务单号: ${task?.taskNo ?? "-"}`}
                  />
                }
                item4_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={15}
                    value={`申请部门: ${
                      task?.customerDepartment.length <= 24
                        ? task?.customerDepartment
                        : task?.customerDepartment.substring(0, 24) + "..." ??
                          "-"
                    }`}
                  />
                }
                item5_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={15}
                    value={`创建时间: ${task?.createTime ?? ""}`}
                  />
                }
              ></GoodsPositionDetailCard>
            ) : (
              <View
                style={{
                  marginTop: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: Width,
                  height: Height * 0.05,
                }}
              >
                <Text style={{ color: "rgb(180,180,180)" }}>下拉刷新任务</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
export default FeatTaskStack;
