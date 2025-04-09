import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomContainer from "../comp/CustomContainer";
import {
  CardTopView,
  CardBottomView,
  CountText,
  GrayText,
  PrimaryText,
  NormalText,
} from "../comStyle";
import NumberInput from "../comp/NumberInput";
import CustomPageHeader from "../comp/CustomPageHeader";
import CustomModal from "../comp/CustomModal";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import CustomCheckbox from "../comp/CustomCheckbox";
import Notification, { notification } from "../comp/Notification";
import getTimeId from "src/functions/getTimeId";
import ScanBox from "../comp/ScanBox";
import getScanText from "src/functions/getScanText";
import AlertText from "../comp/AlertText";
import printImage from "src/functions/printImage";
import { handleImageUrl } from "src/functions/handleImageUrl";

const LocationDetailStack = ({ route }) => {
  const { pickingNoteDetailId, storageBinCode, itemData } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState({});
  const [count, setCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPutForwarded, setIsPutForwarded] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [pickingStorageBinId, setPickingStorageBinId] = useState("");
  const [pickingStorageBinCode, setPickingStorageBinCode] = useState("");
  const [idempotentKey, setIdempotentKey] = useState("");
  // 是否需要扫描
  const [allowScanTag, setAllowScanTag] = useState(0);

  const navigation = useNavigation();
  useEffect(() => {
    setIdempotentKey(getTimeId());
  }, []);
  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    getData(pickingNoteDetailId, storageBinCode);
  }, [pickingNoteDetailId, storageBinCode]);
  // 通过pickingNoteId获取详情
  const getData = async (pickingNoteDetailId, storageBinCode) => {
    const res = await fetchData({
      path: "/outbound/stockoutPicking/getTaskDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { pickingNoteDetailId, storageBinCode },
    });
    // console.log("to do print", res);
    if (res.code === 200) {
      setData(res.data);
      setPickingStorageBinCode(res.data?.storageBinCode ?? storageBinCode);
      setPickingStorageBinId(res.data?.pickingStorageBinId);
      setAllowScanTag(0);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onPick = async () => {
    // 确认拣货前判断实捡数量是否小于应捡数量，小于则弹框提示是否提报
    // if (data.expectNum > count && !isPutForwarded) {
    //   setModalVisible(true);
    //   return;
    // }
    // 确认拣货
    const res = await fetchData({
      path: "/outbound/stockoutPicking/submitPicking",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        pickingNoteDetailId: itemData?.pickingNoteDetailId,
        pickingNum: count,
        sbumitStockout: isChecked ? 1 : 0,
        taskId: itemData?.taskId,
        pickingStorageBinCode,
        pickingStorageBinId,
        idempotentKey,
      },
    });

    if (res?.code === 200) {
      // console.log("to do print", res);
      // to do print
      await printImage(
        handleImageUrl(3, ctxState?.optSet?.curStorageId, {
          pickingNoteDetailId,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
      notification.open({ message: "拣货完成", type: "success" });
      setTimeout(() => {
        // navigation.navigate("DropLocationStack", { item: data });
        navigation.navigate("ReceiveDropStack", {
          pickingNoteId: itemData?.pickingNoteId,
          status: 0,
          itemData: { ...data, pickingNoteNo: itemData?.pickingNoteNo },
          taskId: itemData?.taskId,
          pickNum: count,
        });
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  const onConfirm = () => {
    setIsPutForwarded(true);
    setModalVisible(false);
  };
  const onCancel = () => {
    setModalVisible(false);
  };
  const onKeyEnter = (input) => {
    // 扫描作用：确定sku
    const scanText = getScanText(input, "middle");

    const findData = data.skuId == scanText; // 使用严格相等比较
    if (findData) {
      setAllowScanTag(0);
    } else {
      setAllowScanTag(0);
      notification.open({ message: "请扫描正确的项次签" });
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Notification />
      <CustomModal
        visible={modalVisible}
        onCancel={onCancel}
        onConfirm={onConfirm}
        title={`是否确认提报 ${data.expectNum - count} 个缺货拣货`}
      >
        <CustomCheckbox
          label="是否提报"
          checked={isChecked}
          onChange={(newValue) => setIsChecked(newValue)}
        />
      </CustomModal>
      <CustomPageHeader title={data?.storageBinCode} />
      <ScanBox
        onKeyEnter={onKeyEnter}
        placeholder={"请扫描项次签"}
        reTake={reTake}
      />
      <CustomContainer>
        <CustomCard widthFactor={0.9}>
          <View style={CardTopView}>
            <AlertText
              text={data?.skuName}
              style={PrimaryText}
              showLength={30}
            />
            {allowScanTag === 0 && (
              <Image
                source={require("../../../static/NotificationSuccessIcon.png")}
                style={{ width: 20, height: 20, marginLeft: 20 }}
              />
            )}
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={data?.skuId} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>拣货作业单号</Text>
            <Text style={NormalText}>{itemData?.pickingNoteNo}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>货位</Text>
            <Text style={NormalText}>{data?.storageBinCode}</Text>
          </View>
        </CustomCard>

        <CustomCard widthFactor={0.9}>
          <View style={styles.itemInfo}>
            <Text style={styles.label}>应拣</Text>
            <Text style={CountText}>
              {data?.expectNum}
              <Text style={styles.unit}> {data?.unit}</Text>
            </Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.label}>实拣（{data?.unit}）</Text>
            <NumberInput
              initialValue={0}
              value={count}
              onChangeValue={setCount}
            />
          </View>
        </CustomCard>
        <BottomConfirmButton
          title="确认拣货"
          onPress={onPick}
          mTop={210}
        />
      </CustomContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  itemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  count: {
    fontSize: 18,
    color: "#f39019",
  },
  unit: {
    marginLeft: 3,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
  },
  quantityText: {
    fontSize: 20,
    color: "#333",
  },
  quantityValue: {
    fontSize: 20,
    color: "#f39019",
    marginHorizontal: 15,
  },
});

export default LocationDetailStack;
