import { Text, View } from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  GrayText,
  NormalText,
} from "../../outboundManagement/comStyle";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import ScanBox from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import CustomTag from "src/screens/outboundManagement/comp/CustomTag";
import Divider from "src/screens/outboundManagement/comp/Divider";
import BottomConfirmButton from "src/screens/outboundManagement/comp/BottomConfirmButton";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import getScanText from "src/functions/getScanText";
import { FlatList } from "react-native";

const TurnGoodToBadStack = () => {
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [data, setData] = useState([]);
  const [isShowBtn, setIsShowBtn] = useState(false);
  const [reTake, setRetake] = useState(false);
  const [storageBinCode, setStorageBinCode] = useState("");
  const [containerCode, setContainerCode] = useState("");

  // 使用 useCallback 优化 getData 函数，避免不必要的重新创建
  const getData = useCallback(async () => {
    try {
      const res = await fetchData({
        path: "/inside/qualityToDefective/getUndoneTask",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
      });
      if (res?.code === 200) {
        setData(res.data);
        // 有未完成的任务则显示“去上架”按钮
        /**
         * 待转移：10，转移中：15，已完成：19，已取消：99
         */
        const isShow = res?.data?.some((item) => item.noteStatus === 4);
        setIsShowBtn(isShow);
      } else {
        notification.open({ message: res?.msg || "获取数据失败" });
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      notification.open({ message: "网络错误，请稍后重试" });
    }
  }, [ctxState?.userInfo?.token, ctxState?.optSet?.curStorageId]);

  // 当页面聚焦时重新获取数据
  useEffect(() => {
    if (isFocused) {
      setRetake((prev) => !prev);
      getData();
    }
  }, [isFocused, getData]);

  // 通过容器编码拿到货位编码
  const getSourceStorageBinCode = async (scanText) => {
    const res = await fetchData({
      path: "/base/getStorageBinByContainer",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        code: scanText,
      },
    });
    if (res?.code === 200) {
      if (!res?.data) {
        notification.open({ message: "扫描容器为空" });
        setStorageBinCode("");
      } else {
        if (!res?.data?.storageBinCode) {
          notification.open({ message: `【${scanText}】未绑定货位` });
          return;
        }
        setStorageBinCode(res?.data?.storageBinCode);
        getInventory(res?.data?.storageBinCode);
      }
    } else {
      setStorageBinCode("");
      setContainerCode("");
      notification.open({ message: res?.msg });
    }
  };
  // 扫描货位拿到sku数量，再跳转到对应页面
  const onKeyEnter = async (input) => {
    const scanText = getScanText(input);
    const scanTextSku = getScanText(input, "middle");
    // 扫货位
    // getInventory(scanText);

    //  判断扫描的是容器还是sku
    const matchedSku = data?.find(
      (item) =>
        [scanTextSku, scanText].includes(item.skuId) && item.noteStatus === 4
    );
    // 如果找到匹配的SKU，跳转到单个残品上架页面
    if (matchedSku) {
      navigation.navigate("SingleDefectiveShelvingStack", {
        data: matchedSku,
      });
    } else {
      // 扫容器
      getSourceStorageBinCode(scanText);
    }
  };
  // 查询库存
  const getInventory = async (scanText) => {
    const res = await fetchData({
      path: `/inside/qualityToDefective/queryInventory`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        storageBinCode: scanText,
      },
    });
    // 如果响应码为200
    if (res?.code === 200) {
      // 如果货位ID为0，表示扫描的是SKU
      // if (res.data?.storageBinId === 0) {
      //   // 在数据中查找匹配的SKU
      //   const matchedSku = data?.find(
      //     (item) => item.skuId === scanText && item.noteStatus === 4
      //   );
      //   // 如果找到匹配的SKU，跳转到单个残品上架页面
      //   if (matchedSku) {
      //     navigation.navigate("SingleDefectiveShelvingStack", {
      //       data: matchedSku,
      //     });
      //   } else {
      //     // 如果未找到匹配的SKU，显示通知
      //     notification.open({ message: "未找到匹配的待转移SKU" });
      //   }
      // } else if (res.data?.storageBinId > 0) {
      // 如果货位ID大于0，表示扫描的是货位
      // 如果货位中的SKU数量为1，直接跳转到确认移除页面
      if (res.data?.skus?.length === 1) {
        navigation.navigate("ConfirmRemovalStack", {
          data: res.data,
          itemData: res.data.skus[0],
        });
      } else if (res.data?.skus?.length > 1) {
        // 如果货位中的SKU数量大于1，跳转到SKU选择页面
        navigation.navigate("SKUSelectionStack", { data: res.data });
      } else {
        // 如果货位中没有SKU，显示通知
        notification.open({ message: "未找到相关SKU" });
      }
      // } else {
      //   // 如果货位ID既不是0也不是大于0，显示通知
      //   notification.open({ message: "无效的扫描结果" });
      // }
    } else {
      // 如果响应码不是200，显示通知
      notification.open({ message: res?.msg || "查询失败" });
    }
  };
  // 处理"去上架"按钮点击,4:进行中 ,去批量处理页面
  const onPress = () => {
    const filterData = data?.filter((item) => item.noteStatus === 4);
    if (filterData?.length >= 1) {
      // 直接进入批量残品上架页面
      navigation.navigate("BatchDefectiveShelvingStack", { data: filterData });
    } else {
      notification.open({ message: "没有待转移的任务" });
    }
  };
  const onGoToSingle = (data) => {
    navigation.navigate("SingleDefectiveShelvingStack", {
      data: data,
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器编码/项次编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <CustomCard
              height={170}
              widthFactor={0.95}
              onPress={() => onGoToSingle(item)}
            >
              <View style={CardTopView}>
                <AlertText
                  text={item?.skuName}
                  style={PrimaryText}
                  showLength={30}
                />
                <CustomTag text={item?.noteStatusText} />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>数量</Text>
                <Text style={CountText}>
                  {item.num} {item?.unit}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>货位</Text>
                <Text style={NormalText}>{item?.sourceStorageBinCode}</Text>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      {/* 只有在有待转移任务时才显示"去上架"按钮 */}
      {isShowBtn && <BottomConfirmButton title="去上架" onPress={onPress} />}
    </View>
  );
};

export default TurnGoodToBadStack;
