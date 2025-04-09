import { View, Text, ToastAndroid } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";

const FeatTaskDropStack = ({ route }) => {
  const { taskDetail } = route.params;
  // console.log("taskDetail", taskDetail);
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const { ctxState } = useContext(ContentContext);
  const [position, setPosition] = useState("");
  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      //获取落放位;
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/task/orderPicking/getPlacementStorageArea",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { taskId: taskDetail.taskId },
        });
        // console.log("推荐落放位", response);
        if (response.code == 200) {
          setPosition(response.data);
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //自动落放;
  useEffect(() => {
    if (!scanResult.startsWith(SCAN_TAG)) return;
    if (scanResult) {
      onDrop();
      return;
    }
  }, [scanResult]);

  const onDrop = () => {
    if (!scanResult) {
      ToastAndroid.show("请扫描货位后提交", ToastAndroid.SHORT);
      return;
    }
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: "/task/orderPicking/placement",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          storageAreaType: position.areaCode,
          taskId: taskDetail.taskId,
          storageBinCode: scanResult.startsWith(SCAN_TAG)
            ? scanResult.slice(1)
            : scanResult,
        },
      });
      // console.log("落放结果", response);
      if (response.code == 200) {
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        navigation.navigate("FeatTaskStack", { fromPage: "FeatTaskDropStack" });
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
    asyncWrapper();
  };

  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"落放任务"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请输入或扫描落放位号"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
      ></InputBar>
      {position && (
        <View
          style={{
            backgroundColor: "red",
            width: "90%",
            height: 120,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FFE8D3",
            marginTop: 10,
            padding: 10,
            position: "relative", // 设置为相对定位，为角标提供定位上下文
          }}
        >
          <Text style={{ fontSize: 16, color: "#D1731D" }}>
            落放货区:{position.noticeText}
          </Text>
          <Text style={{ fontSize: 16, color: "#D1731D" }}>
            申请部门:{position.customerDepartment}
          </Text>
          {position.source == 2 ? (
            <View
              style={{
                position: "absolute", // 绝对定位
                top: 0, // 角标距离顶部的距离
                left: 0, // 角标距离右侧的距离
                backgroundColor: "red", // 角标的背景颜色
                padding: 5, // 角标的内边距
                minWidth: 20, // 角标的宽度
                textAlign: "center", // 角标文字居中
                borderTopRightRadius: 10,
                borderBottomEndRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 8 }}>预拣</Text>
            </View>
          ) : null}
        </View>
      )}
      {position && (
        <View
          style={{
            backgroundColor: "rgb(245,245,245)",
            width: "90%",
            height: 55,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#65DB3B",
            borderStyle: "dotted",
            marginTop: 10,
            padding: 10,
          }}
        >
          <Text style={{ fontSize: 16, color: "#279700" }}>{`推荐落放位编号:${
            position?.storageBinCode[0]
              ? position?.storageBinCode[0]
              : "暂无推荐货位"
          }`}</Text>
        </View>
      )}
      <CustomButton
        title="确认落放"
        titleColor="white"
        fontSize={18}
        width={Width * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={Height * 0.5}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onDrop}
      />
    </View>
  );
};
export default FeatTaskDropStack;
