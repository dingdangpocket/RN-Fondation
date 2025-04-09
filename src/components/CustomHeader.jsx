import React from "react";
import { View, StyleSheet } from "react-native";

const CustomHeader = ({ title = null, rightContent = null }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>{title}</View>
      {rightContent && (
        <View style={styles.rightContainer}>{rightContent}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#004D92",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightContainer: {
    // 右侧内容的样式
  },
});

export default CustomHeader;
