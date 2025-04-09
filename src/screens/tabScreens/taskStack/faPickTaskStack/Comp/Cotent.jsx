import React from "react";
import { Text } from "react-native";
const Content = ({ fontSize, color, value }) => (
  <Text style={{ fontSize: fontSize, color: color, height: 30 }}>{value}</Text>
);
export default Content;
