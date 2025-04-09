import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

import { rpx2dp, h, w } from "src/functions/responsive";
const CustomModal = ({
  visible,
  setVisible,
  onCancel = () => setVisible(false),
  onConfirm,
  title,
  header,
  footer,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {header || <Text style={styles.title}>{title}</Text>}
          <View style={styles.content}>{children}</View>
          {footer || (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onCancel()}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onConfirm}>
                <Text style={styles.confirmText}>确认</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: rpx2dp(293, false),
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: "#222222",
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    marginTop: 10,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: "#fff",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "#222222",
    fontSize: 16,
  },
  confirmText: {
    color: "#004D92",
    fontWeight: "bold",
  },
});

export default CustomModal;
