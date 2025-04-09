import { View, Text, ToastAndroid } from "react-native";
import React, { useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "src/components/CustomButton";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import { CancleIcon, ScanIcon } from "src/icons/index";
import Input from "src/components/Input";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { h, w } from "src/functions/responsive";
//绑定容器;
const BindContainerStack = ({ route }) => {
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const { operatingFloorId, storageBinGroupId, fromPage, storageBinGroupName } =
    route.params;
  const [containerCode, setContainerCode] = useState("");
  const cancle = () => {
    setContainerCode("");
  };
  const onTextChange = (value) => {
    setContainerCode(value);
  };

  const onConfirm = () => {
    // console.log(operatingFloorId, storageBinGroupId, fromPage, containerCode);
    if (!containerCode) {
      ToastAndroid.show("请扫描容器编码", ToastAndroid.SHORT);
      return;
    }
    if (!operatingFloorId || !storageBinGroupId || !containerCode) {
      ToastAndroid.show("参数错误", ToastAndroid.SHORT);
      return;
    }
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/check/bindContainer`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          operatingFloorId: operatingFloorId,
          storageBinGroupId: storageBinGroupId,
          containerCode: containerCode.startsWith(SCAN_TAG)
            ? containerCode.slice(1)
            : containerCode,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("绑定成功", ToastAndroid.SHORT);
        navigation.navigate(fromPage);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`绑定失败${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"绑定容器"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <GoodsPositionDetailCard
        marginTop={8}
        width={"95%"}
        item1_left={
          <Text style={{ fontSize: 16 }}>货位分组:{storageBinGroupName}</Text>
        }
      ></GoodsPositionDetailCard>
      <Input
        marginTop={5}
        value={containerCode}
        placeholder={"请扫描容器编码"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
      ></Input>
      <CustomButton
        title="确认绑定"
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
        onPress={onConfirm}
      />
    </View>
  );
};
export default BindContainerStack;
