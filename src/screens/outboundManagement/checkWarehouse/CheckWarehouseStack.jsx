import { Text, View } from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import {
  PrimaryText,
  TimeText,
  CardTopView,
  CardBottomView,
} from "../comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";

import CustomTag from "../comp/CustomTag";
import Divider from "../comp/Divider";
import Notification, { notification } from "../comp/Notification";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import getScanText from "src/functions/getScanText";
import CustomLoading from "../comp/CustomLoading";
const CheckWarehouseStack = () => {
  const { ctxState } = useContext(ContentContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);
  useFocusEffect(
    useCallback(() => {
      setData([]);
      getData();
    }, [])
  );
  /**
   * 单据状态（10：待出库，23待拣货，25拣货中，40待复核，50待打包，65待配送，90已出库，99已取消）
   */
  const statusSet = {
    40: {
      color: "#B48032",
      backgroundColor: "#FFF7EA",
      text: "待出库",
    },
    10: {
      color: "#279700",
      backgroundColor: "#F5FFF2",
      text: "待复核",
    },
  };
  const onPress = (item) => {
    navigation.navigate("CheckedDetailWarehouseStack", {
      status: 0,
      taskId: item?.taskId,
      taskNo: item?.taskNo,
    });
  };
  // 获取出库复核列表_api
  const getData = async (code) => {
    setLoading(true);
    // code 容器或拣货签编码
    const params = {
      path: "/outbound/pickingCheck/getTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { code },
    };
    const res = await fetchData(params);
    setLoading(false);
    if (res?.code === 200) {
      setData(res.data ? [res.data] : []);
      // 扫描时有任务，自动跳转
      if (res.data && code) {
        onPress(res.data);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onKeyEnter = (input) => {
    // 拣货签
    const scanText = getScanText(input, "end");
    getData(scanText);
  };
  // 提取默认颜色设置
  const defaultStatus = statusSet[10];
  return (
    <View style={{ flex: 1 }}>
      <CustomLoading loading={loading} setLoading={setLoading} />
      <Notification />
      <ScanBox
        placeholder="请扫描拣货签"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        {data?.map((item) => {
          // 获取当前状态颜色设置，若状态不存在则使用默认值
          const currentStatus = statusSet?.[item?.taskStatus] || defaultStatus;
          return (
            <CustomCard
              widthFactor={0.95}
              height={100}
              key={item?.taskId}
              onPress={() => onPress(item)}
            >
              <View style={CardTopView}>
                <Text style={PrimaryText}>{item?.taskNo}</Text>
                <CustomTag
                  text={item?.taskStatusText || currentStatus?.text}
                  color={currentStatus.color}
                  backgroundColor={currentStatus.backgroundColor}
                />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={TimeText}>{item?.createOn}</Text>
              </View>
            </CustomCard>
          );
        })}
      </CustomContainer>
    </View>
  );
};

export default CheckWarehouseStack;
