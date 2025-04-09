import React, { useEffect, useState } from "react";
import { View, Text, TouchableNativeFeedback } from "react-native";
import FaModalComp from "./FaModalComp";

const FaCountModal = ({
  initValue,
  item,
  handleConfirm,
  isCancel,
  fontColor,
}) => {
  //展示数;
  const [count, setCount] = useState(0);
  //编辑数;
  const [editCount, setEditCount] = useState(initValue ?? 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [color, setColor] = useState("#004D92");

  useEffect(() => {
    setCount(initValue ?? 0);
    setEditCount(initValue ?? 0);
  }, [initValue]);

  const handleOpenModal = () => {
    if (!isCancel) {
      setModalVisible(true);
      setEditCount(count);
    }
  };

  const onIncrement = () => {
    const newCount = Number((Number(editCount) + 1).toFixed(4));
    setEditCount(newCount);
  };

  const onDecrement = () => {
    const newCount = Number((Number(editCount) - 1).toFixed(4));
    if (newCount == -1) {
      return;
    }
    setEditCount(newCount);
  };
  const onChangeText = (value) => {
    const regex = /^\d*\.?\d{0,4}$/;
    if (regex.test(value)) {
      setEditCount(value);
    }
  };

  const onConfirm = () => {
    if (editCount <= 0) {
      setCount(0);
      setEditCount(0);
      handleConfirm(0, item);
      setModalVisible(false);
      setColor("#E28400");
      return;
    } else {
      setCount(editCount);
      handleConfirm(editCount, item);
      setModalVisible(false);
      setColor("#E28400");
    }
  };

  const onClose = () => {
    if (editCount == 0) {
      setCount((x) => x);
      setModalVisible(false);
      return;
    }
    setModalVisible(false);
  };

  return (
    <TouchableNativeFeedback onPress={() => handleOpenModal()}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: isCancel ? "rgb(170,170,170)" : color,
            }}
          >
            {count.toString().length > 5
              ? `${count.toString().substring(0, 4).trim()}..`
              : count}
          </Text>
        </View>
        <FaModalComp
          count={editCount}
          modalVisible={modalVisible}
          onChangeText={onChangeText}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          handleOpenModal={handleOpenModal}
          onConfirm={onConfirm}
          onClose={onClose}
        ></FaModalComp>
      </View>
    </TouchableNativeFeedback>
  );
};
export default FaCountModal;
