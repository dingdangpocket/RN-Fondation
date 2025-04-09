import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const CheckBox = () => {
  const [isChecked, setIsChecked] = useState(false);
  const handlePress = () => {
    setIsChecked(!isChecked);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.checkboxContainer,
          { backgroundColor: isChecked ? "blue" : "white" },
        ]}
        onPress={handlePress}
      >
        {isChecked && <View style={styles.checkboxChecked} />}
      </TouchableOpacity>
      <Text style={styles.label}>
        {isChecked ? "复选框已选中" : "复选框未选中"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    backgroundColor: "white",
  },
  label: {
    fontSize: 18,
    margin: 10,
  },
});

export default CheckBox;
