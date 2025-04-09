import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableNativeFeedback,
} from "react-native";
import { rpx2dp } from "src/functions/responsive";
const Select = ({ options, selectedLabel, onValueChange, width }) => {
  const [visible, setVisible] = useState(false);

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  const onOptionSelect = (value, label) => {
    onValueChange(value, label);
    setVisible(false);
  };

  return (
    <View>
      <TouchableNativeFeedback onPress={toggleDropdown}>
        <View style={styles.dropdownButton}>
          <Text style={styles.dropdownButtonText}>
            {selectedLabel || "叉车拣货任务"}
          </Text>
          {visible ? (
            <View style={styles.dropdownArrow}>
              <Text style={styles.dropdownArrowText}>▼</Text>
            </View>
          ) : (
            <View style={styles.dropdownArrow}>
              <Text style={styles.dropdownArrowText}>◀</Text>
            </View>
          )}
        </View>
      </TouchableNativeFeedback>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={toggleDropdown}
        />
        <ScrollView style={styles.modalContent}>
          {options.map((option, index) => (
            <TouchableOpacity
              activeOpacity={0.7}
              delayPressIn={5}
              delayPressOut={15}
              key={index}
              style={styles.optionButton}
              onPress={() => onOptionSelect(option.value, option.label)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: rpx2dp(10),
    backgroundColor: "#F6F6F6",
    borderRadius: rpx2dp(4),
    width: rpx2dp(165),
    height: rpx2dp(45),
  },
  dropdownButtonText: {
    fontSize: rpx2dp(15),
  },
  dropdownArrow: {
    width: rpx2dp(20),
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownArrowText: {
    fontSize: rpx2dp(10),
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    width: rpx2dp(165),
    position: "absolute",
    top: rpx2dp(105, false),
    left: rpx2dp(20),
    backgroundColor: "#fff",
    borderWidth: rpx2dp(1),
    borderColor: "#ccc",
    borderRadius: rpx2dp(4),
  },
  optionButton: {
    padding: rpx2dp(10),
    height: rpx2dp(50),
    borderBottomWidth: rpx2dp(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: rpx2dp(15),
  },
});

export default Select;
