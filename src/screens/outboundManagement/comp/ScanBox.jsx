import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { CancleIcon } from "src/icons/index";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
let scanBoxInstance = null;

const ScanBox = ({ placeholder, onKeyEnter, reTake,handleClear }) => {
  const inputRef = useRef(null);
  const [bool, setBool] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [previousInputValue, setPreviousInputValue] = useState("");

  //初始自动focus;
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  //响应父组件页面激活时传来的响应依赖,由于JS和视图渲染是双线程;
  //此处应该等待500ms以保证视图可以被正确引用，从而获取焦点等待扫码输入;
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

  useEffect(() => {
    if (inputValue) {
      const timer = setTimeout(() => {
        setResultDone("");
        setResultDone(inputValue);
        if (inputValue.includes(SCAN_TAG)) {
          handleKeyPress(inputValue, "scan");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [inputValue]);
  // 处理回车事件
  const handleKeyPress = (event, type) => {
    // setInputValue("");
    // console.log("handleKeyPress", event);
    // 获取当前输入框的值;
    let currentInputValue = type === "scan" ? event : event.nativeEvent.text;
    let newScanContent;
    if (type === "scan") {
      if (previousInputValue === "") {
        // 如果 previousInputValue 为空，直接使用 currentInputValue
        newScanContent = currentInputValue;
      } else {
        // 否则计算差值
        newScanContent = currentInputValue.replace(previousInputValue, "");
      }
      // 检查差值是否为空
      if (newScanContent.trim() === "") {
        // console.log("差值为空，保持原有的inputValue");
        return;
      }
      // 如果差值不为空，则表示有新的扫码内容;
      if (onKeyEnter) {
        onKeyEnter(newScanContent);
      }
      // 更新上一次输入框的值;
      setPreviousInputValue(newScanContent);
    } else {
      // 手输
      if (onKeyEnter) {
        currentInputValue = currentInputValue.startsWith(SCAN_TAG)
          ? currentInputValue.slice(1)
          : currentInputValue;
        newScanContent = currentInputValue;
        onKeyEnter(currentInputValue);
      }
    }
    // 重新获取焦点;
    setBool(false);
    if (inputRef.current) {
      setInputValue(newScanContent);
      setTimeout(() => {
        inputRef.current.focus();
        //焦点处理后开启软盘弹出，保证用户下次可以手输;
        setBool(true);
      }, 0);
    }
  };
  const onClear = () => {
    console.log("onClear");
    setInputValue("");
    setResultDone("");
    setPreviousInputValue("");
    inputRef.current.focus();
    if (handleClear) {
      handleClear();
    }
  };

  // 在组件挂载时，将 onClear 函数存储到全局变量
  useEffect(() => {
    scanBoxInstance = onClear;
    return () => {
      scanBoxInstance = null; // 清除引用以防止内存泄漏
    };
  }, []);

  const onChangeText = (text) => {
    setInputValue(text);
  };
  return (
    <View style={styles.searchContainer}>
      <TextInput
        ref={inputRef}
        showSoftInputOnFocus={bool}
        style={styles.searchInput}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={inputValue}
        onSubmitEditing={handleKeyPress}
        placeholderTextColor="#999"
      />
      {inputValue && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <View style={styles.clearIconView}>
            <CancleIcon width="60%" height="60%" color="gray" />
          </View>
        </TouchableOpacity>
      )}
      <Image
        source={require("../../../static/scan.png")} // 确保路径正确
        style={styles.scanIcon}
      />
    </View>
  );
};

export const scanBox = {
  clear: () => {
    scanBoxInstance && scanBoxInstance(); // 调用 onClear 方法
  },
};

export default ScanBox;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#004D92",
  },
  searchInput: {
    flex: 1,
    height: 40, // 根据需要调整高度
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 40, // 留出足够的空间给图标
    backgroundColor: "#fff",
  },
  clearButton: {
    position: "absolute",
    right: 50, // 与 scanIcon 对齐
    // top: 20,
    // top: "50%",
    // transform: [{ translateY: -40 }], // 确保按钮居中
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  clearIconView: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scanIcon: {
    position: "absolute",
    right: 16,
    width: 34,
    height: 34,
    resizeMode: "contain",
  },
});
