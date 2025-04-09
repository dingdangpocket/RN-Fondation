import React, { useEffect, useState } from "react";
import { View, TouchableNativeFeedback, Image, TextInput } from "react-native";
const CountComp = ({ getValue, initValue, iptWidth, iconWH }) => {
  //PureCountModal
  const [count, setCount] = useState(initValue ?? 0);
  const onChangeText = (value) => {
    const regex = /^\d*\.?\d{0,4}$/;
    if (regex.test(value)) {
      setCount(value);
    }
  };
  const onDecrement = () => {
    if (count <= 0) return;
    setCount((v) => parseFloat((Number(v) - 1).toFixed(4)));
  };
  const onIncrement = () => {
    setCount((v) => parseFloat((Number(v) + 1).toFixed(4)));
  };

  useEffect(() => {
    getValue(count);
  }, [count]);

  useEffect(() => {
    setCount(initValue);
  }, [initValue]);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TouchableNativeFeedback onPress={onDecrement}>
        <View
          style={{
            backgroundColor: "rgb(220,220,220)",
            height: iconWH ?? 40,
            width: iconWH ?? 40,
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
      <TextInput
        style={{
          width: iptWidth ?? 80,
          height: 50,
          fontSize: 20,
          color: "#E28400",
          textAlign: "center",
        }}
        value={
          !isNaN(count) && parseFloat(count) >= 0 ? String(count) : String("")
        }
        keyboardType="number-pad"
        onChangeText={onChangeText}
      />
      <TouchableNativeFeedback onPress={onIncrement}>
        <View
          style={{
            backgroundColor: "rgb(220,220,220)",
            height: iconWH ?? 40,
            width: iconWH ?? 40,
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
export default CountComp;
