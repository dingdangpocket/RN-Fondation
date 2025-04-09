import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
const TasksTab = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{ fontSize: 100, color: "black" }}
        onPress={() => navigation.navigate("Home")}
      >
        1
      </Text>
    </View>
  );
};
export default React.memo(TasksTab);
