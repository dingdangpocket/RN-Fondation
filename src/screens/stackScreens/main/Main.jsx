import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
const Main = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 100, color: "black" }}>Main</Text>
    </View>
  );
};
export default React.memo(Main);
