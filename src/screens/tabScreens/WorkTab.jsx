import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Button } from "react-native";
import { useTranslation } from "react-i18next";

const WorkTab = () => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // 切换语言
  };
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{ fontSize: 100, color: "black" }}
        onPress={() => navigation.navigate("Main")}
      >
        2
      </Text>
      <Button title="English" onPress={() => changeLanguage("en")} />
      <Button title="中文" onPress={() => changeLanguage("zh")} />
    </View>
  );
};
export default React.memo(WorkTab);
