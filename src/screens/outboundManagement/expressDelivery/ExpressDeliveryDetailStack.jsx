import {
  Image,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import { CardBottomView, GrayText, NormalText } from "../comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import { ContentContext } from "src/context/ContextProvider";
import RIghtArrowIconView from "../comp/RIghtArrowIconView";
import fetchData from "src/api/fetchData";
import getTimeId from "src/functions/getTimeId";
import Notification, { notification } from "../comp/Notification";
import { throttle } from "src/functions/tool";
import { rpx2dp, h, w } from "src/functions/responsive";
import printImage from "src/functions/printImage";
import SelectableModal from "../comp/SelectableModal";
import { API_PRINT } from "src/api/apiConfig";
import AlertText from "../comp/AlertText";
import CustomInput from "../comp/CustomInput";

const ExpressDeliveryDetailStack = ({ route }) => {
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState({});
  const [expressList, setExpressList] = useState([]);
  const [idempotentKey, setIdempotentKey] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);
  const [extInfo, setExtInfo] = useState([]);
  const [remark, setRemark] = useState("");
  // 回显状态
  const [onlyShow, setOnlyShow] = useState(false);
  const navigation = useNavigation();

  const [selectedOption, setSelectedOption] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [options, setOptions] = useState([]);
  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    getExpressList();
    setIdempotentKey(getTimeId());
  }, []);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );
  useEffect(() => {
    // 选择快递公司携带选项跳转回来
    if (route?.params?.expressItem) {
      setSelectedCompany(route?.params?.expressItem);
      // setExtInfo(route?.params?.expressItem?.extInfo);
      const defaultExtInfo = JSON.parse(data[0]?.expressExtInfo) || [];
      // 付款方式，签收单等默认选中
      const newExtInfo = route?.params?.expressItem?.extInfo?.map((item) => {
        for (const defaultItem of defaultExtInfo) {
          if (item?.key === defaultItem?.key) {
            item.value = defaultItem?.value;
            item.selectedOption = item?.options?.find(
              (i) => i.value === defaultItem?.value
            );
          }
        }
        return item;
      });
      setExtInfo(newExtInfo);
    }
  }, [route?.params?.expressItem?.expressCompanyId]);
  //
  useEffect(() => {
    const newExtInfo = extInfo?.map((item) => {
      if (item?.options?.find((ele) => ele?.label === selectedOption?.label)) {
        item.value = selectedOption?.value;
        item.selectedOption = selectedOption;
      }
      return item;
    });
    setExtInfo(newExtInfo);
  }, [selectedOption]);
  // 获取包裹列表
  const getData = async () => {
    const res = await fetchData({
      path: `/outbound/expressDelivery/getDeliveryNotes`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.expressDeliveryOpt?.taskId,
      },
    });

    if (res?.code === 200) {
      if (res?.data?.length > 0) {
        setData(res.data);
        // 回显快递公司扩展信息
        // setExtInfo(res?.expressExtInfo)
        if (res?.data[0]?.expressCompanyId > 0) {
          const jsonExtInfoData = JSON.parse(res?.data[0]?.expressExtInfo);
          getExpressList(
            jsonExtInfoData,
            res?.data[0]?.expressCompanyId,
            res?.data[0]?.remark
          );
        }
      } else {
        // 整单取消
        notification.open({ message: "订单已取消，请放置取消待上架区" });
        setTimeout(() => {
          navigation.navigate("ExpressDeliveryStack");
        }, 500);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 获取快递公司
  const getExpressList = async (selectedExtInfo, cId, remarkText) => {
    const res = await fetchData({
      path: "/outbound/expressDelivery/getExpressList",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (res?.code === 200) {
      setExpressList(res.data);
      // 如果快递公司扩展信息已经完成,则回显
      setTimeout(() => {
        if (selectedExtInfo) {
          // 设置为回显状态
          setOnlyShow(true);
          // 回显remark
          // const havaRemark = selectedExtInfo?.find(
          //   (ele) => ele.key === "remark"
          // );
          if (remarkText) {
            setRemark(remarkText);
          }
          const findSelectData = res?.data?.find(
            (item) => item.expressCompanyId === cId
          );
          setSelectedCompany(findSelectData);
          const newExtInfo = findSelectData?.extInfo?.map((item) => {
            const findExtInfoItem = selectedExtInfo?.find(
              (ele) => ele.key === item.key
            );
            if (findExtInfoItem) {
              item.value = findExtInfoItem.value;
              const findLabelOption = item.options.find(
                (i) => i.value === item.value
              );
              item.selectedOption = findLabelOption;
            }
            return item;
          });
          setExtInfo(newExtInfo);
          return;
        }
      }, 100);

      const findDefault = res?.data?.find((item) => item.isDefault === 1);
      if (findDefault && !selectedCompany?.expressCompanyId) {
        setSelectedCompany(findDefault);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };

  // 打印面单
  const onPrintSheet = async () => {
    const expressExtInfo = extInfo.map((ele) => {
      return { key: ele?.key, value: ele?.value };
    });
    const isAll = extInfo.every((item) => item.value);
    if (!isAll && extInfo[1].value != "0") {
      notification.open({ message: "请完善面单信息!" });
      return;
    }
    const bodyParams = {
      taskId: ctxState?.expressDeliveryOpt?.taskId,
      expressCompanyId: selectedCompany?.expressCompanyId,
      expressExtInfo,
    };
    //添加备注
    if (remark) {
      // expressExtInfo.push({ key: "remark", value: remark });
      bodyParams.remark = remark;
    }
    const res = await fetchData({
      path: "/outbound/expressDelivery/printExpressNo",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams,
    });
    if (res?.code === 200) {
      // 更新，包裹不可再修改
      getData();
      // to do print type为200
      notification.open({ message: "正在打印面单中...", type: "success" });
      for (const ele of data) {
        if (ele?.deliveryNotes?.length) {
          const printData = ele.deliveryNotes;
          if (printData?.length) {
            for (const item of printData) {
              await printImage(
                `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=200&deliveryNoteId=${item?.deliveryNoteId}`,
                `Bearer ${ctxState?.userInfo?.token}`,
                580,
                980
              );
            }
          }
        }
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onSelectLogisticsCompany = () => {
    navigation.navigate("SelectLogisticsCompanyStack", {
      expressList,
      selectedCompany,
    });
  };
  const onEditAddress = ({ deliveryNoteId, packageNo }, item) => {
    navigation.navigate("AddressInfoStack", {
      deliveryNoteId,
      packageNo,
      addressInfoData: item,
    });
  };
  const onComplete = async () => {
    // if (!selectedCompany?.expressCompanyId) {
    //   notification.open({ message: "请先选择快递公司" });
    //   return;
    // }
    setCompleteLoading(true);

    const res = await fetchData({
      path: "/outbound/expressDelivery/submitDelivery",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.expressDeliveryOpt?.taskId,
        idempotentKey,
      },
    });
    setCompleteLoading(false);
    if (res?.code === 200) {
      notification.open({ message: "发货完成", type: "success" });
      setTimeout(() => {
        navigation.navigate("ExpressDeliveryStack");
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const throttledOnComplete = throttle(onComplete, 1500);
  const onCompleteTip = () => {
    notification.open({ message: "正在发货..." });
  };

  const onSelect = (item) => {
    setSelectedOption({});
    setOptions(item?.options);
    // 找到已勾选的值，赋值高亮处理
    const selectedItem = extInfo?.find(
      (ele) => ele.options[0]?.label === item.options[0]?.label
    );
    const findOption = item?.options?.find(
      (ele) => ele?.value === selectedItem?.value
    );
    if (findOption) {
      setSelectedOption({ ...findOption });
    }
    setModalVisible(true);
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomContainer>
        {data?.length > 0 && (
          <CustomCard widthFactor={0.95}>
            {onlyShow ? (
              <View style={styles.header}>
                <Text
                  style={{
                    ...GrayText,
                    color: "#004D92",
                  }}
                >
                  {selectedCompany?.expressCompanyName}
                </Text>
              </View>
            ) : (
              <RIghtArrowIconView
                height={40}
                paddingVertical={10}
                onRightPress={onSelectLogisticsCompany}
              >
                <View style={styles.header}>
                  <Text
                    style={{
                      ...GrayText,
                      color: selectedCompany?.expressCompanyId
                        ? "#004D92"
                        : "#ADADAD",
                    }}
                  >
                    {selectedCompany?.expressCompanyId
                      ? selectedCompany?.expressCompanyName
                      : "请选择快递公司"}
                  </Text>
                </View>
              </RIghtArrowIconView>
            )}

            {extInfo?.map((ele) => {
              return onlyShow ? (
                <View style={CardBottomView}>
                  <Text>{ele?.label}</Text>
                  <Text style={{ marginRight: 6 }}>
                    {ele?.selectedOption?.label}
                  </Text>
                </View>
              ) : (
                <RIghtArrowIconView
                  height={40}
                  paddingVertical={10}
                  key={ele.key}
                  onRightPress={() => onSelect(ele)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Text>{ele?.label}</Text>
                    <Text>{ele?.selectedOption?.label}</Text>
                  </View>
                </RIghtArrowIconView>
              );
            })}
            {extInfo.length > 0 && (
              <View style={{ ...CardBottomView }}>
                <Text style={GrayText}>备注</Text>
                {onlyShow ? (
                  <AlertText text={remark} />
                ) : (
                  <CustomInput
                    placeholder={"请输入备注(非必填)"}
                    value={remark}
                    onChange={setRemark}
                  />
                )}
              </View>
            )}
            <SelectableModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              options={options}
              value={selectedOption}
              setValue={setSelectedOption}
            />
            <Divider />
            <View style={styles.print}>
              {selectedCompany?.expressCompanyId ? (
                <TouchableNativeFeedback onPress={() => onPrintSheet()}>
                  <Text style={styles.printText}>打印面单</Text>
                </TouchableNativeFeedback>
              ) : (
                <Text style={{ ...styles.printText, color: "#ADADAD" }}>
                  打印面单
                </Text>
              )}
            </View>
          </CustomCard>
        )}
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95}>
              <View style={CardBottomView}>
                <Text style={GrayText}>收货人</Text>
                <Text style={NormalText}>{item?.consignee}</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>收货地址</Text>
                <AlertText text={item?.address} showLength={15} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>收货电话</Text>
                <Text style={NormalText}>{item?.tel}</Text>
              </View>
              <Divider />
              {item?.deliveryNotes?.map((ele) => {
                return (
                  <View key={ele?.packageNo}>
                    <View style={CardBottomView}>
                      <View style={{ ...CardBottomView, flex: 1 }}>
                        <Text style={GrayText}>包裹码</Text>
                        <Text style={NormalText}>{ele?.packageNo}</Text>
                      </View>
                      {ele?.expressNo ? (
                        <Text style={NormalText}>{""}</Text>
                      ) : (
                        <TouchableNativeFeedback
                          onPress={() => onEditAddress(ele,item)}
                        >
                          <Image
                            source={require("../../../static/edit.png")}
                            style={{ width: 20, height: 20, marginLeft: 20 }}
                          />
                        </TouchableNativeFeedback>
                      )}
                    </View>
                    {ele?.expressNo && (
                      <View style={CardBottomView}>
                        <Text style={GrayText}>运单号</Text>
                        <Text style={NormalText}>{ele?.expressNo}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </CustomCard>
          )}
        />
      </CustomContainer>
      {data?.length > 0 && (
        <BottomConfirmButton
          title="发货完成"
          onPress={completeLoading ? onCompleteTip : throttledOnComplete}
        />
      )}
    </View>
  );
};

export default ExpressDeliveryDetailStack;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: rpx2dp(40, false),
    paddingVertical: 10,
  },
  print: {
    height: rpx2dp(28, false),
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  printText: {
    color: "#006DCF",
    fontSize: 15,
    fontWeight: "400",
    height: rpx2dp(20, false),
    lineHeight: 20,
  },
});
