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
import { UncheckIcon, CheckIcon } from "src/icons/index";

import CustomButton from "src/components/CustomButton";
const { width, height } = Dimensions.get("window");

const LostModal = ({
  modalVisible,
  lostCount,
  onIncrement,
  onDecrement,
  handleCloseModal,
  handleOpenModal,
  handleConfirm,
  onChangeText,
  remenberMe,
  check,
}) => {
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
            backgroundColor: "white",
            borderRadius: 5,
            padding: 10,
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            marginTop: 270,
            marginLeft: width * 0.13,
          }}
        >
          <View style={styles.row}>
            <TouchableWithoutFeedback onPress={remenberMe}>
              <View style={{ width: 40, height: 40, padding: 10 }}>
                {check ? (
                  <CheckIcon width="120%" height="120%" />
                ) : (
                  <UncheckIcon width="120%" height="120%" />
                )}
              </View>
            </TouchableWithoutFeedback>
            <Text style={{ fontSize: 20 }}>是否提交{lostCount}个缺货拣货</Text>
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
              onPress={handleConfirm}
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

export default LostModal;
