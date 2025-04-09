import { rpx2dp, h, w } from "src/functions/responsive";
// 主题色文本
export const PrimaryText = {
  height: rpx2dp(24, false),
  fontWeight: "bold",
  fontSize: 16,
  color: "#004D92",
};
// 橘色数量文本
export const CountText = {
  height: rpx2dp(24, false),
  fontWeight: "bold",
  fontSize: 16,
  color: "#E28400",
};
// 常见灰色属性名文本
export const GrayText = {
  color: "#7A7A7A",
  fontWeight: "400",
  height: rpx2dp(20, false),
  fontSize: 15,
};
// 常用文本
export const NormalText = {
  color: "#222222",
  fontWeight: "400",
  height: rpx2dp(20, false),
  fontSize: 15,
};
// 时间文本
export const TimeText = {
  color: "#ADADAD",
  fontWeight: "400",
  height: rpx2dp(18, false),
  fontSize: 13,
  lineHeight: 18,
};

// 落放货位Text
export const GreenText = {
  color: "#279700",
  fontWeight: "400",
  height: rpx2dp(26, false),
  fontSize: 15,
  lineHeight: 26,
};
export const RedText = {
  color: "#D71F14",
  fontWeight: "400",
  height: rpx2dp(26, false),
  fontSize: 15,
  lineHeight: 26,
};
export const WarnText = {
  color: "#D1731D",
};

export const WarnView = {
  backgroundColor: "#FFE8D3",
  borderRadius: 4,
  paddingHorizontal: 5,
  paddingVertical: 12,
  height: rpx2dp(42, false),
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
};
export const CardTopView = {
  paddingVertical: 3,
  height: rpx2dp(30, false),
  marginBottom: 8, //gap
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};
export const CardBottomView = {
  paddingVertical: 4,
  height: rpx2dp(30, false),
  marginTop: 6, //gap
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};

// 落放货位
export const GreenDashView = {
  borderStyle: "dashed",
  borderWidth: 1,
  height: rpx2dp(44, false),
  paddingHorizontal: 12,
  paddingVertical: 9,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#F5FFF2",
  borderColor: "#65DB3B",
};

export const RedDashView = {
  borderStyle: "dashed",
  borderWidth: 1,
  height: rpx2dp(44, false),
  paddingHorizontal: 12,
  paddingVertical: 9,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#FFF3F2",
  borderColor: "#FF3B30",
};
