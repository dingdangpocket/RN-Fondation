import { View, Text, ToastAndroid } from "react-native";
import React, { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import fetchData from "src/api/fetchData";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { ContentContext } from "src/context/ContextProvider";
import { h, w } from "src/functions/responsive";
const CloseContainerStack = ({ route }) => {
  const { storageBinGroupId, containerCode, canUnbind, containerRelationId } =
    route.params;
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const onConfirm = () => {
    if (!containerCode) {
      ToastAndroid.show("未绑定容器,封箱失败", ToastAndroid.SHORT);
      return;
    }
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/check/packageContainer`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          // operatingFloorId: operatingFloorId,
          storageBinGroupId: storageBinGroupId,
          containerCode: containerCode,
          bindRelationId: containerRelationId,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("封箱成功", ToastAndroid.SHORT);
        navigation.goBack();
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show("封箱失败", ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };
  const onCancleBind = () => {
    if (!containerCode) {
      ToastAndroid.show("未绑定容器,解绑失败", ToastAndroid.SHORT);
      return;
    }
    if (canUnbind == 0) {
      ToastAndroid.show("该项次不允许解绑", ToastAndroid.SHORT);
      return;
    }
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/check/unbindContainer`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          // operatingFloorId: operatingFloorId,
          storageBinGroupId: storageBinGroupId,
          containerCode: containerCode,
          bindRelationId: containerRelationId,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        navigation.goBack();
        ToastAndroid.show("解绑成功", ToastAndroid.SHORT);
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
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"封箱"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View style={{ width: w * 0.95 }}>
        <GoodsPositionDetailCard
          marginTop={10}
          item1_left={
            <Text style={{ fontSize: 18, color: "#222222" }}>
              容器编码:{containerCode}
            </Text>
          }
        ></GoodsPositionDetailCard>
      </View>

      <CustomButton
        title="确认封箱"
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
      <CustomButton
        title="解绑"
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={10}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onCancleBind}
      />
    </View>
  );
};
export default CloseContainerStack;
