import React from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { IncrementIcon, DecrementIcon } from "../icons/index";
import CustomButton from "src/components/CustomButton";
import { rpx2dp, h, w } from "src/functions/responsive";

const PrintModal = ({
  modalVisible,
  order,
  onIncrement,
  onDecrement,
  handleCloseModal,
  handleComfirm,
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
          <Text style={{ fontSize: 18, color: "black", marginBottom: 10 }}>
            打印份数
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgb(240,240,240)",
              height: 50,
            }}
          >
            <TouchableWithoutFeedback onPress={() => onDecrement()}>
              <View
                style={{
                  height: 50,
                  width: 40,
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
                fontSize: 25,
                textAlign: "center",
                color: "#E28400",
              }}
              value={
                !isNaN(order) && parseFloat(order) >= 1
                  ? String(order)
                  : String("")
              }
              onChangeText={onChangeText}
              keyboardType="number-pad"
            />
            <TouchableWithoutFeedback onPress={() => onIncrement()}>
              <View
                style={{
                  height: 50,
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
              justifyContent: "space-between",
            }}
          >
            <CustomButton
              title="取消"
              titleColor="black"
              fontSize={20}
              width={80}
              height={50}
              borderRadius={2.5}
              marginTop={10}
              align={{
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleCloseModal}
            />
            <CustomButton
              title="打印"
              titleColor="rgba(0, 77, 146, 1)"
              fontSize={20}
              width={80}
              height={50}
              borderRadius={2.5}
              marginTop={10}
              align={{
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleComfirm}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PrintModal;
