import { StyleSheet, Text, View } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  NormalText,
  GrayText,
} from "../outboundManagement/comStyle";
import { useNavigation } from "@react-navigation/native";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import Divider from "src/screens/outboundManagement/comp/Divider";
import NumberInput from "src/screens/outboundManagement/comp/NumberInput";
import BottomConfirmButton from "../outboundManagement/comp/BottomConfirmButton";
import CustomPageHeader from "../outboundManagement/comp/CustomPageHeader";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "../outboundManagement/comp/Notification";
import CustomSelect from "../outboundManagement/comp/CustomSelect";
const PassageDetailSkUItemStack = ({ route }) => {
  const { countNoteBinDetailId, storageBinCode, data } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [count, setCount] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const goodsOwnerArr = data?.goodsOwner?.map((item) => {
      return {
        value: item.goodsOwnerId,
        label: item.goodsOwnerName ? item.goodsOwnerName : item.goodsOwnerId,
      };
    });
    console.log("goodsOwnerArr", goodsOwnerArr);
    setOptions(goodsOwnerArr);
    // 若货主只有一个则直接选中展示
    if (goodsOwnerArr?.length === 1) {
      setSelectedValue(goodsOwnerArr[0]);
    }
  }, []);
  const onViewpage = (name) => {
    navigation.navigate(name);
  };
  const onSelectChange = (value) => {
    const findData = options.find((item) => item.value === value);
    setSelectedValue(findData);
  };
  const onSubmit = async () => {
    // 数量可以为0
    // if (count === 0) {
    //   notification.open({ message: "请输入盘点数量" });
    //   return;
    // }
    const res = await fetchData({
      path: "/inside/count/submitSku",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        countNoteBinDetailId,
        skuId: data?.skuId,
        skuName: data?.skuName,
        goodsOwnerId: selectedValue.value,
        goodsOwnerName: selectedValue.label,
        countNum: count,
        inventoryUnit: data?.inventoryUnit,
      },
    });
    if (res?.code === 200) {
      notification.open({ message: "提交成功", type: "success" });
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader title={storageBinCode} />
      <CustomContainer>
        <CustomCard
          widthFactor={0.95}
          customStyle={{ position: "relative", zIndex: 22 }}
          // onPress={() => onViewpage("SKUSelectionStack")}
        >
          <View style={CardTopView}>
            <AlertText
              text={data.skuName}
              style={PrimaryText}
              showLength={30}
            />
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={data?.skuId} showLength={30} />
          </View>
          {/* <View style={CardBottomView}>
            <Text style={GrayText}>规格</Text>
            <Text style={NormalText}>xxxx</Text>
          </View> */}
          <View style={CardBottomView}>
            <Text style={GrayText}>货主</Text>
            <CustomSelect
              options={options}
              onChange={onSelectChange}
              value={selectedValue?.value}
              placeholder="请选择货主"
            />
          </View>
        </CustomCard>
        <CustomCard
          widthFactor={0.95}
          customStyle={{
            top: 180,
            position: "absolute",
            zIndex: 1,
            // elevation: 4,
          }}
        >
          <View style={CardBottomView}>
            <Text style={GrayText}>盘点数量 ({data?.inventoryUnit})</Text>
            <NumberInput
              initialValue={data.count}
              value={count}
              onChangeValue={setCount}
              maxValue={999999999}
              type="float"
            />
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton title="提交" onPress={onSubmit} />
    </View>
  );
};

export default PassageDetailSkUItemStack;

const styles = StyleSheet.create({});
