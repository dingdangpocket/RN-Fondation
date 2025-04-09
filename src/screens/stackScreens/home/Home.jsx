import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
const Home = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 100, color: "black" }}>Home</Text>
    </View>
  );
};
export default React.memo(Home);
