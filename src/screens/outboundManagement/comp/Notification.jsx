import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
} from "react-native";

let notificationInstance = null;

const Notification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });
  const { width } = useWindowDimensions();

  notificationInstance = setNotification;

  useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, isVisible: false });
      }, notification.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification.isVisible) return null;

  const { message, type } = notification;

  const colorConfigs = {
    info: { backgroundColor: "#000000B2", textColor: "#FFFFFF" },
    success: { backgroundColor: "#ECFDF5", textColor: "#006655F4" },
    warn: { backgroundColor: "#FFC107", textColor: "#000000" },
    error: { backgroundColor: "#F44336", textColor: "#FFFFFF" },
  };

  const { backgroundColor, textColor } =
    colorConfigs[type] || colorConfigs["info"];

  return (
    <View
      style={[
        styles.notificationContainer,
        { backgroundColor, width: 0.9 * width },
      ]}
    >
      {notification.type === "success" && (
        <Image
          source={require("../../../static/NotificationSuccessIcon.png")}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
      )}
      <Text style={[styles.notificationText, { color: textColor }]}>
        {message}
      </Text>
    </View>
  );
};

export const notification = {
  open: ({ message, type = "info", duration = 2000 }) => {
    notificationInstance &&
      notificationInstance({ isVisible: true, message, type, duration });
  },
  close: () => {
    notificationInstance && notificationInstance({ isVisible: false });
  },
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    bottom: 95,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "center",
    flexDirection: "row",
    zIndex: 1000,
  },
  notificationText: {
    fontSize: 16,
    textAlign: "left",
    flexWrap: "wrap", // 确保文本可以换行
    flexShrink: 1, // 允许文本缩小
    flexGrow: 1, // 允许文本扩展
  },
});

export default Notification;
