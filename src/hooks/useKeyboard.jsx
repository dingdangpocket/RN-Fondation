import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
const useKeyboard = () => {
  const [keyboard, setKeyboard] = useState();
  const keyboardDidHideListener = Keyboard.addListener(
    "keyboardDidHide",
    () => {
      setKeyboard(false);
    }
  );
  const keyboardDidShowListener = Keyboard.addListener(
    "keyboardDidShow",
    () => {
      setKeyboard(true);
    }
  );
  useEffect(() => {
    // 添加监听器
    keyboardDidHideListener;
    keyboardDidShowListener;
    // 组件卸载时移除监听器
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  return [keyboard];
};
export default useKeyboard;
