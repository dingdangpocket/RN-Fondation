import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import scale from "src/functions/scale";
const Goods = () => {
  const navigation = useNavigation();
  scale();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: scale(30, "w"),
          lineHeight: scale(80, "h"),
          marginTop: scale(650, "h"),
          color: "white",
          backgroundColor: "green",
        }}
      >
        Goods
      </Text>
    </View>
  );
};
export default React.memo(Goods);
