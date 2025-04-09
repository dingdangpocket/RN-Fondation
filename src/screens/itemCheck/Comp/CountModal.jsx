import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableNativeFeedback,
  Image,
  TouchableOpacity,
} from "react-native";
import ModalComp from "src/components/ModalComp";
const ItemCheckCount = ({ getValue, unit, expectNum, value }) => {
  const [count, setCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (value) setCount(value);
  }, [value]);
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleOpenModal = () => {
    setModalVisible(true);
  };
  const onIncrement = (extUnit) => {
    if (expectNum) {
      if (Number(count) < Number(expectNum)) {
        const newCount = Number((Number(count) + 1).toFixed(4));
        setCount(newCount);
      } else return;
    } else {
      const newCount = Number((Number(count) + 1).toFixed(4));
      setCount(newCount);
    }
  };
  const onDecrement = (extUnit) => {
    const newCount = Number((Number(count) - 1).toFixed(4));
    if (newCount == -1) {
      return;
    }
    setCount(newCount);
  };
  const onChangeText = (value) => {
    const regex = /^\d*\.?\d{0,4}$/;
    if (regex.test(value)) {
      setCount(value);
    }
  };
  useEffect(() => {
    getValue(count, unit);
  }, [count]);

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
      <TouchableOpacity onPress={() => handleOpenModal()}>
        <View
          style={{
            width: 90,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: "#E28400" }}>{count}</Text>
        </View>
      </TouchableOpacity>
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
      <ModalComp
        count={count}
        modalVisible={modalVisible}
        onChangeText={onChangeText}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      ></ModalComp>
    </View>
  );
};
export default ItemCheckCount;
