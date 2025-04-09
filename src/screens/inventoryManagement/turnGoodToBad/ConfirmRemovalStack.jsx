import { StyleSheet, Text, View } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  NormalText,
  GrayText,
} from "../../outboundManagement/comStyle";
import { useNavigation } from "@react-navigation/native";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import Divider from "src/screens/outboundManagement/comp/Divider";
import NumberInput from "src/screens/outboundManagement/comp/NumberInput";
import BottomConfirmButton from "src/screens/outboundManagement/comp/BottomConfirmButton";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import getTimeId from "src/functions/getTimeId";
import CustomSelect from "src/screens/outboundManagement/comp/CustomSelect";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
const ConfirmRemovalStack = ({ route }) => {
  const { data, itemData } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [count, setCount] = useState(itemData?.usableNum ?? 0);
  const navigation = useNavigation();
  const [idempotentKey, setIdempotentKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const options = [
    { label: "生锈", value: "生锈" },
    { label: "缺配件", value: "缺配件" },
    { label: "混料", value: "混料" },
    { label: "批次不一致", value: "批次不一致" },
    { label: "来料不良", value: "来料不良" },
    { label: "退库不良", value: "退库不良" },
    { label: "短料", value: "短料" },
  ];
  useEffect(() => {
    setIdempotentKey(getTimeId());
  }, []);

  const handleSelectChange = (value) => {
    setSelectedValue(value);
  };
  const onPress = async () => {
    if (count <= 0) {
      notification.open({ message: "请输入有效的下架数量" });
      return;
    }

    setIsLoading(true);

    const res = await fetchData({
      path: "/inside/qualityToDefective/takeDown",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        sourceStorageBinId: data?.storageBinId,
        idempotentKey,
        skus: [
          {
            skuId: itemData.skuId,
            num: count,
            skuName: itemData.skuName,
            unit: itemData.unit,
            reason: selectedValue,
            goodsOwnerId: itemData?.goodsOwnerId,
          },
        ],
      },
    });

    if (res?.code === 200) {
      notification.open({ message: "下架成功", type: "success" });
      setTimeout(() => {
        navigation.navigate("TurnGoodToBadStack");
      }, 1000);
    } else {
      notification.open({ message: res?.msg || "下架失败" });
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Notification />
      <CustomContainer>
        <CustomCard widthFactor={0.95}>
          <View style={CardTopView}>
            <AlertText
              style={PrimaryText}
              text={itemData?.skuName}
              showLength={30}
            />
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={itemData?.skuId} showLength={30} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>货主</Text>
            <Text style={NormalText}>{itemData?.goodsOwner}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>下架货位</Text>
            <Text style={NormalText}>{data?.storageBinCode || ""}</Text>
          </View>
        </CustomCard>
        <CustomCard widthFactor={0.95}>
          <View style={CardBottomView}>
            <Text style={GrayText}>可下架出库</Text>
            <Text style={CountText}>
              {itemData?.usableNum ?? 0} {itemData?.unit}
            </Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>下架数量（个）</Text>
            <NumberInput
              initialValue={itemData?.usableNum ?? 0}
              value={count}
              onChangeValue={setCount}
              maxValue={itemData?.usableNum ?? 0}
            />
          </View>
          {/* <View
            style={{ ...CardBottomView, alignItems: "center", marginTop: 10 }}
          >
            <Text style={GrayText}>下架原因</Text>
            <CustomSelect
              options={options}
              defaultValue=""
              onChange={handleSelectChange}
            />
          </View> */}
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton title="确认下架" onPress={onPress} />
    </View>
  );
};

export default ConfirmRemovalStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
