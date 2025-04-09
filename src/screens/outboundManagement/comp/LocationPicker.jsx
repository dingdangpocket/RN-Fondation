import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Image,
  TouchableNativeFeedback,
} from "react-native";
import BottomConfirmButton from "./BottomConfirmButton";
import { ContentContext } from "src/context/ContextProvider";
import fetchLocationData from "src/api/fetchLocationData";
import { rpx2dp, h, w } from "src/functions/responsive";

// 封装的可复用选择列表组件
const SelectableList = ({ data, onSelect, selectedItem }) => (
  <View style={styles.listContainer}>
    <FlatList
      data={data}
      keyExtractor={(item, index) => item.code.toString()} // 确保每一项都有唯一的 key
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onSelect(item)}
          style={[
            styles.listItem,
            selectedItem.areaName === item.areaName && styles.selectedItem, // 确保选中项样式被应用
          ]}
        >
          <Text
            style={[
              styles.listItemText,
              selectedItem.areaName === item.areaName &&
                styles.selectedItemText,
            ]}
          >
            {item.areaName}
          </Text>
        </TouchableOpacity>
      )}
    />
  </View>
);

const LocationPicker = ({ visible, onConfirm, onClose }) => {
  const { ctxState } = useContext(ContentContext);

  const [province, setProvince] = useState({ areaName: "", code: "" }); // 省份
  const [city, setCity] = useState({ areaName: "", code: "" }); // 城市
  const [district, setDistrict] = useState({ areaName: "", code: "" }); // 区县

  const [provinceData, setProvinceData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [districtData, setDistrictData] = useState([]);

  useEffect(() => {
    fetchAddressData(1, setProvinceData); // 初始化时获取省份数据
  }, []);
  useEffect(() => {
    if (!visible) {
      setProvince({ areaName: "", code: "" });
      setCity({ areaName: "", code: "" });
      setDistrict({ areaName: "", code: "" });
    }
  }, [visible]);

  const fetchAddressData = async (parentId, setData) => {
    const res = await fetchLocationData(
      { token: ctxState?.userInfo?.token },
      parentId
    );
    if (res?.code === 200) {
      console.log("res.data", res.data);
      setData(res.data);
    }
  };

  // 处理选择逻辑
  const handleSelect = (item, level) => {
    console.log("item1", item);
    if (level === "province") {
      console.log("item2", item);
      setProvince({ areaName: item.areaName, code: item.code });
      setCity({ areaName: "", code: "" }); // 重置城市
      setDistrict({ areaName: "", code: "" }); // 重置区县
      setCityData([]); // 清空城市数据
      setDistrictData([]); // 清空区县数据
      fetchAddressData(item.code, setCityData); // 获取城市数据
    } else if (level === "city") {
      setCity({ areaName: item.areaName, code: item.code });
      setDistrict({ areaName: "", code: "" }); // 重置区县
      setDistrictData([]); // 清空区县数据
      fetchAddressData(item.code, setDistrictData); // 获取区县数据
    } else if (level === "district") {
      setDistrict({ areaName: item.areaName, code: item.code });
    }
  };

  // 确认选择
  const handleConfirm = () => {
    onConfirm({
      province: province.areaName,
      city: city.areaName,
      district: district.areaName,
      provinceCode: province.code,
      cityCode: city.code,
      districtCode: district.code,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.titleView}>
            <Text style={styles.title}>选择省市区</Text>
            <TouchableNativeFeedback onPress={() => onClose()}>
              <Image
                source={require("../../../static/X.png")}
                style={{ height: 20, width: 20 }}
              />
            </TouchableNativeFeedback>
          </View>
          <View style={styles.header}>
            <View style={styles.litsItemView}>
              <Text style={styles.title}>省份</Text>
              <SelectableList
                data={provinceData} // 显示省份列表
                onSelect={(item) => handleSelect(item, "province")}
                selectedItem={province}
              />
            </View>
            <View style={styles.litsItemView}>
              <Text style={styles.title}>城市</Text>
              <SelectableList
                data={cityData} // 显示城市列表
                onSelect={(item) => handleSelect(item, "city")}
                selectedItem={city}
              />
            </View>
            <View>
              <Text style={styles.title}>区县</Text>
              <SelectableList
                data={districtData} // 显示区县列表
                onSelect={(item) => handleSelect(item, "district")}
                selectedItem={district}
              />
            </View>
          </View>
          <BottomConfirmButton title="确认" onPress={handleConfirm} />
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
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 16,
    height: rpx2dp(500, false),
    position: "absolute",
    bottom: 0,
  },
  titleView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: rpx2dp(24, false),
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    height: rpx2dp(24, false),
    lineHeight: rpx2dp(24, false),
    color: "#222222",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 50,
    paddingVertical: 20,
  },
  litsItemView: {
    flex: 1,
  },
  listContainer: {
    height: rpx2dp(300, false), // 调整此值来增加或减少显示的项目数量
  },
  listItem: {
    paddingVertical: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedItem: {},
  selectedItemText: {
    color: "#007bff", // PrimaryText颜色
    fontWeight: "bold",
  },
});

export default LocationPicker;
