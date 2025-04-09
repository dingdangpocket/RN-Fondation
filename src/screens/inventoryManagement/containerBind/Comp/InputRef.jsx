import React, {
  useEffect,
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
//reTake是用于组件的Effect响应依赖，发生变化说明需要聚焦到文本框;-必传;
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
      reTake,
      handleSubmit,
      iptWidth,
      radius,
      editable,
    },
    ref
  ) => {
    const { width, height } = useWindowDimensions();
    const inputRef = useRef(null);
    const handleTextChange = (value) => {
      onTextChange(value);
    };
    const clearText = () => {
      onIcon1Fun();
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        setBool(false);
        // if (inputRef.current) inputRef.current.focus();
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
    // const inputRef = useRef(null);
    //初始自动focus;

    // useEffect(() => {
    //   if (ref.current) {
    //     ref.current.focus();
    //   }
    // }, []);

    //响应父组件页面激活时传来的响应依赖,由于JS和视图渲染是双线程;
    //此处应该等待300ms以保证视图可以被正确引用，从而获取焦点等待扫码输入;
    const [bool, setBool] = useState(true);
    // useEffect(() => {
    //   //先将文本框焦点自动弹出键盘关闭;
    //   setBool(false);
    //   if (inputRef.current) {
    //     const TIMER = setTimeout(() => {
    //       inputRef.current.focus();
    //       //焦点处理后开启软盘弹出，保证用户下次可以手输;
    //       setBool(true);
    //     }, 300);
    //     return () => clearTimeout(TIMER);
    //   }
    // }, [reTake]);
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
