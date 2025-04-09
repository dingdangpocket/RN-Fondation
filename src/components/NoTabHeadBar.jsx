import React from "react";
import { View, Text, Keyboard, TouchableOpacity } from "react-native";
import { BackIcon } from "../icons/index";
import { useNavigation } from "@react-navigation/native";
import { w } from "src/functions/responsive";
const NoTabHeadBar = ({ titleA, icon, onRightFun, nav }) => {
  const navigation = useNavigation();
  const back = () => {
    Keyboard.dismiss();
    nav ? nav() : navigation.goBack();
  };
  return (
    <View
      style={{
        width: w,
        backgroundColor: "red",
      }}
    >
      <View
        style={{
          backgroundColor: "#004D92",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 60,
        }}
      >
        <TouchableOpacity activeOpacity={0.6} onPress={() => back()}>
          <View
            style={{
              marginLeft: w * 0.025,
              width: 100,
              height: 50,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <BackIcon width={25} height={25} />
          </View>
        </TouchableOpacity>
        <Text
          style={{
            alignItems: "center",
            fontSize: 15,
            marginRight: w * 0.1,
            color: "white",
          }}
        >
          {titleA}
        </Text>
        <TouchableOpacity
          onPress={() => onRightFun()}
          style={{ marginRight: w * 0.05 }}
        >
          <View>{icon}</View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoTabHeadBar;
