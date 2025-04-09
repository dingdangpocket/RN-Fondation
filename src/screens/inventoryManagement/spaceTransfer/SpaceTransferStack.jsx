import {
  Text,
  View,
  Image,
  TouchableNativeFeedback,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  TimeText,
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
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import CustomTag from "src/screens/outboundManagement/comp/CustomTag";
import Divider from "src/screens/outboundManagement/comp/Divider";
import getScanText from "src/functions/getScanText";

const SpaceTransferStack = () => {
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [data, setData] = useState([]);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  // 获取未完成
  const getData = async () => {
    const res = await fetchData({
      path: "/inside/storageBinTransfer/getUndoneTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      // 货位是否正在盘点是由后端判断返回提示
      notification.open({ message: res?.msg });
    }
  };
  // 查询库存
  const getQueryData = async (sourceStorageBinCode) => {
    const res = await fetchData({
      path: `/inside/storageBinTransfer/getStorageBinInventory`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        storageBinCode: sourceStorageBinCode,
      },
    });
    if (res?.code === 200) {
      // onViewpage(sourceStorageBinCode)
      navigation.navigate("TransferTakedownStack", {
        itemData: res.data,
      });
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onViewpage = ({ sourceStorageBinCode, storageBinId }) => {
    navigation.navigate("TransferTakedownStack", {
      sourceStorageBinCode,
      storageBinId,
    });
  };
  const onKeyEnter = async (input) => {
    const scanText = getScanText(input);
    const res = await fetchData({
      path: "/base/getStorageBinByContainer",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        code: scanText,
      },
    });
    // 通过容器编码拿到货位编码
    if (res?.code === 200) {
      if (!res?.data) {
        notification.open({ message: "扫描容器为空" });
      } else {
        if (!res?.data?.storageBinCode) {
          notification.open({ message: `【${scanText}】未绑定货位` });
          return;
        }
        getQueryData(res?.data?.storageBinCode);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onGoShelf = (item) => {
    navigation.navigate("TransferShelfStack", {
      storageBinTransferNoteId: item?.storageBinTransferNoteId,
      taskId: item?.taskId,
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyExtractor={(item) => item?.taskId.toString()}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <CustomCard
              key={item?.taskId}
              widthFactor={0.95}
              // onPress={() => onViewpage(item)}
            >
              <View style={CardTopView}>
                <Text style={PrimaryText}>
                  {item?.storageBinTransferNoteNo}
                </Text>
                <CustomTag text={item?.taskStatusText} />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>转出货位:</Text>
                <Text style={NormalText}>{item?.sourceStorageBinCode}</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={TimeText}>{item?.taskCreateOn}</Text>
                <TouchableNativeFeedback onPress={() => onGoShelf(item)}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "#006DCF", marginRight: 4 }}>
                      去上架
                    </Text>
                    <Image
                      source={require("../../../static/rightArrow.png")}
                      style={{ height: 16, width: 16 }}
                    />
                  </View>
                </TouchableNativeFeedback>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
    </View>
  );
};

export default SpaceTransferStack;
