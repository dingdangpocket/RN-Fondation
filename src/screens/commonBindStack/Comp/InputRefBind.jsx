import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
const InputRef = forwardRef(
  (
    {
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
      marginTop,
      handleSubmit,
      iptWidth,
      radius,
    },
    ref
  ) => {
    const { width } = useWindowDimensions();
    const inputRef = useRef(null);
    const handleTextChange = (value) => {
      onTextChange(value);
    };
    const clearText = () => {
      onIcon1Fun();
    };
    const [bool, setBool] = useState(true);
    useImperativeHandle(ref, () => ({
      focus: () => {
        setBool(false);
        if (inputRef.current) {
          const TIMER = setTimeout(() => {
            inputRef.current.focus();
            //焦点处理后开启软盘弹出，保证用户下次可以手输;
            setBool(true);
          }, 0);
          return () => clearTimeout(TIMER);
        }
      },
    }));
    return (
      <View
        style={{
          flexDirection: "row",
          marginTop: marginTop ?? 0,
          width: iptWidth ?? width * 0.95,
          alignItems: "center",
          padding: 10,
          borderWidth: 0.2,
          borderColor: "white",
          borderRadius: radius ?? 5,
          backgroundColor: inputColor,
        }}
      >
        <TextInput
          ref={inputRef}
          showSoftInputOnFocus={bool}
          style={{
            width: value ? iptWidth ?? width * 0.7 : iptWidth ?? width * 0.8,
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
          onSubmitEditing={handleSubmit}
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
  }
);

export default InputRef;
