import { Text, View, FlatList } from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import ScanBox from "../comp/ScanBox";
import CustomCard from "../comp/CustomCard";
import CustomContainer from "../comp/CustomContainer";
import ContentWithNumber from "../comp/ContentWithNumber";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  NormalText,
  GrayText,
} from "../comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomPageHeader from "../comp/CustomPageHeader";
import CustomModal from "../comp/CustomModal";
import Notification, { notification } from "../comp/Notification";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import getScanText from "src/functions/getScanText";
import CustomTag from "../comp/CustomTag";
import AlertText from "../comp/AlertText";
import CustomLoading from "../comp/CustomLoading";

const CheckedDetailWarehouseStack = ({ route }) => {
  const { taskNo, taskId } = route.params;
  const { ctxState } = useContext(ContentContext);

  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemModalText, setItemModalText] = useState("");
  const navigation = useNavigation();
  const [btnStatus, setBtnStatus] = useState(3);
  const [checkedNum, setCheckedNum] = useState(0);
  const [highlight, setHighlight] = useState("");
  const [showData, setShowData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );
  // 更新出库复核完成复核按钮状态
  useEffect(() => {
    const allCancelled = data?.every(
      (item) => item?.pickingNoteDetailStatus === 99
    ) || !data?.length && checkedNum !== 0;
    // 设置 3:挂起，5：完成
    setBtnStatus(allCancelled ? 5 : 3);
  }, [checkedNum,data.length]);

  const refreshData = () => {
    getData(1);
    setTimeout(() => {
      setLoading(true);
      getData(0);
    }, 200);
  };
  // 获取待复核任务
  const getData = async (status) => {

    // status 状态（1：已复核，0：待复核）
    const res = await fetchData({
      path: "/outbound/pickingCheck/getTaskDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { status, taskId },
    });
    if (res?.code === 200) {
      // 获取已复核任务数量
      if (status === 1) {
        setCheckedNum(res?.data?.length ?? 0);
      } else {
        setLoading(false)
        // 待复核
        setData(res?.data ?? []);
        setShowData(res?.data ?? []);
        //  1、如列表剩余sku全部为【已取消】，显示【完成复核】按钮，手动完成复核任务
        // 2、剩余sku不全部是【已取消】，显示【挂起】
        // 3、无【已取消】最后一个sku复核完成，自动完成任务
        // 40 待复核，45复核中，48已复核
        // console.log(res?.data?.length, checkedNum);
        // const allCancelled = res?.data?.every(
        //   (item) => item?.pickingNoteDetailStatus === 99
        // ) || !res?.data?.length&& checkedNum !== 0;
        // // 设置 3:挂起，5：完成
        // setBtnStatus(allCancelled ? 5 : 3);
      }
    } else {
      // to do  不同状态码点击弹框确认按钮后，跳转到不同页面。需确认项次取消、订单全部取消对应状态码
      notification.open({ message: res?.msg });
    }
  };

  const handleConfirm = () => {
    setModalVisible(false);
    navigation.navigate("CheckWarehouseStack");
  };

  const handleItemConfirm = () => {
    setItemModalVisible(false);
    navigation.navigate("CheckedDetailWarehouseStack");
  };

  // 去确认复核页面
  const onPress = (itemData) => {
    //如果是已取消，则发起请求然后弹框提示
    if (itemData?.pickingNoteDetailStatus === 99) {
      handleCheckStatus(itemData);
      return;
    }
    navigation.navigate("ConfirmCheckedSKUStack", {
      data: itemData,
      taskId,
      allData: data,
      taskNo,
    });
  };
  // 去已复核页面
  const onRightPress = () => {
    navigation.navigate("CheckedSKUListStack", { taskId });
  };
  const onKeyEnter = (input) => {
    console.log('input',input)
    // 扫描产品型号,判断当前SKU是否在复核任务中,使用明细单id去和pickingNoteDetailId对比
    const scanText = getScanText(input, "end");
    onSkuCancleInTask(Number(scanText));
  };
  // 判断当前单个SKU是否在复核任务中_api
  const onSkuCancleInTask = async (input) => {
    // change 改为skuId
    const findData = data.find((item) => item.pickingNoteDetailId === input);
    // 在，继续判断
    if (findData) {
      // 扫描内容匹配超过1个，重新sort，并且高亮card
      // const filterData = data.filter((item) => item.skuId === input);
      // if (filterData.length > 1) {
      //   //重新sort，将匹配内容放到最前面
      //   const noMatchData = data.filter((item) => item.skuId !== input);
      //   const newData = [...filterData, ...noMatchData];
      //   setShowData(newData);
      //   setHighlight(input);
      // } else {
      //   handleClear();
      //   handleCheckStatus(findData);
      // }
      handleClear();
      handleCheckStatus(findData);
    } else {
      handleClear();
      // 不在，提示
      notification.open({ message: "请扫描正确的拣货签" });
    }
  };
  // 判断当前单个SKU是否在复核任务中_api
  const handleCheckStatus = async (findData) => {
    const res = await fetchData({
      path: "/outbound/pickingCheck/submitCheck",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { pickingNoteDetailId: findData.pickingNoteDetailId, taskId },
    });
    /**
     * 200：成功
     * 8003: 整单被取消
     * 8015: 项次被取消
     */
    if (res?.code === 200) {
      // 无【已取消】最后一个sku复核完成，自动完成任务
      const noCancelAndLastComplete =
        data.every((ele) => ele.pickingNoteDetailStatus !== 99) &&
        data?.length === 1;
      if (noCancelAndLastComplete) {
        onHandUp(true);
        return;
      }
      notification.open({ message: "复核通过", type: "success" });
      refreshData();
    } else if (res?.code === 8003) {
      setModalText(res?.msg || "订单已全部取消，请将所有商品转移至待上架区");
      setTimeout(() => {
        setModalVisible(true);
      }, 100);
    } else if (res?.code === 8015) {
      setItemModalText(res?.msg || "项次已取消，请重新复核");
      setTimeout(() => {
        setItemModalVisible(true);
      }, 100);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  // 挂起/完成 3:挂起，5：完成
  const onHandUp = async (isComplete) => {
    const res = await fetchData({
      path: "/outbound/pickingCheck/finishCheck",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskId, status: isComplete ? 5 : btnStatus },
    });
    if (res?.code === 200) {
      notification.open({
        message: isComplete
          ? "复核完成"
          : `${btnStatus === 3 ? "挂起成功" : "复核完成"}`,
        type: "success",
      });
      setTimeout(() => {
        navigation.navigate("CheckWarehouseStack");
      }, 1000);
      // 订单已全部取消，请将所有商品转移至待上架区
    } else if (res?.code === 9999) {
      // setModalText(res?.msg || "订单已全部取消，请将所有商品转移至待上架区");
      // setTimeout(() => {
      //   setModalVisible(true);
      // }, 100);
      notification.open({ message: res?.msg });
      setTimeout(() => {
        navigation.navigate("CheckWarehouseStack");
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
 const handleClear = () => {
    setHighlight("");
    setShowData([...data]);
  };
  return (
    <View style={{ flex: 1 }}>
      <CustomLoading  loading={loading} setLoading={setLoading} />
      <Notification />
      <CustomPageHeader
        title="出库复核"
        rightContent={
          <ContentWithNumber content="已复核" number={checkedNum} />
        }
        onRightPress={onRightPress}
        rightWidth={50}
      />
      <CustomModal
        visible={modalVisible}
        setVisible={setModalVisible}
        onConfirm={handleItemConfirm}
        title={modalText}
      ></CustomModal>
      <CustomModal
        visible={itemModalVisible}
        setVisible={setItemModalVisible}
        onConfirm={handleConfirm}
        title={itemModalText}
      ></CustomModal>
      <ScanBox
        placeholder="请扫描拣货签"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
        handleClear={handleClear}
      />
      <CustomContainer>
        <FlatList
          data={showData}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, idx) => idx}
          renderItem={({ item }) => (
            <CustomCard
              widthFactor={0.90}
              onPress={() => onPress(item)}
              backgroundColor={highlight === item.skuId ? "#EDF6FF" : "#fff"}
              borderColor={highlight === item.skuId ? "#6DBAFF" : "#ffff"}
            >
              <View style={CardTopView}>
                <AlertText
                  text={item?.skuName}
                  style={PrimaryText}
                  showLength={30}
                />
                {item?.pickingNoteDetailStatus === 99 && (
                  <CustomTag text="已取消" />
                )}
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>数量</Text>
                <Text style={CountText}>
                  {item?.pickingNum} {item?.unit}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      {btnStatus === 5 ? (
        <BottomConfirmButton
          title="完成复核"
          onPress={() => onHandUp(true)}
        />
      ) : (
        <BottomConfirmButton
          title="挂起"
          onPress={() => onHandUp()}
          disabled={!data?.length}
        />
      )}
    </View>
  );
};

export default CheckedDetailWarehouseStack;
