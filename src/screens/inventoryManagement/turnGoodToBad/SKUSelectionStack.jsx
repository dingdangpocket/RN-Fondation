import { Image, StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import {
  CardBottomView,
  NormalText,
  GrayText,
  CardTopView,
  PrimaryText,
} from "../../outboundManagement/comStyle";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import ScanBox from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import leftArrowIcon from "../../../static/blackLeftArrow.png";
import CustomPageHeader from "src/screens/outboundManagement/comp/CustomPageHeader";
import getScanText from "src/functions/getScanText";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import Divider from "src/screens/outboundManagement/comp/Divider";
import { rpx2dp, h, w } from "src/functions/responsive";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
const SKUSelectionStack = ({ route }) => {
  const { data } = route.params;
  const navigation = useNavigation();
  const [reTake, setRetake] = useState(false);
  const [filteredSkus, setFilteredSkus] = useState(data?.skus || []);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    const foundSku = data?.skus?.find(
      (sku) => sku.skuName === scanText || sku.skuId === scanText
    );
    if (foundSku) {
      onViewpage(foundSku);
    } else {
      notification.open({ message: "未找到匹配的SKU" });
    }
  };

  // 去确认下架详情页
  const onViewpage = (item) => {
    navigation.navigate("ConfirmRemovalStack", { data, itemData: item });
  };

  const renderItem = ({ item }) => (
    <CustomCard widthFactor={0.95} onPress={() => onViewpage(item)}>
      <View style={CardTopView}>
        <Text style={PrimaryText}>{item?.skuName}</Text>
        <Image source={leftArrowIcon} style={styles.img} />
      </View>
      <Divider />
      <View style={CardBottomView}>
        <Text style={GrayText}>产品型号</Text>
        <AlertText text={item?.skuId} showLength={30} />
      </View>
    </CustomCard>
  );

  return (
    <View style={styles.container}>
      <Notification />
      <CustomPageHeader title={data?.storageBinCode} />
      <ScanBox
        placeholder="请扫描项次码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={filteredSkus}
          renderItem={renderItem}
          keyExtractor={(item, idx) => idx}
          contentContainerStyle={styles.listContainer}
        />
      </CustomContainer>
    </View>
  );
};

export default SKUSelectionStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },

  img: {
    width: rpx2dp(7),
    height: rpx2dp(13, false),
  },
});
