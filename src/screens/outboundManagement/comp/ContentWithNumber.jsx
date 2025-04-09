import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NormalText } from "../comStyle";

const ContentWithNumber = ({ content, number }) => {
  return (
    <View style={styles.badgeContainer}>
      <Text style={{ ...NormalText, color: "white" }}>{content}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{number}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles
  badgeContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -11,
    right: -10,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ContentWithNumber;
