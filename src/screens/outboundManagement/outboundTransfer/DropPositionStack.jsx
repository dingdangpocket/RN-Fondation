import { Text, View, FlatList } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import ScanBox from "../comp/ScanBox";
import CustomCard from "../comp/CustomCard";
import CustomContainer from "../comp/CustomContainer";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import Divider from "../comp/Divider";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  CardTopView,
  CardBottomView,
  CountText,
  GrayText,
  PrimaryText,
  NormalText,
} from "../comStyle";
import CustomModal from "../comp/CustomModal";
import Notification, { notification } from "../comp/Notification";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import getScanText from "src/functions/getScanText";
import CustomPageHeader from "../comp/CustomPageHeader";
import AlertText from "../comp/AlertText";
const DropPositionStack = ({ route }) => {
  const { taskId, taskNo } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [curSku, setCurSku] = useState("");
  const [highlightSkus, setHighlightSkus] = useState([]);
  const [curSkuName, setCurSkuName] = useState("");
  const navigation = useNavigation();
  // 聚焦输入框
  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    getData(taskId);
  }, [taskId]);
  // 获取任务详情
  const getData = async (taskId) => {
    const res = await fetchData({
      path: "/outbound/collectedMove/getTaskDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskId },
      // onNav: navigation.navigate("Login"),
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  const handleConfirm = (input, type) => {
    const value = type === "scan" ? input : curSku;
    const findData = data?.find((item) => item.objectNo === value);
    if (findData) {
      setHighlightSkus((arr) => [...arr, value]);
    } else {
      notification.open({ message: "已扫描的项次不在出库集合任务中!" });
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
  // 全部转移
  const onPress = () => {
    // 转移id列表
    const ids = data.map((item) => item.taskId);
    navigation.navigate("ContainerCodeStack", {
      taskId,
      ids,
    });
  };
  // 扫描或输入时不展示 确认识别的弹框
  const onKeyEnter = (input) => {
    const scanText = getScanText(input, "middle");
    setCurSku(scanText);
    handleConfirm(scanText, "scan");
  };

  const onConfirmSku = ({ objectNo, objectName }) => {
    setCurSku(objectNo);
    setCurSkuName(objectName);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader title={taskNo} />
      <ScanBox
        placeholder="请扫描项次码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomModal
        visible={modalVisible}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={`确认识别【${curSkuName}】`}
      ></CustomModal>
      <CustomContainer>
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isHighlight = highlightSkus.includes(item?.objectNo);
            return (
              <CustomCard
                widthFactor={0.9}
                backgroundColor={isHighlight ? "#EDF6FF" : "#fff"}
                borderColor={isHighlight ? "#6DBAFF" : "#ffff"}
                onPress={() => onConfirmSku(item)}
              >
                <View style={CardTopView}>
                  <Text style={PrimaryText}>{item?.objectName}</Text>
                </View>
                <Divider />
                <View style={CardBottomView}>
                  <Text style={GrayText}>数量</Text>
                  <Text style={CountText}>
                    {item?.objectNum} {item?.objectUnit}
                  </Text>
                </View>
                <View style={CardBottomView}>
                  <Text style={GrayText}>产品型号</Text>
                  <AlertText text={item?.objectNo} />
                </View>
                <View style={CardBottomView}>
                  <Text style={GrayText}>原货位编码</Text>
                  <Text style={NormalText}>{item?.sourceBinCode}</Text>
                </View>
              </CustomCard>
            );
          }}
        />
      </CustomContainer>
      <BottomConfirmButton title="全部转移" onPress={onPress} />
    </View>
  );
};

export default DropPositionStack;
