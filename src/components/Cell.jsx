import React from "react";
import { View, Text, TouchableNativeFeedback, Dimensions } from "react-native";
const Width = Dimensions.get("window").width;
const Cell = ({ name, onPress, right, marginTop }) => {
  return (
    <TouchableNativeFeedback
      onPress={onPress}
    >
      <View
        style={{
          marginTop: marginTop ?? 0,
          width: Width * 0.97,
          height: 70,
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            marginLeft: 15,
            color: "#222222",
          }}
        >
          {name}
        </Text>
        {right}
      </View>
    </TouchableNativeFeedback>
  );
};
export default Cell;
