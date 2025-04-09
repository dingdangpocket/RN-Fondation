import React, { useEffect } from "react";
import { View, Modal, ActivityIndicator, StyleSheet, Text } from "react-native";

const Loading = ({ loading, setLoading, loadingText = "正在加载..." }) => {
  useEffect(() => {
    if (loading) {
      // 如果页面正在加载，启动 30 秒的定时器
      const timeout = setTimeout(() => {
        setLoading(false); // 超时后自动关闭 loading
      }, 30000);

      // 清除定时器，当 loading 状态被手动设置为 false 时
      return () => clearTimeout(timeout);
    }
  }, [loading, setLoading]);

  if (!loading) {
    return null; // 如果 loading 为 false，返回 null，不显示该组件
  }

  return (
    <Modal transparent={true} animationType="fade" visible={loading}>
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明背景
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default Loading;
