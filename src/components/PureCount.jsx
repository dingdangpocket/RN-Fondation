import React from "react";
import { View, TouchableNativeFeedback, Image, TextInput } from "react-native";
const PureCount = ({
  count,
  onChangeText,
  onDecrement,
  onIncrement,
  handleOpenModal,
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
          <Image
            style={{
              width: 20,
              height: 20,
            }}
            source={require("src/static/decrement.jpg")}
          ></Image>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback onPress={() => handleOpenModal()}>
        <TextInput
          style={{
            width: 80,
            height: 50,
            fontSize: 25,
            color: "#E28400",
            textAlign: "center",
          }}
          value={
            !isNaN(count) && parseFloat(count) >= 0 ? String(count) : String("")
          }
          keyboardType="number-pad"
          onChangeText={onChangeText}
        />
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
          <Image
            style={{
              width: 20,
              height: 20,
            }}
            source={require("src/static/increment.jpg")}
          ></Image>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};
export default PureCount;
