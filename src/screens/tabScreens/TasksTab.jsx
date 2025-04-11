import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

const TasksTab = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{ fontSize: 100, color: "black" }}
        onPress={() => navigation.navigate("Home")}
      >
        1
      </Text>
      <Text>{t("welcome")}</Text>
      <Text>{t("greeting", { name: "React Native" })}</Text>
    </View>
  );
};
export default React.memo(TasksTab);
