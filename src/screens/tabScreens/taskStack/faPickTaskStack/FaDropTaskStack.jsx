import React, { useState, useContext, useEffect } from "react";
import {
  Text,
  View,
  TouchableNativeFeedback,
  ToastAndroid,
} from "react-native";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
const CENTERSTYLE = {
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
};
const FaDropTaskStack = ({ route }) => {
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const { faTaskDetail } = route.params;
  const [storageAreas, setStorageAreas] = useState();
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      const getTaskDetail = async () => {
        const response = await fetchData({
          path: `/task/groupPicking/getStorageArea`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            groupId: faTaskDetail?.groupId,
          },
        });
        console.log("货区详情", response);
        if (response.code == 200) {
          setStorageAreas(response?.data?.storageArea);
          return;
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      getTaskDetail();
    }
  }, [isFocused]);

  const onPress = (storageArea) => {
    // console.log("storageArea", storageArea);
    navigation.navigate("FaDropConfirmStack", {
      storageArea: storageArea,
      groupId: faTaskDetail.groupId,
      taskId: storageArea.taskId,
      faTaskDetail: faTaskDetail,
    });
  };

  useEffect(() => {
    //5,6是终态,如果全部是终态就返回任务列表;
    if (storageAreas) {
      const isAllFiveOrSix = storageAreas.every(
        (item) => item.noteStatus === 5 || item.noteStatus === 6
      );
      if (isAllFiveOrSix) {
        navigation.navigate("TasksTab", { fromPage: "FaDropTaskStack" });
        return;
      } else {
        return;
      }
    }
  }, [isFocused, storageAreas]);

  return (
    <View>
      <NoTabHeadBar
        titleA={"落放任务"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View
        style={{
          ...CENTERSTYLE,
        }}
      >
        <View
          style={{
            width: "90%",
            marginTop: 10,
            height: 240,
            flexDirection: "row",
            flexWrap: "wrap",
            backgroundColor: "white",
            ...CENTERSTYLE,
          }}
        >
          {storageAreas &&
            storageAreas.map((item, index) => {
              return (
                <View key={index}>
                  {/* 落放任务:5已完成/6已取消 */}
                  {item?.noteStatus == 5 || item?.noteStatus == 6 ? (
                    <TouchableNativeFeedback key={index}>
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          backgroundColor: "#EBF6FF",
                          margin: 10,
                          ...CENTERSTYLE,
                          position: "relative", // 设置为相对定位，为角标提供定位上下文
                        }}
                      >
                        <Text>{item?.noteStatusText}</Text>
                      </View>
                    </TouchableNativeFeedback>
                  ) : (
                    <TouchableNativeFeedback
                      key={index}
                      onPress={() => onPress(item)}
                    >
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          backgroundColor: "#EBF6FF",
                          margin: 10,
                          ...CENTERSTYLE,
                          position: "relative",
                        }}
                      >
                        <Text>{item.storageAreaTypeText}</Text>
                        {item?.source == 2 ? (
                          <View
                            style={{
                              position: "absolute", // 绝对定位
                              top: 0, // 角标距离顶部的距离
                              left: 0, // 角标距离右侧的距离
                              backgroundColor: "red", // 角标的背景颜色
                              padding: 5, // 角标的内边距
                              minWidth: 18, // 角标的宽度
                              textAlign: "center", // 角标文字居中
                              borderTopRightRadius: 10,
                              borderBottomEndRadius: 10,
                            }}
                          >
                            <Text style={{ color: "white", fontSize: 8 }}>
                              预拣
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableNativeFeedback>
                  )}
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};
export default FaDropTaskStack;
