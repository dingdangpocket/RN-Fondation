import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomCard from "../comp/CustomCard";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  NormalText,
  GrayText,
} from "../comStyle";
import CustomPageHeader from "../comp/CustomPageHeader";
import CustomContainer from "../comp/CustomContainer";
import Divider from "../comp/Divider";
import AlertText from "../comp/AlertText";
const DropLocationStack = ({ route }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <CustomPageHeader title={item?.skuName} />
      <CustomContainer>
        <CustomCard height={250} widthFactor={0.95}>
          <View style={CardTopView}>
            <Text style={GrayText}>产品名称</Text>
            <AlertText text={item?.skuName} />
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>落放位编码</Text>
            <Text style={PrimaryText}>{item?.dropLocationCode || "xxxx"}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>拣货作业单号</Text>
            <Text style={NormalText}>{item?.pickingNoteNo}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>实拣/应拣</Text>
            <Text
              style={NormalText}
            >{`${item?.pickingNum}/${item?.expectNum} ${item?.unit}`}</Text>
          </View>
        </CustomCard>
      </CustomContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DropLocationStack;
