/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
// import codePush from "react-native-code-push";
import React from "react";
import { SafeAreaView } from "react-native";
import RoutesNav from "./src/components/routerComp/RoutesNav";

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoutesNav />
    </SafeAreaView>
  );
};
export default App;
