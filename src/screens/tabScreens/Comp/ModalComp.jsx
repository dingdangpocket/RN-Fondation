import React, { useState } from "react";
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
import { IncrementIcon, DecrementIcon } from "src/icons";
import CustomButton from "src/components/CustomButton";
const { width, height } = Dimensions.get("window");

const ModalComp = ({
  modalVisible,
  count,
  onIncrement,
  onDecrement,
  handleCloseModal,
  handleOpenModal,
  onChangeText,
}) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Modal
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {}}
      >
        <View
          style={{
            width: 260,
            height: 160,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 5,
            padding: 10,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            marginTop: 270,
            marginLeft: width * 0.19,
          }}
        >
          <Text>修改拣货数量</Text>
          <View style={styles.row}>
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
              keyboardType="numeric"
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
          <View
            style={{
              width: 200,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <CustomButton
              title="取消"
              titleColor="white"
              fontSize={18}
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
              title="确认"
              titleColor="white"
              fontSize={18}
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
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 360,
    height: 400,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    width: 130,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default ModalComp;
