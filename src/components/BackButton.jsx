import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { rpx2dp } from "src/functions/responsive";
const BackButton = ({ onPress }) => {
  const navigation = useNavigation();
  const handlePress = () => {
    onPress ? onPress() : navigation.goBack();
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: rpx2dp(105),
        height: rpx2dp(45, false),
        justifyContent: "center",
        marginLeft: 10,
      }}
    >
      <Image
        source={require("../static/leftArrow.png")}
        style={{ tintColor: "#ffff", width: 22, height: 22 }}
      />
    </TouchableOpacity>
  );
};
export default BackButton;
