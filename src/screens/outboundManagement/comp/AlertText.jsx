import { Text, Alert, TouchableOpacity } from "react-native";
import React from "react";
import { NormalText } from "../comStyle";
const AlertText = ({ text, style = NormalText, showLength = 24 }) => {
  if (!text) {
    return text;
  }
  // skuName：24，skuId：30
  const displayText =
    text?.length <= showLength ? text : `${text?.substring(0, showLength)}...`;
  const isNeedAlert = text?.length > showLength;
  const handlePress = () => {
    Alert.alert("详细", text, [{ text: "确认" }], { cancelable: false });
  };
  return isNeedAlert ? (
    <TouchableOpacity
      onPress={handlePress}
      style={{ padding: 10, borderRadius: 5 }}
    >
      <Text style={style}>{displayText}</Text>
    </TouchableOpacity>
  ) : (
    <Text style={style}>{displayText}</Text>
  );
};

export default AlertText;
