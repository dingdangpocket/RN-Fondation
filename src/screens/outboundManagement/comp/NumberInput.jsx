import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ToastAndroid,
} from "react-native";
import MinusIcon from "../../../static/minus.png";
import PlusIcon from "../../../static/plus.png";
import { rpx2dp, h, w } from "src/functions/responsive";
const NumberInput = ({
  initialValue = 0,
  value,
  onChangeValue,
  maxValue,
  type = "float",
  minWidth = 90,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    // 如果父组件传递了新的值，更新当前值
    if (typeof value === "number" && !isNaN(value)) {
      setCurrentValue(value);
    }
  }, [value]);

  useEffect(() => {
    // 设置初始值
    setCurrentValue(initialValue);
  }, [initialValue]);
  const increment = () => {
    const newValue = currentValue + 1;
    if (newValue > maxValue) {
      return;
    }
    setCurrentValue(newValue);
    onChangeValue(newValue);
  };

  const decrement = () => {
    if (currentValue > 0) {
      const newValue = currentValue - 1;
      setCurrentValue(newValue);
      onChangeValue(newValue);
    }
  };

  const handleInputChange = (input) => {
    if (type === "float") {
      const inputValue = parseFloat(input);
      if (input.split(".")[1]?.length > 4) {
        ToastAndroid.show("小数点后只能有4位!", ToastAndroid.SHORT);
        return;
      }
      if (inputValue > maxValue) {
        ToastAndroid.show("输入值超出最大值!", ToastAndroid.SHORT);
        setCurrentValue(0);
        onChangeValue(0);
        return;
      }
      onChangeValue(inputValue);
      setCurrentValue(input);
    } else {
      if (!isNaN(input) && input <= maxValue) {
        setCurrentValue(Number(input));
        onChangeValue(Number(input));
      } else {
        ToastAndroid.show("输入值超出最大值!", ToastAndroid.SHORT);
        setCurrentValue(0);
        onChangeValue(0);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={decrement}>
        <View style={styles.buttonBox}>
          <Image source={MinusIcon} style={styles.img} />
        </View>
      </TouchableOpacity>
      <TextInput
        style={{ ...styles.input, minWidth: rpx2dp(minWidth) }}
        value={String(currentValue)}
        onChangeText={handleInputChange}
        keyboardType={type === "float" ? "decimal-pad" : "numeric"}
      />
      <TouchableOpacity onPress={increment}>
        <View style={styles.buttonBox}>
          <Image source={PlusIcon} style={styles.img} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#f2f2f2",
    width: rpx2dp(150),
    height: rpx2dp(40, false),
  },
  buttonBox: {
    width: rpx2dp(30),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    height: rpx2dp(15),
    width: rpx2dp(15),
  },
  input: {
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 18,
    flex: 1,
    backgroundColor: "#f2f2f2",
    color: "#E28400",
  },
});

export default NumberInput;
