/**
 * @format
 */
//Design by Gang Nie\Siyu Huang; 2024-11-29;
import React from "react";
import { AppRegistry } from "react-native";
import { ContextProvider } from "./src/context/ContextProvider";
import RootApp from "./App";
import { name as appName } from "./app.json";
const Apps = () => {
  return (
    <ContextProvider>
      <RootApp />
    </ContextProvider>
  );
};
export default Apps;
AppRegistry.registerComponent(appName, () => Apps);
