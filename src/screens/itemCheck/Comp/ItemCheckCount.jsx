import React from "react";
import { View, Text, TouchableNativeFeedback } from "react-native";
import { IncrementIcon, DecrementIcon } from "src/icons";
const ItemCheckCount = ({
  count,
  handleOpenModal,
  onDecrement,
  onIncrement,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 30,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TouchableNativeFeedback onPress={onDecrement}>
        <View
          style={{
            backgroundColor: "rgb(220,220,220)",
            height: 35,
            width: 35,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DecrementIcon width={"30%"} height={"30%"}></DecrementIcon>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback onPress={() => handleOpenModal()}>
        <View
          style={{
            width: 90,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: "#E28400" }}>{count}</Text>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback onPress={onIncrement}>
        <View
          style={{
            backgroundColor: "rgb(220,220,220)",
            height: 35,
            width: 35,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IncrementIcon width={"30%"} height={"30%"}></IncrementIcon>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};
export default ItemCheckCount;
