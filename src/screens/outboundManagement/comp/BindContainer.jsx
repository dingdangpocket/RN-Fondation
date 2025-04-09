import { Text, View, TouchableNativeFeedback } from "react-native";
import React from "react";
import CustomCard from "./CustomCard";
import {
  CardBottomView,
  PrimaryText,
  NormalText,
} from "../../outboundManagement/comStyle";
import { useNavigation } from "@react-navigation/native";

const BindContainer = ({
  targetStorageBinCode,
  containerCode,
  fromPage,
  bindLoading,
  notification,
  routeData = [],
}) => {
  const navigation = useNavigation();
  // 去绑定
  const onGoBind = () => {
    if (bindLoading) {
      notification.open({
        message: "正在查找容器对应货位,请等待...",
      });
      return;
    }
    navigation.navigate("CommonContainerBindStack", {
      containerCode,
      fromPage,
      routeData,
    });
  };
  return (
    <CustomCard widthFactor={0.95}>
      <View style={CardBottomView}>
        <Text style={PrimaryText}>上架货位</Text>
        {targetStorageBinCode ? (
          <Text style={NormalText}>{targetStorageBinCode}</Text>
        ) : (
          <TouchableNativeFeedback onPress={onGoBind}>
            {containerCode ? (
              <Text style={PrimaryText}>去绑定</Text>
            ) : (
              <Text></Text>
            )}
          </TouchableNativeFeedback>
        )}
      </View>
    </CustomCard>
  );
};

export default BindContainer;
