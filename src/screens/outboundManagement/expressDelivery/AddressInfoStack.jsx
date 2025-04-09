import { Text, View, Image, TouchableNativeFeedback } from "react-native";
import React, { useContext, useState,useEffect,useCallback } from "react";
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import { CardBottomView, NormalText } from "../comStyle";
import RIghtArrowIconView from "../comp/RIghtArrowIconView";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import CustomInput from "../comp/CustomInput";
import LocationPicker from "../comp/LocationPicker";
import CustomPageHeader from "../comp/CustomPageHeader";
const AddressInfoStack = ({ route }) => {
  const { deliveryNoteId, packageNo, addressInfoData } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [consignee, setConsignee] = useState("");
  const [tel, setTel] = useState("");
  const [cityAreaNo, setCityAreaNo] = useState(0);
  const [address, setAddress] = useState("");
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({});
  const navigation = useNavigation();
   
  
  useFocusEffect(
    useCallback(() => {
      if (addressInfoData) {
        initData(addressInfoData);
      }
    }, [addressInfoData])
  );
 
  const initData = (infoData) => { 
    setConsignee(infoData.consignee);
    setTel(infoData.tel);
    setAddress(infoData.address);
    // setCityAreaNo(infoData.cityAreaNo);
    // setSelectedLocation({
    //   provinceCode: infoData.provinceId,
    //   province: infoData.provinceName,
    //   cityCode: infoData.cityId,
    //   city: infoData.cityName,
    //   districtCode: infoData.districtId,
    //   district: infoData.districtName,
    // });
  }
  const onLocation = () => {
    setPickerVisible(true);
  };
  const handleLocationConfirm = (location) => {
    // console.log("选中的位置:", location);
    setSelectedLocation(location);
  };
  const checkMap = [
    { data: consignee, tip: "收货人不得为空!", key: "user" },
    { data: tel, tip: "收货电话不得为空!", key: "tel" },
    { data: selectedLocation, tip: "省市区不得为空!", key: "location" },
    { data: address, tip: "详细地址不得为空!", key: "address" },
  ];
  const onSave = async () => {
    // 信息为空校验
    for (const item of checkMap) {
      if (!item.data) {
        notification.open({ message: item.tip });
        return;
      } else {
        // 手机号校验
        if (item.key === "tel") {
          // 手机号校验：必须为11位数字，且第一位为1
          const phoneRegex = /^1\d{10}$/;
          if (!phoneRegex.test(tel)) {
            notification.open({ message: "手机号格式不正确！" });
            return;
          }
        }
        // 省市区校验
        if (item.key === "location") {
          const locationTip = [
            { key: "provinceCode", tip: "省" },
            { key: "cityCode", tip: "市" },
            { key: "districtCode", tip: "区县" },
          ];
          for (const ele of locationTip) {
            if (!selectedLocation?.[ele.key]) {
              notification.open({ message: ele.tip + "数据不得为空" });
              return;
            }
          }
        }
      }
    }

    const res = await fetchData({
      path: "/outbound/expressDelivery/modifyAddress",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.expressDeliveryOpt?.taskId,
        deliveryNoteId,
        consignee,
        tel,
        cityAreaNo,
        address,
        provinceId: selectedLocation?.provinceCode,
        provinceName: selectedLocation?.province,
        cityId: selectedLocation?.cityCode,
        cityName: selectedLocation?.city,
        districtId: selectedLocation?.districtCode,
        districtName: selectedLocation?.district,
      },
    });
    if (res?.code === 200) {
      // 跳转过去需要再次获取data数据，更新地址数据,to do
      navigation.navigate("ExpressDeliveryDetailStack");
    } else {
      notification.open({ message: res?.msg });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <LocationPicker
        onConfirm={handleLocationConfirm}
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
      />
      <CustomPageHeader title={packageNo} />
      <CustomContainer>
        <CustomCard height={52} widthFactor={0.95}>
          <View style={{ ...CardBottomView, marginTop: 0 }}>
            <Text style={NormalText}>收货人</Text>
            <CustomInput
              placeholder={"请输入"}
              value={consignee}
              onChange={setConsignee}
            />
          </View>
        </CustomCard>
        <CustomCard height={52} widthFactor={0.95}>
          <View style={{ ...CardBottomView, marginTop: 0 }}>
            <Text style={NormalText}>收货电话</Text>
            <CustomInput placeholder={"请输入"} value={tel} onChange={setTel} />
          </View>
        </CustomCard>
        <CustomCard height={52} widthFactor={0.95}>
          {selectedLocation?.provinceCode ? (
            <View style={{ ...CardBottomView, marginTop: 0 }}>
              <Text style={NormalText}>省市区</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={NormalText}>{selectedLocation?.province}</Text>
                <Text style={{ ...NormalText, marginLeft: 10 }}>
                  {selectedLocation?.city}
                </Text>
                <Text style={{ ...NormalText, marginLeft: 10 }}>
                  {selectedLocation?.district}
                </Text>
                <TouchableNativeFeedback onPress={onLocation}>
                  <Image
                    style={{ width: 16, height: 16, marginLeft: 10 }}
                    source={require("../../../static/rightArrow.png")}
                  />
                </TouchableNativeFeedback>
              </View>
            </View>
          ) : (
            <RIghtArrowIconView
              height={28}
              paddingVertical={4}
              onRightPress={onLocation}
            >
              <Text style={NormalText}>省市区</Text>
            </RIghtArrowIconView>
          )}
        </CustomCard>
        <CustomCard widthFactor={0.95}>
          <View style={{ ...CardBottomView, marginTop: 0 }}>
            <Text style={NormalText}>详细地址</Text>
          </View>
          <CustomInput
            multiline
            value={address}
            onChange={setAddress}
            placeholder={"请输入"}
          />
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton title="保存" onPress={onSave} />
    </View>
  );
};

export default AddressInfoStack;
