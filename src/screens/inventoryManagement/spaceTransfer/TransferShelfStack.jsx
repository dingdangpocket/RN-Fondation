import { Text, View, FlatList } from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  GrayText,
  NormalText,
} from "../../outboundManagement/comStyle";
import ScanBox, { scanBox } from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import Divider from "src/screens/outboundManagement/comp/Divider";
import BottomConfirmButton from "src/screens/outboundManagement/comp/BottomConfirmButton";
import fetchData from "src/api/fetchData";
import CustomCheckBox from "src/screens/outboundManagement/comp/CustomCheckbox";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import getTimeId from "src/functions/getTimeId";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import getScanText from "src/functions/getScanText";
import BindContainer from "src/screens/outboundManagement/comp/BindContainer";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import useStorageBinCode from "src/hooks/useStorageBinCode";
const TransferShelfStack = ({ route }) => {
  const { storageBinTransferNoteId, taskId, bindStorageBinCode, routeData } =
    route.params;
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [skuData, setSkuData] = useState([]);
  const [idempotentKey, setIdempotentKey] = useState("");
  const [storageBinCode, setStorageBinCode] = useState("");
  const [containerCode, setContainerCode] = useState("");
  const [bindLoading, setBindLoading] = useState(false);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  const { getStorageBinCodeByContainerCode } = useStorageBinCode(
    setStorageBinCode,
    setContainerCode,
    notification,
    setBindLoading
  );
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    setIdempotentKey(getTimeId());
  }, []);
  useFocusEffect(
    useCallback(() => {
      getData(storageBinTransferNoteId, taskId);
    }, [bindStorageBinCode])
  );
  useEffect(() => {
    setStorageBinCode(bindStorageBinCode);
    if (bindStorageBinCode) {
      scanBox.clear();
    }
  }, [bindStorageBinCode]);
  // 查询货位转移作业单明细
  const getData = async (storageBinTransferNoteId, taskId) => {
    // 绑定上架货位成功后 跳转回页面 数据保持勾选
    if (bindStorageBinCode) {
      setSkuData(routeData);
      return;
    }
    const res = await fetchData({
      path: "/inside/storageBinTransfer/getStorageBinTransferNoteDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        storageBinTransferNoteId,
        taskId,
      },
    });
    if (res?.code === 200) {
      const skus = res.data?.storageBinTransferNoteDetails?.map((item) => {
        return { ...item, checked: false };
      });
      setSkuData(skus);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 确认转入
  const onConfirmTransfer = async () => {
    const storageBinTransferNoteDetailIds = skuData
      .filter((ele) => ele.checked)
      .map((item) => item?.storageBinTransferNoteDetailId);
    console.log(
      "storageBinTransferNoteDetailIds",
      storageBinTransferNoteDetailIds
    );
    if (!storageBinTransferNoteDetailIds?.length) {
      notification.open({ message: "请选择要转入的SKU" });
      return;
    }
    const res = await fetchData({
      path: "/inside/storageBinTransfer/putaway",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        targetStorageBinCode: storageBinCode,
        taskId,
        idempotentKey,
        storageBinTransferNoteId,
        storageBinTransferNoteDetailIds,
      },
    });
    if (res?.code === 200) {
      notification.open({ message: "转入成功", type: "success" });
      setTimeout(() => {
        navigation.navigate("SpaceTransferStack");
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onKeyEnter = async (input) => {
    const scanText = getScanText(input);
    // 通过容器编码拿到货位编码
    getStorageBinCodeByContainerCode(scanText);
  };
  const onCheckChange = (item) => {
    setSkuData((preArr) => {
      return preArr.map((ele) => {
        if (ele.skuId === item.skuId) {
          ele.checked = !ele.checked;
        }
        return ele;
      });
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <BindContainer
          targetStorageBinCode={storageBinCode}
          containerCode={containerCode}
          fromPage="TransferShelfStack"
          bindLoading={bindLoading}
          notification={notification}
          routeData={skuData}
        />
        <FlatList
          data={skuData}
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95}>
              <View style={CardTopView}>
                <View style={{ flexDirection: "row" }}>
                  <CustomCheckBox
                    checked={item?.checked}
                    onChange={() => onCheckChange(item)}
                  />
                  <Text style={PrimaryText}>{item?.skuName}</Text>
                </View>
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item.skuId} showLength={30} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>转出货位</Text>
                <Text style={NormalText}>{item?.sourceStorageBinCode}</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>上架数量</Text>
                <Text style={CountText}>
                  {item?.num} {item?.unit}
                </Text>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      <BottomConfirmButton title="确认转入" onPress={onConfirmTransfer} />
    </View>
  );
};

export default TransferShelfStack;
