import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

//reTake是用于组件的Effect响应依赖，发生变化说明需要聚焦到文本框;-必传;
const InputBar = ({
  value,
  placeholder,
  Icon1,
  Icon2,
  onIcon1Fun,
  onTextChange,
  inputColor,
  onBlur,
  onFocus,
  marginTop,
  reTake,
  handleSubmit,
  iptWidth,
  radius,
}) => {
  const { width } = useWindowDimensions();

  
  const handleTextChange = (value) => {
    onTextChange(value);
  };
  const clearText = () => {
    onIcon1Fun();
  };
  const inputRef = useRef(null);
  //初始自动focus;
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      return;
    }
  }, []);

  //响应父组件页面激活时传来的响应依赖,由于JS和视图渲染是双线程;
  //此处应该等待300ms以保证视图可以被正确引用，从而获取焦点等待扫码输入;
  useEffect(() => {
    //先将文本框焦点自动弹出键盘关闭;
    setBool(false);
    if (inputRef.current) {
      const TIMER = setTimeout(() => {
        inputRef.current.focus();
        //焦点处理后开启软盘弹出，保证用户下次可以手输;
        setBool(true);
      }, 1000);
      return () => clearTimeout(TIMER);
    }
  }, [reTake]);

  const [bool, setBool] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "#004D92",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        height: 65,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          marginTop: marginTop ?? 0,
          width: iptWidth ?? width * 0.95,
          alignItems: "center",
          borderRadius: radius ?? 6,
          backgroundColor: inputColor,
          borderColor: "#ccc",
          borderWidth: 1,
        }}
      >
        <TextInput
          ref={inputRef}
          showSoftInputOnFocus={bool}
          style={{
            width: value ? iptWidth ?? width * 0.7 : iptWidth ?? width * 0.8,
            height: 40,
            textAlign: "left",
          }}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          placeholderTextColor="gray"
          onBlur={onBlur}
          onFocus={onFocus}
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
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
        ) : null}
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
    </View>
  );
};

export default InputBar;
