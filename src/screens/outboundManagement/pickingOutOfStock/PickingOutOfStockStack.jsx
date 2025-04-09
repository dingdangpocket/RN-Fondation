import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableNativeFeedback,
  ActivityIndicator,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import ScanBox from "../comp/ScanBox";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import CustomContainer from "../comp/CustomContainer";
import CustomTag from "../comp/CustomTag";
import {
  CardTopView,
  CardBottomView,
  CountText,
  GrayText,
  PrimaryText,
  NormalText,
} from "../comStyle";
import Notification, { notification } from "../comp/Notification";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import getScanText from "src/functions/getScanText";
import useWindow from "src/hooks/useWindow";
const PickingOutOfStockStack = ({ route }) => {
  // secondType(1领料缺货，2常规缺货)
  const { secondType } = route.params;
  const [Width, Height] = useWindow();
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 默认激活第一个Tab
  const [data, setData] = useState([]);
  const [containerCode, setContainerCode] = useState("");
  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      getData(activeTab);
    }, [])
  );

  /**
   * 单据状态（23：待拣货，25：拣货中，28：已拣货==待落放，40：待复核，48：已复核，50：待打包，58：已打包，99：已取消）
   */
  const stateSet = {
    23: { text: "待拣货" },
    28: { text: "待落放", color: "#006DCF", backgrounColor: "#006DCF1F" },
    // other: { text: "已处理", color: "#279700", backgrounColor: "#DAF8CF" },
  };

  const getData = async (type) => {
    setLoading(true);
    const res = await fetchData({
      path: `/outbound/stockoutPicking/getTask`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { status: type, secondType },
    });
    // console.log("res", res);
    if (res?.code == 200) {
      setLoading(false);
      setData([...res.data]);
    } else {
      setLoading(false);
      notification.open({ message: res?.msg });
    }
  };

  const onViewItem = (item) => {
    // 去拣货
    if (item.noteStatus === 23) {
      navigation.navigate("LocationDetailStack", {
        pickingNoteDetailId: item.pickingNoteDetailId,
        storageBinCode: item.storageBinCode,
        itemData: item,
      });
    }
    // 去落放
    if (item.noteStatus === 28) {
      navigation.navigate("ReceiveDropStack", {
        pickingNoteId: item.pickingNoteId,
        status: activeTab,
        itemData: item,
        taskId: item?.taskId,
      });
    }
    // 查看落放位
    if (activeTab === 1) {
      navigation.navigate("DropLocationStack", { item });
    }
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    setContainerCode(scanText);
    handleScan(scanText);
  };
  const handleScan = (input) => {
    const findData = data?.find(
      (item) => item.containerCode === input && item.noteStatus === 23
    );
    if (findData) {
      navigation.navigate("LocationDetailStack", {
        pickingNoteDetailId: findData?.pickingNoteDetailId,
        storageBinCode: findData?.storageBinCode,
        itemData: findData,
      });
    } else {
      notification.open({ message: "请扫描正确的货位编码" });
    }
  };

  const RenderItem = useCallback(
    ({
      storageBinCode,
      pickingNoteNo,
      skuName,
      noteStatusText,
      noteStatus,
      expectNum,
      pickingNum,
      containerCode,
      skuId,
      unit,
      onPress,
      customerDepartment,
    }) => (
      <CustomCard widthFactor={0.95}>
        <View style={CardTopView}>
          <Text style={PrimaryText}>{storageBinCode}</Text>
          <CustomTag
            text={noteStatusText}
            backgroundColor={stateSet?.[noteStatus]?.backgrounColor}
            color={stateSet?.[noteStatus]?.color}
          />
        </View>
        <View style={CardBottomView}>
          <Text style={NormalText}>{skuName}</Text>
        </View>
        <Divider />
        <View style={CardBottomView}>
          <Text style={GrayText}>{activeTab ? "实拣/应拣" : "数量"}</Text>
          <Text style={CountText}>
            {activeTab ? `${pickingNum}/${expectNum}` : expectNum} {unit}
          </Text>
        </View>
        <View style={CardBottomView}>
          <Text style={GrayText}>产品型号</Text>
          <Text style={NormalText}>{skuId}</Text>
        </View>
        <View style={CardBottomView}>
          <Text style={GrayText}>容器编码</Text>
          <Text style={NormalText}>{containerCode}</Text>
        </View>
        <View style={CardBottomView}>
          <Text style={GrayText}>申请部门</Text>
          <Text style={NormalText}>{customerDepartment}</Text>
        </View>
        <View style={CardBottomView}>
          <Text style={GrayText}>拣货作业单号</Text>
          <Text style={NormalText}>{pickingNoteNo}</Text>
        </View>
        <View style={CardBottomView}>
          <Text></Text>
          <TouchableNativeFeedback onPress={onPress}>
            <View
              style={{
                flexDirection: "row",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 100,
                height: 50,
              }}
            >
              <Text style={{ color: "#006DCF", marginRight: 4, fontSize: 18 }}>
                {noteStatus === 28 ? "去落放" : "执行拣货"}
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      </CustomCard>
    ),
    [data]
  );

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        {loading ? (
          <View
            style={{
              width: Width * 0.8,
              height: Height * 0.3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {data && !loading && (
          <FlatList
            data={data}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={10}
            removeClippedSubviews={true}
            renderItem={({ item }) => (
              <View style={styles.centeredItem}>
                <RenderItem {...item} onPress={() => onViewItem(item)} />
              </View>
            )}
            keyExtractor={(item, idx) => idx}
            style={styles.list}
          />
        )}
      </CustomContainer>
    </View>
  );
};
export default PickingOutOfStockStack;
const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  centeredItem: {
    width: "100%",
    alignItems: "center",
  },
});
