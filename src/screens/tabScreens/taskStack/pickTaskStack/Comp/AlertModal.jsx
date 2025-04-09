import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Button,
  TextInput,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { IncrementIcon, DecrementIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
const { width, height } = Dimensions.get("window");

const LostModal = ({
  modalVisible,
  handleCloseModal,
  handleConfirm,
  info,
  resultDone,
  count,
  onDecrement,
  onIncrement,
  onChangeText,
}) => {
  useEffect(() => {
    console.log("info", info, resultDone);
  }, []);
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Modal
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View
          style={{
            width: 300,
            height: 200,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
            padding: 10,
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            marginTop: 270,
            marginLeft: width * 0.13,
            backgroundColor: "rgb(250,250,250)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>实拣</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableWithoutFeedback onPress={() => onDecrement()}>
                <View
                  style={{
                    backgroundColor: "rgb(220,220,220)",
                    height: 40,
                    width: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <DecrementIcon width={"30%"} height={"30%"}></DecrementIcon>
                </View>
              </TouchableWithoutFeedback>
              <TextInput
                style={{ width: 70, fontSize: 28 }}
                value={String(count)}
                keyboardType="number-pad"
                onChangeText={onChangeText}
              />
              <TouchableWithoutFeedback onPress={() => onIncrement()}>
                <View
                  style={{
                    backgroundColor: "rgb(220,220,220)",
                    height: 40,
                    width: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IncrementIcon width={"30%"} height={"30%"}></IncrementIcon>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View
            style={{
              width: 200,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 20,
            }}
          >
            <CustomButton
              title="取消"
              titleColor="white"
              fontSize={16}
              width={80}
              height={50}
              backgroundColor="#004D92"
              borderRadius={2.5}
              marginTop={10}
              align={{
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleCloseModal}
            />
            <CustomButton
              title="确认拣货"
              titleColor="white"
              padding={10}
              fontSize={16}
              width={80}
              height={50}
              backgroundColor="#004D92"
              borderRadius={2.5}
              marginTop={10}
              align={{
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleConfirm}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LostModal;
