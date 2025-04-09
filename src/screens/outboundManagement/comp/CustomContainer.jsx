import { StyleSheet, View } from "react-native";
import React from "react";

const CustomContainer = ({
  backgroundColor = "#F1F3FC",
  paddingHorizontal = 12,
  paddingVertical = 16,
  children,
}) => {
  return (
    <View style={styles.outerContainer}>
      <View
        style={{
          ...styles.container,
          backgroundColor,
          paddingHorizontal,
          paddingVertical,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default CustomContainer;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#004D92", // 外层容器设置背景色
  },
  container: {
    flex: 1,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 8, //gap 16
  },
});
