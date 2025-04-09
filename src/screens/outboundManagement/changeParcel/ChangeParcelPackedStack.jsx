import { Text, View } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import {
  PrimaryText,
  CardTopView,
  CardBottomView,
  CountText,
  GrayText,
} from "../comStyle";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import CustomTag from "../comp/CustomTag";
import CustomPageHeader from "../comp/CustomPageHeader";
import CustomModal from "../comp/CustomModal";
import NumberInput from "../comp/NumberInput";
import AlertText from "../comp/AlertText";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import getScanText from "src/functions/getScanText";
const ChangeParcelPackedStack = () => {
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [printCount, setPrintCount] = useState(0);
  const [data, setData] = useState([]);
  const [packedCount, setPackedCount] = useState(0);
  const [packageDetailId, setPackageDetailId] = useState(0);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    getData();
  }, []);
  // 获取已包装
  const getData = async () => {
    const res = await fetchData({
      path: `/outbound/packaging/hasDetail/getPackageDetails`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskId: ctxState?.changeParcelOpt?.taskId },
    });
    if (res?.code === 200) {
      setData(res.data);
      //一已打包
      const filterData = res.data.filter(
        (item) => item.packageNoteStatus === 58
      );
      setPackedCount(filterData?.length);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const handleConfirm = () => {
    handlePrint();
    setModalVisible(false);
  };

  const handleCancel = () => {
    // 取消操作
    setModalVisible(false);
  };
  // 扫描或点击sku,弹出补打弹框,长按跳转调整页面
  const onPress = (item) => {
    setModalVisible(true);
    // // ?待确认   一个包裹下有多个sku，ui图如何显示，如何传递值
    // setPackageDetailId(item?.packageNoteNo);
  };
  const onLongPress = (item) => {
    /**
     *   待打包:50, 打包中:53, 已打包:58, 已取消:99
     */
    // 已打包不能再调整数量
    if ([50, 53].includes(item?.packageNoteStatus)) {
      navigation.navigate("AdjustOrderPackedStack", {
        data: item,
      });
    } else {
      notification.open({ message: "已打包不能再调整数量" });
    }
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    setModalVisible(true);
    // ?待确认
    setPackageDetailId(scanText);
  };
  // 打印
  const handlePrint = async () => {
    const res = await fetchData({
      path: `/outbound/packaging/hasDetail/getOutboundLabel`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        packageDetailId,
        count: printCount,
      },
    });
    if (res?.code === 200) {
      //  to do print
    } else {
      notification.open({ message: res?.msg });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader title={`已更换 (${packedCount})`} />
      <ScanBox
        placeholder="请扫描包裹编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomModal
        visible={modalVisible}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="打印份数"
      >
        <NumberInput
          // initialValue={50}
          maxValue={999}
          value={printCount}
          onChangeValue={setPrintCount}
        />
      </CustomModal>
      <CustomContainer>
        {data?.map((item) => {
          return (
            <CustomCard
              widthFactor={0.95}
              key={item?.packageNoteNo}
              onPress={() => onPress(item)}
              onLongPress={() => onLongPress(item)}
            >
              <View style={CardTopView}>
                <CustomTag
                  text={item?.packageNoteNo}
                  color="#006DCF"
                  backgroundColor="#006DCF1F"
                  style={{
                    paddingHorizontal: 6,
                  }}
                />
              </View>
              <View style={CardTopView}>
                <Text style={PrimaryText}>XXXXX</Text>
                {item?.packageNoteStatus === 58 && (
                  <CustomTag
                    text={"封装"}
                    color="#fff"
                    backgroundColor="#56B947"
                  />
                )}
              </View>
              {item?.packageNoteDetails?.map((ele, idx) => {
                return (
                  <View key={idx}>
                    <Divider />
                    <View style={CardBottomView}>
                      <Text style={GrayText}>客户SKU名称</Text>
                      <AlertText text={ele?.skuName} />
                    </View>
                    <View style={CardBottomView}>
                      <Text style={GrayText}>数量</Text>
                      <Text style={CountText}>
                        {ele?.pickingNum} {ele?.unit}
                      </Text>
                    </View>
                    <View style={CardBottomView}>
                      <Text style={GrayText}>产品型号</Text>
                      <AlertText text={ele?.skuId} showLength={30} />
                    </View>
                  </View>
                );
              })}
            </CustomCard>
          );
        })}
      </CustomContainer>
    </View>
  );
};

export default ChangeParcelPackedStack;
