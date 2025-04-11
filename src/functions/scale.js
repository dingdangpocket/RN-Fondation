import { Dimensions } from "react-native";
const scale = (size, orientation = "w") => {
  const { width, height } = Dimensions.get("window");
  const baseWidth = 375;
  const baseHeight = 812;
  let scaledSize;
  switch (orientation) {
    case "w":
      scaledSize = (width / baseWidth) * size;
      break;
    case "h":
      scaledSize = (height / baseHeight) * size;
      break;
    default:
      console.warn('Invalid orientation. Use "w" for width or "h" for height.');
      scaledSize = size;
  }
  return scaledSize;
};
export default scale;
