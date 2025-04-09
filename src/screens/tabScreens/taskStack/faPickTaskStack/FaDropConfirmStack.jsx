import React, { useState, useContext, useEffect } from "react";
import { Text, View, ToastAndroid } from "react-native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import CustomButton from "src/components/CustomButton";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import { h, w } from "src/functions/responsive";
const CENTERSTYLE = {
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
};
const FaDropConfirmStack = ({ route }) => {
  const navigation = useNavigation();
  const { storageArea, groupId, taskId } = route.params;
  const [result, setResult] = useState("");
  const { ctxState } = useContext(ContentContext);
  const [areas, setAreas] = useState();
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      const getArea = async () => {
        const response = await fetchData({
          path: `/task/groupPicking/getPlacementStorageArea`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            taskId: taskId,
          },
        });
        console.log("区域详情", response);
        if (response.code == 200) {
          setAreas("");
          setAreas(response?.data);
          setResult("");
          return;
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
        }
      };
      getArea();
    }
  }, [isFocused]);

  const onTextChange = (res) => {
    setResult(res);
  };
  const onCancle = () => {
    setResult("");
  };

  //自动落放;
  useEffect(() => {
    if (!result.startsWith(SCAN_TAG)) return;
    if (result) {
      onSubmit();
      return;
    }
  }, [result]);

  //直接提交;
  const onSubmit = async () => {
    // console.log(result, faTaskDetail, storageArea);
    if (!result) {
      ToastAndroid.show("请扫描落放对货位编码", ToastAndroid.SHORT);
      return;
    }
    if (!result || !groupId || !storageArea) return;
    const response = await fetchData({
      path: `/task/groupPicking/placement`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        /**
         * 组波id
         */
        taskId: taskId,
        /**
         * 落放位编码
         */
        storageBinCode: result.startsWith(SCAN_TAG) ? result.slice(1) : result,
        //区域编码
        storageAreaType: areas.areaCode,
      },
    });
    // console.log("落放结果", response);
    if (response.code == 200) {
      ToastAndroid.show("落放成功", ToastAndroid.SHORT);
      navigation.goBack();
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

  return (
    <View>
      <NoTabHeadBar
        titleA={"选择落放位"}
        icon={<Text style={{ color: "white", marginRight: 50 }}></Text>}
      ></NoTabHeadBar>
      <InputBar
        value={result}
        placeholder={"扫描或输入落放位号"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="gray" />}
        onIcon1Fun={onCancle}
        onTextChange={onTextChange}
        inputColor={"white"}
      ></InputBar>
      <View
        style={{
          width: "100%",
          ...CENTERSTYLE,
        }}
      >
        <View
          style={{
            height: 65,
            width: "90%",
            backgroundColor: "#FFE8D3",
            justifyContent: "center",
            alignItems: "flex-start",
            display: "flex",
            position: "relative",
            padding: 10,
          }}
        >
          {areas && (
            <Text style={{ color: "#D1731D", fontSize: 16 }}>
              落放货区:{areas.noticeText}
            </Text>
          )}
          {areas?.source == 2 ? (
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
        {areas && (
          <CustomButton
            title="确认落放"
            titleColor="white"
            fontSize={18}
            width={w * 0.9}
            height={50}
            backgroundColor="#004D92"
            borderRadius={2.5}
            marginTop={h * 0.6}
            align={{
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onSubmit}
          />
        )}
      </View>
    </View>
  );
};
export default FaDropConfirmStack;
