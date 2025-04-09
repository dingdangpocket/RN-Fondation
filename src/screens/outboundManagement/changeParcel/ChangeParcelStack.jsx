import { Text, View, FlatList } from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import CustomContainer from "../comp/CustomContainer";
import ScanBox, { scanBox } from "../comp/ScanBox";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomCard from "../comp/CustomCard";
import { CardTopView, PrimaryText } from "../comStyle";
import Notification, { notification } from "../comp/Notification";
import CustomLoading from "../comp/CustomLoading";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import getScanText from "src/functions/getScanText";

const ChangeParcelStack = ({ route }) => {
  const { backPackageNoteNos } = route.params;
  const { ctxState, dispatch } = useContext(ContentContext);
  const [data, setData] = useState([]);
  const [skuData, setSkuData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  // 已添加的包裹编码
  const [stopPackageNoteNo, setStopPackageNoteNo] = useState([]);
  // 任务是否完成打包
  const [taskIsFinish, setTaskIsFinish] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      // getChangeData();
      setRetake(!reTake);
    }
  }, [isFocused]);
  useFocusEffect(
    useCallback(() => {
      // 返回页面如果有stopPackageNoteNo，则再次请求看看是否已完成
      if (backPackageNoteNos?.length > 0) {
        getChangeData(backPackageNoteNos);
      }
    }, [backPackageNoteNos])
  );

  const onKeyEnter = (input) => {
    // 包裹码（打包作业单号）
    const scanText = getScanText(input);
    handleScan(scanText);
  };
  // 扫码添加包裹
  const handleScan = async (input) => {
    const isExist = data?.find((item) => item?.packageNoteNo === input);
    if (isExist) {
      notification.open({ message: "包裹编码已存在" });
      return;
    }
    setLoading(true);
    const res = await fetchData({
      path: `/outbound/packaging/changePackage/addPackage`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { packageNoteNo: input, stopPackageNoteNo },
    });
    if (res?.code === 200) {
      setData([...res.data]);
      setLoading(false);
      const packageNoteNos = res.data.map((item) => item?.packageNoteNo);
      getChangeData(packageNoteNos);
      setStopPackageNoteNo((prevData) => [...prevData, input]);
    } else {
      setLoading(false);
      notification.open({ message: res?.msg || "添加包裹失败" });
    }
  };
  //（获取包裹SKU明细）
  const getChangeData = async (packageNoteNos) => {
    setLoading(true);
    const res = await fetchData({
      path: "/outbound/packaging/changePackage/beginChange",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { packageNoteNo: packageNoteNos },
    });
    if (res?.code === 200) {
      const taskId = res.data.task.taskId;
      // 更新保存taskId
      dispatch({
        type: "updateChangeParcelOpt",
        payload: { taskId },
      });
      setSkuData(res.data);
      setLoading(false);
      // setTaskIsFinish(res.data.task.taskStatus === 2);
      // 需要判断是否完成打包，完成状态值待确认
      const isComplete = res.data?.originalPackageNotes?.every?.(
        (ele) =>
          ele.packageNoteDetails?.length === 0 ||
          ele.packageNoteDetails.every(
            (item1) => item1.pickingNoteDetailNoteStatus === 99
          )
      );
      if (isComplete) {
        // 如果当前没有包裹明细，可以展示完成打包按钮，需要判断是否已经完成打包
        setIsComplete(true);
        // 判断是否已经完成打包
        if (res?.data?.task?.taskStatus === 5) {
          setTaskIsFinish(true);
          // 整单取消
          const allCancel = res.data?.originalPackageNotes?.every?.((ele) =>
            ele.packageNoteDetails?.length > 0 &&
            ele.packageNoteDetails?.every(
              (item1) => item1.pickingNoteDetailNoteStatus === 99
            )
          );
          console.log("allCancel", allCancel);

          if (allCancel) {
            notification.open({
              message: "请将订单中已取消的实物放置到取消上架区",
            });
            setData([]);
          } else {
            scanBox.clear();
            setData([]);
            setStopPackageNoteNo([]);
            notification.open({ message: "已完成打包" });
          }
        } else {
          setTaskIsFinish(false);
        }
      } else {
        setIsComplete(false);
      }
      // notification.open({ message: "更换包裹成功", type: "success" });
      // 更换包裹是直接跳转到更换包裹的页面？
    } else {
      notification.open({ message: res?.msg });
    }
  };
  //  更换包裹,开始更换
  const onChangeParcel = async () => {
    const packageNoteNos = data.map((item) => item.packageNoteNo);
    navigation.navigate("ChangeParcelDetailStack", {
      skuData,
      packageNoteNos,
      noPrint: false,
    });
  };
  // 完成打包
  const onComplete = async () => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/finishPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskId: ctxState?.changeParcelOpt?.taskId },
    });
    if (res?.code === 200) {
      notification.open({ message: "完成打包", type: "success" });
      // 更新按钮
      if (backPackageNoteNos?.length > 0) {
        getChangeData(backPackageNoteNos);
      }
      scanBox.clear();
      setData([]);
      setStopPackageNoteNo([]);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <CustomLoading loading={loading} setLoading={setLoading} />
      <Notification />
      <ScanBox
        placeholder={"请扫描包裹编码"}
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item) => item?.packageNoteId.toString()}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95} key={item?.packageNoteId}>
              <View style={{ ...CardTopView, marginBottom: 0 }}>
                <Text style={PrimaryText}>{item?.packageNoteNo}</Text>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      {stopPackageNoteNo?.length > 0 && isComplete && !taskIsFinish && (
        <BottomConfirmButton title={"完成打包"} onPress={onComplete} />
      )}
      {stopPackageNoteNo?.length > 0 && !isComplete && (
        <BottomConfirmButton title={"更换包裹"} onPress={onChangeParcel} />
      )}
    </View>
  );
};

export default ChangeParcelStack;
