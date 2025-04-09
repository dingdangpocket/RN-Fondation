import React from "react";
import { View, StyleSheet, Modal } from "react-native";
const Warn = ({ light }) => {
  return (
    <Modal visible={light} transparent={true}>
      <View style={styles.overlay} />
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 0, 0, 0.5)", // 半透明的红色
    justifyContent: "center",
    alignItems: "center",
  },
});
export default Warn;
