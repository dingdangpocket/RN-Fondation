import {
  View,
  Text,
  ToastAndroid,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Content from "./Comp/Cotent";
import { IncrementIcon, DecrementIcon } from "src/icons/index";
import React, { useState, useContext, useEffect } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import CustomButton from "src/components/CustomButton";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import getTimeId from "src/functions/getTimeId";
import FaCountModal from "src/screens/tabScreens/taskStack/faPickTaskStack/Comp/FaCountModal";
import LostModal from "./Comp/LostModal";
import matchSkuId from "src/functions/matchSkuId";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
import { rpx2dp, h, w } from "src/functions/responsive";
import formatNumber from "../fun/formatNumber";
import {
  MODALSTYLE,
  PLUSSTYLE,
  CENTERSTYLEWRAP,
  CENTERSTYLE,
} from "./style.js";
//组波业务核心;
const FaPickTaskDetail = ({ route }) => {
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const { storageItem, groupId, nextStorageCode, faTaskDetail } = route.params;
  //taskDetail组波任务详细；
  const [taskDetails, setTaskDetails] = useState();
  //组波任务列表数据;
  const [sumPick, setSumPick] = useState(0);
  //onActivehook
  const isFocused = useIsFocused();
  const getTaskDetail = async () => {
    const response = await fetchData({
      path: `/task/groupPicking/getPickingDetail`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        groupId: groupId,
        pickingStorageBinCode: storageItem?.pickingStorageBinCode,
      },
    });
    // console.log("当前组波货位任务详情", response);
    if (response.code == 200) {
      if (response.data.jumpLocation == 3) {
        Alert.alert(
          "提示",
          `${response?.data?.jumpLocationText}`,
          [{ text: "确定", onPress: () => navigation.goBack() }],
          { cancelable: false }
        );
        return;
      }
      if (response.data.jumpLocation == 2) {
        // console.log("faTaskDetail", faTaskDetail);
        Alert.alert(
          "提示",
          `${response?.data?.jumpLocationText}`,
          [
            {
              text: "确定",
              onPress: () =>
                navigation.navigate("FaDropTaskStack", {
                  faTaskDetail: faTaskDetail,
                  groupId: faTaskDetail?.groupId,
                }),
            },
          ],
          { cancelable: false }
        );
        return;
      }
      if (response.data.jumpLocation == 1) {
        Alert.alert(
          "提示",
          `${response?.data?.jumpLocationText}`,
          [
            {
              text: "确定",
              onPress: () => navigation.navigate("TasksTab"),
            },
          ],
          { cancelable: false }
        );
        return;
      }
      if (response.data.jumpLocation == 4) {
        // ToastAndroid.show(response?.data?.jumpLocationText, ToastAndroid.SHORT);
        setLoading(false);
        setTaskDetails("");
        setTaskDetails(response.data);
        onSumPick(response.data.containers);
      }
      return;
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      Alert.alert(
        "提示",
        `${response?.msg}`,
        [{ text: "确定", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };

  //获取组波拣货任务详情;
  useEffect(() => {
    if (isFocused) {
      getTaskDetail();
    }
  }, [isFocused]);

  //更新容器拣货数量;
  const handleConfirm = (pickValue, item) => {
    // console.log("itemChange", pickValue, item);
    taskDetails?.containers?.forEach((x) => {
      if (x?.containerCode == item?.containerCode) {
        x.pickingData.numDetail[0].pickingNum = Number(pickValue);
      }
    });
    setTaskDetails("");
    setTaskDetails({ ...taskDetails });
  };

  //多明细行情况修改;
  const [multiplyItemCase, setMultiplyItemCase] = useState();
  const onPress = (item) => {
    handleOpenModal();
    setMultiplyItemCase(item);
  };
  const [modalVisible, setModalVisible] = useState(false);
  const handleCloseModal = () => {
    // console.log("修改", taskDetails, multiplyItemCase);
    const containers = taskDetails.containers.map((item) => {
      return item?.containerCode == multiplyItemCase?.containerCode
        ? multiplyItemCase
        : item;
    });
    setTaskDetails({ ...taskDetails, containers: [...containers] });
    setModalVisible(false);
  };
  const handleOpenModal = () => {
    setModalVisible(true);
  };
  const onIncrement = (index) => {
    multiplyItemCase?.pickingData?.numDetail?.forEach((x, idx) => {
      if (idx == index) {
        x.pickingNum = parseFloat((Number(x.pickingNum) + 1).toFixed(4));
      }
    });
    setMultiplyItemCase({ ...multiplyItemCase });
  };
  const onDecrement = (index) => {
    multiplyItemCase?.pickingData?.numDetail?.forEach((x, idx) => {
      if (idx == index) {
        if (x.pickingNum <= 0) return;
        x.pickingNum = parseFloat((Number(x.pickingNum) - 1).toFixed(4));
      }
    });
    setMultiplyItemCase({ ...multiplyItemCase });
  };
  const onChangeText = (value, index) => {
    const regex = /^\d*\.?\d{0,4}$/;
    if (regex.test(value)) {
      multiplyItemCase?.pickingData?.numDetail?.forEach((x, idx) => {
        if (idx == index) {
          x.pickingNum = Number(value);
        }
      });
      setMultiplyItemCase({ ...multiplyItemCase });
    }
  };

  //缺货数量;
  const [check, setCheck] = useState(true);
  const [modalVisible_lost, setModalVisible_lost] = useState(false);
  const remenberMe = () => {
    setCheck(!check);
  };

  //聚合总实拣数量；
  const onSumPick = (containers) => {
    let totalPickingNum = 0;
    containers.forEach((container) => {
      if (
        container?.pickingData &&
        container?.pickingData.numDetail
        //单项状态为未取消;
      ) {
        container?.pickingData?.numDetail.forEach((x) => {
          if (x.mixPickingNoteDetailStatus != 99) {
            //多个明细情况，状态是99取消将不参与聚合计算;
            totalPickingNum += x.pickingNum;
          }
        });
      }
    });
    return formatNumber(totalPickingNum.toFixed(4));
  };

  useEffect(() => {
    if (taskDetails) {
      setSumPick(onSumPick(taskDetails?.containers));
    }
  }, [taskDetails, multiplyItemCase]);

  const [lostCount, setLostCount] = useState(0);
  useEffect(() => {
    // console.log(taskDetails?.totalExpectNum, sumPick);
    const offset = Number(taskDetails?.totalExpectNum) - Number(sumPick);
    setLostCount(parseFloat(offset.toFixed(4)));
  }, [sumPick, taskDetails]);

  //确认拣货按钮
  const onConfirm = () => {
    lostCount > 0 ? setModalVisible_lost(true) : onSubmit();
  };

  const handleCloseModal_lost = () => {
    setColor("#E28400");
    setModalVisible_lost(false);
  };

  //拦截是否确认项次
  const [tag, setTag] = useState(true);
  useEffect(() => {
    if (taskDetails) {
      taskDetails?.allowScanTag == 0 ? setTag(true) : setTag(true);
    }
  }, []);

  //防止多次点击,用于禁用按钮;
  const [loading, setLoading] = useState(false);
  const submitPick = async () => {
    const response = await fetchData({
      path: `/task/groupPicking/submitPicking`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        ...taskDetails,
        idempotentKey: timestampId,
        groupId: groupId,
        pickingStorageBinId: storageItem?.pickingStorageBinId,
        pickingStorageBinCode: storageItem?.pickingStorageBinCode,
        isCommitStockout: modalVisible_lost ? "1" : "0",
        pickingTotalNum: sumPick,
      },
    });
    // console.log("提交结果", response);
    if (response.code == 200) {
      ToastAndroid.show("提交成功", ToastAndroid.SHORT);
      //组波打印;
      if (taskDetails) {
        for (const x of taskDetails?.containers) {
          for (const k of x?.pickingData?.numDetail) {
            //如果等于23说明多明细没有取消，需要打印;
            if (k.mixPickingNoteDetailStatus == 23) {
              if (k.pickingNoteDetailId) {
                await printImage(
                  `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=3&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=&pickingNoteDetailId=${k.pickingNoteDetailId}&containerCode=${x.containerCode}&packageNoteId=&outboundNoteDetailId=`,
                  `Bearer ${ctxState?.userInfo?.token}`
                );
              }
            }
          }
        }
      }
      //todo🚀状态异常；
      if (response?.data?.isDone == 1) {
        // console.log("groupId", groupId, "faTaskDetail", faTaskDetail);
        navigation.navigate("FaDropTaskStack", {
          groupId: groupId,
          faTaskDetail: faTaskDetail,
        });
        setLoading(false);
        return;
      } else {
        navigation.goBack();
        setLoading(false);
        return;
      }
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        setLoading(false);
        return;
      }
      //如果是9999说明有取消异常场景;
      if (response.code == 9999) {
        Alert.alert(
          "提示",
          `${"订单取消，请重新确认实拣数量"}`,
          [
            {
              text: "确定",
              onPress: () => getTaskDetail(),
            },
          ],
          { cancelable: false }
        );
        setLoading(false);
        return;
      }
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setLoading(false);
    }
  };

  //提交组波拣货数据;
  const onSubmit = () => {
    setLoading(true);
    //需要扫描;
    if (!tag) {
      ToastAndroid.show("请扫描项次后提交", ToastAndroid.SHORT);
      setLoading(false);
      return;
    }
    if (lostCount < 0) {
      ToastAndroid.show("不允许超占，请检查实拣数量", ToastAndroid.SHORT);
      setLoading(false);
      return;
    }
    submitPick();
  };

  //确认缺货并拣货
  const handleConfirm_lost = () => {
    onSubmit();
    setModalVisible_lost(false);
  };

  //项次标签
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);

  //焦点获取
  useEffect(() => {
    if (isFocused) setRetake(!reTake);
  }, [isFocused]);

  //删除文本
  const cancle = () => {
    setScanResult("");
    setTag(true);
  };

  //文本变化
  const onTextChange = (result) => {
    setScanResult(result);
  };

  //扫码已经完成;
  useEffect(() => {
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  const onCheckSku = (SCAN) => {
    if (SCAN) {
      if (taskDetails?.allowScanTag == 1) {
        const skuId = matchSkuId(
          scanResult.startsWith(SCAN_TAG) ? scanResult.slice(1) : scanResult
        );
        if (taskDetails.skuId != skuId) {
          ToastAndroid.show("项次不匹配,请重新扫描", ToastAndroid.SHORT);
          setScanResult("");
          setTag(true);
          return;
        } else {
          setTag(true);
          ToastAndroid.show("校验通过", ToastAndroid.SHORT);
        }
      }
      if (taskDetails?.allowScanTag == 0) {
        ToastAndroid.show("无需校验", ToastAndroid.SHORT);
        setTag(true);
      }
    }
  };

  //扫描输入校验确认项次
  useEffect(() => {
    onCheckSku(resultDone);
  }, [resultDone]);

  //手动输入校验确认项次
  const handleSubmit = () => {
    onCheckSku(scanResult);
  };

  const renderMutiItem = (item, multiply, index) => {
    return (
      <TouchableOpacity onPress={() => onPress(item)}>
        <View
          key={index}
          style={{
            display: "flex",
            flexDirection: "row",
            marginLeft: 10,
            ...CENTERSTYLE,
          }}
        >
          <View
            style={{
              width: 35,
              height: 100,
              ...CENTERSTYLE,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: "#004D92",
              }}
            >
              {multiply?.pickingNum.toString().length > 3
                ? `${multiply?.pickingNum.toString().substring(0, 3).trim()}..`
                : multiply?.pickingNum}
            </Text>
          </View>
          <View
            style={{
              width: 10,
              height: 100,
              ...CENTERSTYLE,
            }}
          >
            <Text
              style={{
                fontSize: 35,
                color: "#004D92",
              }}
            >
              |
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMutiModal = (item, index) => {
    return (
      <View
        key={index}
        style={{
          margin: 5,
          height: 50,
          width: rpx2dp(180),
          display: "flex",
          flexDirection: "row",
          backgroundColor: "rgb(230,230,230)",
          ...CENTERSTYLE,
        }}
      >
        <TouchableWithoutFeedback onPress={() => onDecrement(index)}>
          <View
            style={{
              ...PLUSSTYLE,
              ...CENTERSTYLE,
            }}
          >
            <DecrementIcon width={"25%"} height={"25%"}></DecrementIcon>
          </View>
        </TouchableWithoutFeedback>
        <TextInput
          style={{ width: 100, fontSize: 23, textAlign: "center" }}
          value={String(item.pickingNum)}
          keyboardType="number-pad"
          onChangeText={(value) => onChangeText(value, index)}
        />
        <TouchableWithoutFeedback onPress={() => onIncrement(index)}>
          <View
            style={{
              ...PLUSSTYLE,
              ...CENTERSTYLE,
            }}
          >
            <IncrementIcon width={"25%"} height={"25%"}></IncrementIcon>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };
  
  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <LostModal
        check={check}
        remenberMe={remenberMe}
        lostCount={lostCount}
        modalVisible={modalVisible_lost}
        handleCloseModal={handleCloseModal_lost}
        handleConfirm={handleConfirm_lost}
      ></LostModal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        style={{
          ...CENTERSTYLE,
        }}
      >
        <View
          style={{
            ...MODALSTYLE,
            ...CENTERSTYLE,
            height: 270,
          }}
        >
          <Text>修改拣货数量</Text>
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {multiplyItemCase?.pickingData?.numDetail?.map((item, index) => {
              //多明细行修改如果状态99为已经取消，不渲染；
              return item.mixPickingNoteDetailStatus == 99
                ? null
                : renderMutiModal(item, index);
            })}
          </ScrollView>
          <View
            style={{
              width: 200,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <CustomButton
              title="取消"
              titleColor="black"
              fontSize={18}
              width={75}
              height={45}
              borderRadius={2.5}
              marginTop={10}
              align={{
                ...CENTERSTYLE,
              }}
              onPress={handleCloseModal}
            />
            <CustomButton
              title="确认"
              titleColor="rgba(0, 77, 146, 1)"
              fontSize={18}
              width={75}
              height={45}
              borderRadius={2.5}
              marginTop={10}
              align={{
                ...CENTERSTYLE,
              }}
              onPress={handleCloseModal}
            />
          </View>
        </View>
      </Modal>
      <NoTabHeadBar
        titleA={storageItem?.pickingStorageBinCode}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描项次标签"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
      <GoodsPositionDetailCard
        marginTop={10}
        width={w * 0.9}
        item1_left={
          taskDetails?.skuName ? (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "详细",
                  `${taskDetails?.skuName}`,
                  [
                    {
                      text: "确认",
                      onPress: () => console.log(""),
                    },
                  ],
                  { cancelable: false }
                )
              }
            >
              <Text style={{ color: "#004D92", fontSize: 18 }}>
                {taskDetails?.skuName.length <= 24
                  ? taskDetails?.skuName
                  : taskDetails?.skuName.substring(0, 24) + "..."}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        item1_right={
          <Content
            color={"#004D92"}
            fontSize={18}
            value={
              tag ? (
                <Image
                  style={{ width: 22, height: 22 }}
                  source={require("src/static/lock.png")}
                ></Image>
              ) : null
            }
          />
        }
        item2_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
        item2_right={
          taskDetails?.skuId ? (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "详细",
                  `${taskDetails?.skuId}`,
                  [
                    {
                      text: "确认",
                      onPress: () => console.log(""),
                    },
                  ],
                  { cancelable: false }
                )
              }
            >
              <Text style={{ fontSize: 15 }}>
                {taskDetails?.skuId?.length <= 30
                  ? taskDetails?.skuId
                  : taskDetails?.skuId.substring(0, 30) + "..."}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        item3_left={<Text style={{ fontSize: 15 }}>应拣数量</Text>}
        item3_right={
          <Text style={{ fontSize: 15, color: "#E28400" }}>
            {taskDetails?.totalExpectNum}
          </Text>
        }
        item4_left={<Text style={{ fontSize: 15 }}>实拣数量</Text>}
        item4_right={
          <Text style={{ fontSize: 15, color: "#E28400" }}>{sumPick}</Text>
        }
      ></GoodsPositionDetailCard>
      <View
        style={{
          marginTop: 10,
          width: w * 0.9,
          height: rpx2dp(240, false),
          backgroundColor: "white",
          borderRadius: 5,
          ...CENTERSTYLEWRAP,
          // backgroundColor: "green",
        }}
      >
        {taskDetails &&
          taskDetails?.containers?.map((item) => {
            return (
              <View
                key={item.containerCode}
                style={{
                  backgroundColor: "#EBF6FF",
                  margin: 5,
                  width: 100,
                  height: 100,
                }}
              >
                {/* case1.1是否存在多明细行情况; */}
                {/* case1.2单明细; */}
                {item?.pickingData?.numDetail.length == 1 ? (
                  //单明细行已取消状态（99）;
                  //单明细行无需拣货状态（0）;
                  item?.pickingData?.numDetail[0].mixPickingNoteDetailStatus ==
                  99 ? (
                    <View
                      style={{
                        ...CENTERSTYLE,
                      }}
                    >
                      <FaCountModal
                        isCancel={true}
                        initValue={"已取消"}
                      ></FaCountModal>
                    </View>
                  ) : item?.pickingData?.numDetail[0]
                      .mixPickingNoteDetailStatus == 0 ? (
                    <View
                      style={{
                        ...CENTERSTYLE,
                        backgroundColor: "rgba(190,190,190,0.25)",
                      }}
                    >
                      <FaCountModal
                        isCancel={true}
                        initValue={"∅"}
                      ></FaCountModal>
                    </View>
                  ) : (
                    //单明细行未取消;
                    <View
                      style={{
                        ...CENTERSTYLE,
                      }}
                    >
                      <FaCountModal
                        handleConfirm={handleConfirm}
                        item={item}
                        initValue={item?.pickingData?.numDetail[0]?.expectNum}
                      ></FaCountModal>
                    </View>
                  )
                ) : (
                  //多明细行;
                  <>
                    <ScrollView
                      horizontal={true}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                    >
                      {item?.pickingData?.numDetail.map((multiply, index) => {
                        //明细行取消状态99,不渲染；
                        return multiply.mixPickingNoteDetailStatus == 99
                          ? null
                          : renderMutiItem(item, multiply, index);
                      })}
                    </ScrollView>
                  </>
                )}
              </View>
            );
          })}
      </View>
      <CustomButton
        disabled={loading}
        title={`确认拣货${nextStorageCode ? "下一个" : ""}${nextStorageCode}`}
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={h * 0.1}
        align={{
          ...CENTERSTYLE,
        }}
        onPress={onConfirm}
      />
    </View>
  );
};
export default FaPickTaskDetail;
