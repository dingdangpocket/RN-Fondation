import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const LoginInput = ({
  value,
  placeholder,
  Icon1,
  Icon2,
  onIcon1Fun,
  onTextChange,
  inputColor,
  secureTextEntry,
  onBlur,
  onFocus,
}) => {
  const { width, height, scale, fontScale } = useWindowDimensions();
  const handleTextChange = (value) => {
    onTextChange(value);
  };
  const clearText = () => {
    onIcon1Fun();
  };
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 5,
        width: width * 0.95,
        alignItems: "center",
        padding: 10,
        borderWidth: 0.2,
        borderColor: "white",
        borderRadius: 5,
        backgroundColor: inputColor,
      }}
    >
      <TextInput
        style={{
          width: value ? width * 0.7 : width * 0.8,
          height: 40,
          fontSize: 16,
          backgroundColor: "rgb(240,240,240)",
        }}
        placeholder={placeholder}
        value={value}
        onChangeText={handleTextChange}
        placeholderTextColor="gray"
        secureTextEntry={secureTextEntry}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {value ? (
        <TouchableOpacity onPress={clearText}>
          <View
            style={{
              width: width * 0.1,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {Icon1}
          </View>
        </TouchableOpacity>
      ) : (
        ""
      )}
      <View
        style={{
          width: width * 0.1,
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {Icon2}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  clearButton: {
    marginLeft: 10,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
export default LoginInput;
