import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BackButton from "src/components/BackButton";
import { rpx2dp, h, w } from "src/functions/responsive";

const CustomPageHeader = ({
  title = "",
  rightContent,
  rightWidth = 50,
  onRightPress,
  tabs,
  activeTab, // 接收activeTab属性
  onBackPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* 左侧返回按钮 */}
      <View style={styles.leftContainer}>
        <BackButton onPress={onBackPress} />
      </View>

      {/* 中间部分，可能是标题或tab */}
      <View
        style={[
          styles.centerContainer,
          !rightContent && { marginRight: rightWidth },
        ]}
      >
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          // 渲染Tab内容
          <View style={styles.tabContainer}>
            {tabs?.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tab}
                onPress={tab.onPress} // 保持点击事件不变
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab?.tabIndex && styles.selectedText, // 如果是当前激活的Tab，应用高亮样式
                  ]}
                >
                  {tab?.label}
                </Text>
                {activeTab === tab?.tabIndex && (
                  <View style={styles.selectedUnderline} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 右侧可点击内容 */}
      {rightContent && (
        <TouchableOpacity
          onPress={onRightPress}
          style={{ ...styles.rightContainer, width: rightWidth }}
          hitSlop={{ top: 10, bottom: 10, left: 30, right: 10 }}
        >
          <Text style={styles.rightText}>{rightContent}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12.5,
    paddingRight: 12,
    backgroundColor: "#004D92",
    height: rpx2dp(45, false),
  },
  leftContainer: {
    width: rpx2dp(50), // 固定宽度确保中间部分居中
    alignItems: "flex-start",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    height: rpx2dp(20, false),
    lineHeight: 20,
    fontWeight: "500",
    color: "#ffff",
  },
  tabContainer: {
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 5,
  },
  tabText: {
    color: "#fff",
    fontSize: 18,
    opacity: 0.8,
  },
  selectedText: {
    color: "#fff",
    fontSize: 18,
    paddingBottom: 3, // 添加内边距
    opacity: 1,
  },
  selectedUnderline: {
    height: rpx2dp(3, false),
    backgroundColor: "#fff",
    width: rpx2dp(27), // 下划线的长度
    marginLeft: "auto", // 使得下划线居中
    marginRight: "auto",
    marginTop: 2,
    borderRadius: 1,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  rightText: {
    fontSize: 14,
    lineHeight: 18,
    height: rpx2dp(18, false),
    color: "#FFFFFF",
  },
});

export default CustomPageHeader;
