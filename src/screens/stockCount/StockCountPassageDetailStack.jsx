import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableNativeFeedback,
} from "react-native";
import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import ScanBox from "../outboundManagement/comp/ScanBox";
import CustomContainer from "../outboundManagement/comp/CustomContainer";
import CustomCard from "../outboundManagement/comp/CustomCard";
import { CardTopView, PrimaryText } from "../outboundManagement/comStyle";
import CustomTag from "../outboundManagement/comp/CustomTag";
import CustomPageHeader from "../outboundManagement/comp/CustomPageHeader";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "../outboundManagement/comp/Notification";
import getScanText from "src/functions/getScanText";
const StockCountPassageDetailStack = ({ route }) => {
  const { row, countNoteId, noteStatus } = route.params;
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
  // 获取盘点货位
  const getData = async () => {
    const res = await fetchData({
      path: `/inside/count/listStorageBin`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        row,
        countNoteId,
      },
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  /**
   * 盘点货位状态(待初盘：10，初盘中：15，已初盘：19，待复盘：20，复盘中：25，已复盘：29，已完成：89，已取消：99)
   * PDA 判断 已初盘：19,已复盘：29，已完成：89  三个状态都显示绿色，阶此之外显示橘色
   */
  const colorArr = [
    {
      // 蓝色
      codes: [1, 10],
      color: "#006DCF",
      backgroundColor: "#006DCF1F",
    },
    {
      // 绿色
      codes: [19, 29, 89],
      color: "#279700",
      backgroundColor: "#EAFAE5",
    },
    {
      // 橘色
      codes: [15, 20, 25, 99],
      color: "#E28400",
      backgroundColor: "#FFEFD8CC",
    },
  ];
  const findColorConfig = (code) => {
    const findData = colorArr.find((item) => item?.codes?.includes(code));
    if (findData) {
      return findData;
    }
    return colorArr[2];
  };

  const onPress = (item) => {
    navigation.navigate("PassageDetailSkUListStack", {
      countNoteBinDetailId: item?.countNoteBinDetailId,
      storageBinCode: item?.storageBinCode,
      noteStatus,
      row,
      countNoteId,
    });
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    const findData = data.find((item) => item.storageBinCode === scanText);
    if (findData) {
      onPress(findData);
    } else {
      notification.open({ message: "货位不在当前盘点通道,请重新扫描" });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader title={`通道${row}`} />
      <ScanBox
        placeholder="请扫描货位开始盘点"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => {
            const { color, backgroundColor } = findColorConfig(
              item?.countNoteBinDetailStatus
            );
            return (
              <CustomCard
                height={54}
                widthFactor={0.95}
                cardTagColor={
                  item?.storageAreaType === 10 ? "#279700" : "#F35944"
                }
                onPress={() => onPress(item)}
              >
                <View style={CardTopView}>
                  <Text style={PrimaryText}>
                    {item?.storageAreaTypeText} {item?.storageBinCode}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <CustomTag
                      text={item?.countNoteBinDetailStatusText}
                      color={color}
                      backgroundColor={backgroundColor}
                    />
                    <TouchableNativeFeedback onPress={() => onPress(item)}>
                      <Image
                        source={require("../../static/rightArrow.png")}
                        style={{ width: 25, height: 25, marginLeft: 10 }}
                      />
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </CustomCard>
            );
          }}
        />
      </CustomContainer>
    </View>
  );
};

export default StockCountPassageDetailStack;

const styles = StyleSheet.create({});
