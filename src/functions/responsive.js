import { Dimensions, PixelRatio } from "react-native";
const h = Dimensions.get("window").height;
const w = Dimensions.get("window").width;
const designWidth = 375;
const designHeight = 667;
// 获取设备屏幕宽度和高度
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
// 根据设计稿宽度和高度，计算宽度和高度的缩放比例
const scaleWidth = screenWidth / designWidth;
const scaleHeight = screenHeight / designHeight;
// rpx转dp的函数，同时考虑宽度和高度
const rpx2dp = (rpx, isWidth = true) => {
  // 根据传入的参数决定使用宽度还是高度的缩放比例
  const scale = isWidth ? scaleWidth : scaleHeight;
  // 将rpx值转换为dp值
  const dp = rpx * scale;
  // 四舍五入到最近的像素值
  return PixelRatio.roundToNearestPixel(dp);
};
export { rpx2dp, h, w };
