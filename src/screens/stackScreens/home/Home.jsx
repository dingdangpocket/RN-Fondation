import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import scale from "src/functions/scale";
const Home = () => {
  const navigation = useNavigation();
  scale();
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Goods");
        }}
      >
        <Text
          style={{
            color: "white",
            backgroundColor: "green",
            fontSize: scale(30, "w"),
            lineHeight: scale(80, "h"),
            marginTop: scale(650, "h"),
          }}
        >
          Home
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default React.memo(Home);
