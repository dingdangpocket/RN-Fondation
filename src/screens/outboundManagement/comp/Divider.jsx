import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Divider = () => {
  return (
    <View>
      <Text style={styles.divider}></Text>
    </View>
  );
};

export default Divider;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#000",
    opacity: 0.2,
  },
});
