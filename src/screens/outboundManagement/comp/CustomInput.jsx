import React from "react";
import { TextInput, StyleSheet } from "react-native";

const CustomInput = ({
  placeholder,
  value,
  onChange,
  onSubmitEditing,
  multiline = false,
  style,
  placeholderTextColor = "#ADADAD",
  minWidth = 100,
  ...props
}) => {
  return (
    <TextInput
      style={[styles.input, multiline && styles.textArea, style, { minWidth }]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      onSubmitEditing={onSubmitEditing}
      multiline={multiline}
      placeholderTextColor={placeholderTextColor}
      textAlignVertical={multiline ? "top" : "center"} // 确保文本在 TextArea 中顶部对齐
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    borderWidth: 0, // 无边框
    paddingVertical: 0, // 确保内容上下对齐，不被截断
  },
  textArea: {
    height: 100, // 默认高度，可根据需要调整
    backgroundColor: "#F6F6F6",
    paddingTop: 10,
    paddingLeft: 10,
  },
});

export default CustomInput;
