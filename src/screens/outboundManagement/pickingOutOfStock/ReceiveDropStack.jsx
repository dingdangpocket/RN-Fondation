import { Image, StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useContext, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScanBox from "../comp/ScanBox";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomContainer from "../comp/CustomContainer";
import AlertText from "../comp/AlertText";
import CustomPageHeader from "../comp/CustomPageHeader";
import {
  CardBottomView,
  CountText,
  GrayText,
  PrimaryText,
  NormalText,
  CardTopView,
  GreenDashView,
  GreenText,
  WarnText,
  WarnView,
} from "../comStyle";
import Notification, { notification } from "../comp/Notification";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import getScanText from "src/functions/getScanText";

const ReceiveDropStack = ({ route }) => {
  const { itemData, taskId,pickNum } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState({});
  const [highlight, setHighlight] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const navigation = useNavigation();
  // 获取落放位置数据
  const getData = async () => {
    try {
      const res = await fetchData({
        path: "/outbound/stockoutPicking/getPlacementBin",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: { taskId },
      });
      console.log("res", res);
      if (res?.code === 200) {
        setData(res.data);
        setAreaCode(res?.data?.areaCode);
      } else {
        notification.open({ message: res?.msg || "获取数据失败" });
      }
    } catch (error) {
      console.error("getData error:", error);
      notification.open({ message: "获取数据出错，请重试" });
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );
  // 确认落放操作
  const onPress = async () => {
    if (!highlight) {
      notification.open({ message: "请先选择落放位置" });
      return;
    }
    try {
      const res = await fetchData({
        path: "/outbound/stockoutPicking/placement",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          taskId,
          storageBinCode: highlight,
          storageAreaType: areaCode,
        },
      });
      if (res?.code === 200) {
        notification.open({ message: "落放成功", type: "success" });
        setTimeout(() => {
          navigation.navigate("PickingOutOfStockStack");
        }, 1000);
      } else {
        notification.open({ message: res?.msg || "操作失败" });
      }
    } catch (error) {
      console.error("onPress error:", error);
      notification.open({ message: "操作出错，请重试" });
    }
  };

  // 处理扫描输入
  const onKeyEnter = useCallback(
    (input) => {
      handleScan(input, data.storageBinCode);
    },
    [data.storageBinCode]
  );

  // 处理扫描结果
  const handleScan = useCallback((input, list) => {
    const scanText = getScanText(input);
    const findData = list?.find((item) => item === scanText);
    if (!findData) {
      // 如果扫描的货位不在推荐列表中，添加到当前列表并高亮
      setData((prevData) => ({
        ...prevData,
        storageBinCode: [scanText, ...(prevData.storageBinCode || [])],
      }));
    }
    setHighlight(scanText);
  }, []);

  // 渲染单个落放位置项
  const renderStorageBinItem = useCallback(
    ({ item }) => (
      <CustomCard key={item} widthFactor={0.95}>
        <View
          style={{
            ...GreenDashView,
            ...(highlight === item ? { backgroundColor: "#DAF8CF" } : {}),
          }}
        >
          <Text style={GreenText}>落放位置编码{item}</Text>
          {highlight === item && (
            <Image
              source={require("../../../static/CheckCircle.png")}
              style={{ width: 20, height: 20 }}
            />
          )}
        </View>
      </CustomCard>
    ),
    [highlight]
  );

  return (
    <View style={styles.container}>
      <Notification />
      <CustomPageHeader title={itemData?.pickingNoteNo} />
      <ScanBox placeholder="请扫描落放位" onKeyEnter={onKeyEnter} />
      <CustomContainer>
        {/* 显示SKU信息 */}
        <CustomCard widthFactor={0.95}>
          <View style={CardTopView}>
            <AlertText
              text={itemData?.skuName}
              style={PrimaryText}
              showLength={30}
            />
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={itemData.skuId} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>数量</Text>
            <Text style={CountText}>
              {" "}
              {pickNum ? pickNum : itemData?.expectNum} {itemData?.unit}
            </Text>
          </View>
        </CustomCard>
        {/* 显示提示信息 */}
        {data?.noticeText && (
          <View style={WarnView}>
            {data?.source == 2 ? (
              <View
                style={{
                  position: "absolute", // 绝对定位
                  top: 0, // 角标距离顶部的距离
                  left: 0, // 角标距离右侧的距离
                  backgroundColor: "red", // 角标的背景颜色
                  padding: 5, // 角标的内边距
                  minWidth: 20, // 角标的宽度
                  textAlign: "center", // 角标文字居中
                  borderTopRightRadius: 10,
                  borderBottomEndRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontSize: 8 }}>预拣</Text>
              </View>
            ) : null}
            <Text style={WarnText}>{data.noticeText}</Text>
          </View>
        )}
        {data?.customerDepartment && (
          <View style={WarnView}>
            <Text style={WarnText}>申请部门-{data.customerDepartment}</Text>
          </View>
        )}
        {/* 落放位置列表 */}
        <FlatList
          data={data?.storageBinCode || []}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={renderStorageBinItem}
          keyExtractor={(item, idx) => item + idx}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>暂无落放位置</Text>
          )}
        />
      </CustomContainer>
      {/* 确认落放按钮 */}
      <BottomConfirmButton
        title="确认落放"
        onPress={onPress}
        disabled={!highlight}
      />
    </View>
  );
};

export default ReceiveDropStack;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
});
