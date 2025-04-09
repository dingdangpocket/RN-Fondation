import React, { useState, useRef, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { rpx2dp, h, w } from "src/functions/responsive";
let selectInstance = null;
const CustomSelect = ({
  options,
  defaultValue,
  onChange,
  placeholder = "",
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultValue || options[0]?.value
  ); // 直接使用默认值或第一个选项的值
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);
  const handleOptionClick = (value) => {
    setSelectedOption(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.customSelect} ref={selectRef}>
      <TouchableOpacity style={styles.selectHeader} onPress={toggleDropdown}>
        <Text>
          {selectedOption
            ? options.find((opt) => opt.value === selectedOption)?.label
            : placeholder}
        </Text>
        <Text style={styles.arrow}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.selectDropdown}>
          {options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.selectOption,
                selectedOption === option.value ? styles.selected : null,
              ]}
              onPress={() => handleOptionClick(option.value)}
            >
              <Text>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  customSelect: {
    position: "relative",
    // width: rpx2dp(150),
    zIndex: 1,
    // flexDirection: "row",
    // alignItems: "center",
  },
  selectHeader: {
    paddingHorizontal: 10,
    borderColor: "#ccc",
    cursor: "pointer",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arrow: {
    marginLeft: 10,
  },
  selectDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    zIndex: 9999,
    elevation: 5,
  },
  selectOption: {
    padding: 10,
    cursor: "pointer",
  },
  selectOptionHover: {
    backgroundColor: "#f0f0f0",
  },
  selected: {
    backgroundColor: "#dcdcdc",
  },
});
export default CustomSelect;
