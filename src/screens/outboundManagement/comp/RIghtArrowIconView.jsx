import { Image, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import React from "react";
import { rpx2dp, h, w } from "src/functions/responsive";
const RIghtArrowIconView = ({
  height,
  paddingVertical,
  onRightPress,
  children,
}) => {
  return (
    <View style={{ ...styles.view, height, paddingVertical }}>
      {children}
      <TouchableNativeFeedback onPress={onRightPress}>
        <View style={styles.touchableArea}>
          <Image
            source={require("../../../static/rightArrow.png")}
            style={styles.img}
          />
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

export default RIghtArrowIconView;

const styles = StyleSheet.create({
  view: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  img: {
    width: rpx2dp(20),
    height: rpx2dp(20, false),
  },
  touchableArea: {
    width: rpx2dp(30),
    height: rpx2dp(30, false),
    justifyContent: "center",
    alignItems: "center",
  },
});
