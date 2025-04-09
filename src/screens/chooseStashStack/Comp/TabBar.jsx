import React from "react";
import { View, Text, TouchableNativeFeedback, Dimensions } from "react-native";
import { BackIcon } from "src/icons/index";
import { useNavigation } from "@react-navigation/native";

const TabBar = ({ titleA, icon, onLeftFun, onRightFun }) => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  return (
    <View
      style={{
        backgroundColor: "#004D92",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 60,
      }}
    >
      <Text
        style={{
          alignItems: "center",
          fontSize: 20,
          color: "white",
        }}
      >
        {titleA}
      </Text>
    </View>
  );
};

export default TabBar;
