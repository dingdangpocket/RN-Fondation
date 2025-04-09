import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import scale from "src/functions/scale";
const Home = () => {
  const navigation = useNavigation();
  scale();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: scale(30, "w"),
          lineHeight: scale(80, "h"),
          color: "black",
          backgroundColor: "red",
          marginTop: scale(650, "h"),
        }}
      >
        Home
      </Text>
    </View>
  );
};
export default React.memo(Home);
