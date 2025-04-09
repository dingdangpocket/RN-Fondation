import {
  Image,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  FlatList,
  ToastAndroid,
} from "react-native";
import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  GrayText,
  NormalText,
} from "../../outboundManagement/comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import ScanBox from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import NumberInput from "src/screens/outboundManagement/comp/NumberInput";
import Divider from "src/screens/outboundManagement/comp/Divider";
import rightArrowIcon from "../../../static/rightArrow.png";
import BottomConfirmButton from "src/screens/outboundManagement/comp/BottomConfirmButton";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import fetchData from "src/api/fetchData";
import CustomCheckBox from "src/screens/outboundManagement/comp/CustomCheckbox";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import getTimeId from "src/functions/getTimeId";
import getScanText from "src/functions/getScanText";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
const TransferTakedownStack = ({ route }) => {
  const { itemData } = route.params;
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();

  const [data, setData] = useState({});
  const [skuData, setSkuData] = useState([]);
  const [idempotentKey, setIdempotentKey] = useState("");
  const [highlightArr, setHighlightArr] = useState([]);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
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
      getData();
    }, [])
  );
  // 查询货位库存
  const getData = async () => {
    setData(itemData);
    const skus = itemData?.skus?.map((item) => {
      return {
        ...item,
        checked: false,
        num: item?.usableNum,
      };
    });
    setSkuData(skus);
  };
  // 勾选
  const onCheckChange = (item) => {
    const data = skuData.map((ele) => {
      if (ele.skuId == item.skuId) {
        ele.checked = !ele.checked;
      }
      return ele;
    });
    console.log("data", data);
    setSkuData([...data]);
    // setSkuData((preArr) => {
    //   return preArr.map((ele) => {
    //     if (ele.skuId == item.skuId) {
    //       ele.checked = !ele.checked;
    //     }
    //     return ele;
    //   });
    // });
  };
  // 确认转出
  const onConfirmTransfer = async () => {
    const skus = skuData
      .filter((ele) => ele.checked)
      .map((item) => {
        return {
          skuId: item.skuId,
          num: item.num,
          skuName: item.skuName,
          unit: item.unit,
          goodsOwnerId: item?.goodsOwnerId,
        };
      });
    if (!skus?.length) {
      notification.open({ message: "请选择要转出的SKU" });
      return;
    }
    const res = await fetchData({
      path: "/inside/storageBinTransfer/takeDown",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        idempotentKey,
        sourceStorageBinId: itemData?.storageBinId,
        skus,
      },
    });

    if (res?.code === 200) {
      notification.open({ message: "转出成功", type: "success" });
      setTimeout(() => {
        // const { storageBinTransferNoteId, taskId } = res.data;
        // // 去上架页面
        // navigation.navigate("TransferShelfStack", {
        //   storageBinTransferNoteId,
        //   taskId,
        // });
        navigation.navigate("SpaceTransferStack");
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
    // navigation.navigate("SpaceTransferStack");
  };
  // 改变某个sku的数量
  const onChangeCount = (value, item) => {
    setSkuData((preArr) => {
      return preArr.map((ele) => {
        if (ele.skuId === item.skuId) {
          ele.num = value;
        }
        return ele;
      });
    });
  };
  // 扫描定位sku，定位？勾选
  const onKeyEnter = (input) => {
    const scanText = getScanText(input, "middle");
    // 扫描skuId
    const findData = skuData.find((item) => item.skuId === scanText);
    if (findData) {
      if (findData.checked) {
        ToastAndroid.show("取消勾选成功", ToastAndroid.SHORT);
        onCheckChange(findData);
      } else {
        ToastAndroid.show("匹配成功", ToastAndroid.SHORT);
        onCheckChange(findData);
      }
    } else {
      ToastAndroid.show("请扫描正确的SKU条码", ToastAndroid.SHORT);
    }
  };
  // to do print ok printLabelType=7的打印,使用skuId和skuName
  const onPrint = (item) => {
    printImage(
      `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=7&storageId=${ctxState?.optSet?.curStorageId}&skuId=${item?.skuId}&skuName=${item?.skuName}`,
      `Bearer ${ctxState?.userInfo?.token}`
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描SKU条码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={skuData}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, idx) => item.skuId}
          renderItem={({ item }) => (
            <CustomCard key={item.skuId} widthFactor={0.95}>
              <View style={CardTopView}>
                <View style={{ flexDirection: "row" }}>
                  <CustomCheckBox
                    checked={item?.checked}
                    onChange={() => onCheckChange(item)}
                  />
                  <AlertText
                    text={item?.skuName}
                    style={PrimaryText}
                    showLength={30}
                  />
                </View>
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>总数量</Text>
                <Text style={CountText}>
                  {item?.totalNum} {item?.unit}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>可转出数量</Text>
                <Text style={CountText}>
                  {item?.usableNum} {item?.unit}
                </Text>
              </View>
              <View style={{ ...CardBottomView, height: 50 }}>
                <Text style={GrayText}>转出数量 ({item?.unit})</Text>
                <NumberInput
                  initialValue={item?.usableNum}
                  value={item?.usableNum}
                  onChangeValue={(value) => onChangeCount(value, item)}
                  maxValue={item?.totalNum}
                />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text></Text>
                <TouchableNativeFeedback onPress={() => onPrint(item)}>
                  <Text style={{ color: "#006DCF" }}>
                    打印项次签{" "}
                    <Image
                      source={rightArrowIcon}
                      style={{ width: 16, height: 16 }}
                    />
                  </Text>
                </TouchableNativeFeedback>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      <BottomConfirmButton title="确认转出" onPress={onConfirmTransfer} />
    </View>
  );
};

export default TransferTakedownStack;

const styles = StyleSheet.create({});
