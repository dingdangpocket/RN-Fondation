import { Dimensions } from "react-native";
const useWindow = () => {
  const Width = Dimensions.get("window").width;
  const Height = Dimensions.get("window").height;
  return [Width, Height];
};
export default useWindow;
