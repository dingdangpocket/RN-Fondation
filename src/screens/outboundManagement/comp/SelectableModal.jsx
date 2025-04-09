import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableNativeFeedback,
  Image,
} from "react-native";

const SelectableModal = ({ visible, onClose, options, value, setValue }) => {
  const [selectedItem, setSelectedItem] = useState(value);

  useEffect(() => {
    setSelectedItem(value);
  }, [value]);
  const handleSelect = (item) => {
    setSelectedItem(item); // 更新选中的项
  };

  const handleConfirm = () => {
    setValue(selectedItem); // 设置值
    onClose(); // 关闭弹框
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.titleView}>
            <Text style={styles.title}>选择选项</Text>
            <TouchableNativeFeedback onPress={onClose}>
              <Image
                source={require("../../../static/X.png")}
                style={{ height: 20, width: 20 }}
              />
            </TouchableNativeFeedback>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                  styles.listItem,
                  selectedItem?.value === item?.value && styles.selectedItem,
                ]}
              >
                <Text
                  style={[
                    styles.listItemText,
                    selectedItem?.value === item?.value &&
                      styles.selectedItemText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  titleView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
  },
  listItem: {
    paddingVertical: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedItem: {
    backgroundColor: "#e0f7fa", // 高亮背景
  },
  selectedItemText: {
    color: "#007bff", // 高亮字体颜色
    fontWeight: "bold",
  },
  confirmButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#004D92",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SelectableModal;
