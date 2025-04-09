import { StyleSheet, Text } from "react-native";
import React from "react";
import { rpx2dp, h, w } from "src/functions/responsive";

const CustomTag = ({
  color = "#B48032",
  backgroundColor = "#FFF7EA",
  width = 70,
  text,
  opacity = 1,
  style = {},
}) => {
  return (
    <Text
      style={{
        ...styles.tag,
        color,
        backgroundColor,
        width,
        opacity,
        ...style,
      }}
    >
      {text}
    </Text>
  );
};

export default CustomTag;

const styles = StyleSheet.create({
  tag: {
    textAlign: "center",
    lineHeight: rpx2dp(24, false),
    height: rpx2dp(24, false),
    borderRadius: 2,
  },
});
