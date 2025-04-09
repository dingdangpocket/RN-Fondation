import { Dimensions } from "react-native";
const scale = (size, oritation) => {
  if (oritation === "w") {
    const scaledSize = (Dimensions.get("window").width / 375) * size;

    return scaledSize;
  }
  if (oritation === "h") {
    const scaledSize = (Dimensions.get("window").width / 775) * size;
    return scaledSize;
  }
};
export default scale;
