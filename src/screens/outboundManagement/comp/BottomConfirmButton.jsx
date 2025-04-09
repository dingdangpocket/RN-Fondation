import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { rpx2dp, h, w } from "src/functions/responsive";

// 定义底部确认按钮组件
const BottomConfirmButton = ({
  title = "确认",
  titleColor = "white",
  backgroundColor = "#004D92",
  fontSize = 18,
  widthFactor = 0.9, // 宽度系数，默认为屏幕宽度的85%
  onPress, // 点击事件
  disabled = false, // 是否禁用
  isLoading = false, // 是否正在加载
  loadingText = "处理中...", // 加载时显示的文本
  marginBottom = 20,
  marginTop = 0,
  mTop = 0,
}) => {
  const { width } = useWindowDimensions();

  const buttonStyle = useMemo(
    () => ({
      ...styles.button,
      width: widthFactor * width, // 将宽度系数转换为百分比
      backgroundColor: disabled ? "#ccc" : backgroundColor, // 背景颜色根据禁用状态改变
      marginBottom: marginBottom,
      marginTop: marginTop,
    }),
    [width, widthFactor, disabled, backgroundColor]
  );

  const textStyle = useMemo(
    () => ({
      color: titleColor, // 文本颜色
      fontSize, // 文本大小
      marginLeft: isLoading ? 10 : 0, // 加载时左边距增加
    }),
    [titleColor, fontSize, isLoading]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ ...styles.container, marginTop:mTop, }}>
        <TouchableOpacity
          onPress={onPress}
          style={buttonStyle}
          disabled={disabled || isLoading} // 按钮禁用状态根据禁用和加载状态改变
          activeOpacity={0.7}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color={titleColor} />
              <Text style={textStyle}>{loadingText}</Text>
            </>
          ) : (
            <Text style={textStyle}>{title}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 样式定义
const styles = StyleSheet.create({
  safeArea: {
    // backgroundColor: "white",
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    // borderTopWidth: 1,
    // borderTopColor: "#e0e0e0",
  },
  button: {
    height: rpx2dp(50, false),
    flexDirection: "row", // 内容排列方式
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2.5,
    marginBottom: rpx2dp(20, false),
  },
});

export default React.memo(BottomConfirmButton);
