import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableNativeFeedback,
} from "react-native";
import { CheckIcon } from "src/icons"; // 引入自定义的SVG图标

const Checkbox = ({ label, checked: initialChecked = false, onChange }) => {
  const [checked, setChecked] = useState(initialChecked);

  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked]);
  const handlePress = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <TouchableNativeFeedback onPress={handlePress} style={styles.container}>
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <CheckIcon width={14} height={14} style={styles.icon} />}
        </View>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderRadius: 3, // 圆角优化
  },
  checkboxChecked: {
    // backgroundColor: "#007AFF",
  },
  icon: {
    width: 14,
    height: 14,
  },
  label: {
    fontSize: 16,
  },
});

export default Checkbox;
