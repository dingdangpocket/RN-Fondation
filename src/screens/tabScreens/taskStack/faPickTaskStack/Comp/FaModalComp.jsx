import React from "react";
import {
  View,
  Text,
  Dimensions,
  TextInput,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { IncrementIcon, DecrementIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
const { width, height } = Dimensions.get("window");
import { rpx2dp, h, w } from "src/functions/responsive";

const FaModalComp = ({
  modalVisible,
  count,
  onIncrement,
  onDecrement,
  handleCloseModal,
  handleOpenModal,
  onConfirm,
  onClose,
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
      >
        <View
          style={{
            width: rpx2dp(260),
            height: rpx2dp(180),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgb(235,235,235)",
            borderRadius: 10,
            padding: 10,
            shadowColor: "#000",
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 40,
            marginTop: h * 0.35,
            marginLeft: w * 0.16,
          }}
        >
          <Text style={{ fontSize: 18, color: "black" }}>修改拣货数量</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: 50,
              backgroundColor: "rgb(230,230,230)",
              borderRadius: 5,
              marginTop: 5,
            }}
          >
            <TouchableWithoutFeedback onPress={() => onDecrement()}>
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DecrementIcon width={"30%"} height={"30%"}></DecrementIcon>
              </View>
            </TouchableWithoutFeedback>

            <TextInput
              style={{
                width: 100,
                height: 50,
                fontSize: 23,
                textAlign: "center",
                borderColor: "black",
                color: "rgba(0, 77, 146, 1)",
                textAlign: "center",
              }}
              value={
                !isNaN(count) && parseFloat(count) >= 0
                  ? String(count)
                  : String("")
              }
              keyboardType="number-pad"
              onChangeText={onChangeText}
            />
            <TouchableWithoutFeedback onPress={() => onIncrement()}>
              <View
                style={{
                  height: 50,
                  width: 50,
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
              justifyContent: "space-between",
            }}
          >
            <CustomButton
              title="取消"
              titleColor="black"
              fontSize={18}
              width={75}
              height={45}
              // backgroundColor="#004D92"
              borderRadius={2.5}
              marginTop={10}
              align={{
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onClose}
            />
            <CustomButton
              title="确认"
              titleColor="rgba(0, 77, 146, 1)"
              fontSize={18}
              width={75}
              height={45}
              // backgroundColor="#004D92"
              borderRadius={2.5}
              marginTop={10}
              align={{
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onConfirm}
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

export default FaModalComp;
