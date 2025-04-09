/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableNativeFeedback,
} from "react-native";
import Select from "src/components/Select";
import { ContentContext } from "src/context/ContextProvider";
import { BackIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import useWindow from "src/hooks/useWindow";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
const TasksTab = () => {
  const route = useRoute();
  const { fromPage } = route.params;
  useEffect(() => {
    console.log("全局状态", ctxState);
  }, [ctxState]);
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const { ctxState } = useContext(ContentContext);
  const [loading, setLoading] = useState(false);
  const [Width, Height] = useWindow();
  const [selectedOption, setSelectedOption] = useState({
    label: "低位组合拣货任务",
    value: "1",
    nav: "FaPickTaskGoodsPositionListStack",
  });

  const options = [
    {
      label: "低位组合拣货任务",
      value: "1",
      nav: "FaPickTaskGoodsPositionListStack",
    },
    {
      label: "低位按单拣货任务",
      value: "2",
      nav: "PickTaskGoodsPositionListStack",
    },
    {
      label: "高位叉车拣货任务",
      value: "3",
      nav: "CarPickGoodsPositionListStack",
    },
  ];
  const handleValueChange = (value, label) => {
    setSelectedOption({ value, label });
  };
  //高位拣货
  const [dataCar, setDataCar] = useState({});
  //按单拣货
  const [dataOrder, setDataOrder] = useState({});
  //组波拣货
  const [groupData, setGroupData] = useState({});
  const isFocused = useIsFocused();
  const [noData, setNoData] = useState(true);

  //初次进入页面清空任务缓存,无需检查“下拉刷新任务”文本状态;
  useEffect(() => {
    setDataCar("");
    setDataOrder("");
    setGroupData("");
  }, []);

  //激活页面时检测数据是否存在，如果存在显示任务，反之下拉刷新领取;
  useEffect(() => {
    if (isFocused) {
      //如果是从任务落放页面落放完成自动跳回任务页面，则需要清除任务数据缓存并且更新检查“下拉刷新任务”文本状态;
      if (
        fromPage == "FaDropTaskStack" ||
        fromPage == "DropPositionDetailStack" ||
        fromPage == "PickTaskDropStack"
      ) {
        setDataCar("");
        setDataOrder("");
        setGroupData("");
        setNoData(true);
      }
    }
  }, [isFocused]);

  const isMounted = useRef(false);
  useEffect(() => {
    // 如果是初次渲染，则不执行;
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setDataCar("");
    setDataOrder("");
    setGroupData("");
    setLoading(true);
    //组波任务;
    if (selectedOption.value == "1") {
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: `/task/groupPicking/getTask`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
        });
        console.log("低位组合任务表", response);
        if (response.code == 200) {
          setNoData(false);
          setGroupData({ ...response?.data });
          setLoading(false);
          setRefreshing(false);
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            setRefreshing(false);
            return;
          }
          ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
          setLoading(false);
          setGroupData("");
          setNoData(true);
          setRefreshing(false);
        }
      };
      asyncWrapper();
    }
    //按单任务;
    if (selectedOption.value == "2") {
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: `/task/orderPicking/getTask`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            taskType: 2030103,
          },
        });
        console.log("低位按单任务表", response);
        if (response.code == 200) {
          setDataOrder({ ...response.data });
          setLoading(false);
          setNoData(false);
          setRefreshing(false);
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            setRefreshing(false);
            return;
          }
          ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
          setLoading(false);
          setNoData(true);
          setDataOrder("");
          setRefreshing(false);
        }
      };
      asyncWrapper();
    }
    //叉车任务;
    if (selectedOption.value == "3") {
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: `/task/orderPicking/getTask`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            taskType: 2030101,
          },
        });
        console.log("叉车任务表", response);
        if (response.code == 200) {
          setNoData(false);
          setDataCar({ ...response.data });
          setLoading(false);
          setRefreshing(false);
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            setRefreshing(false);
            return;
          }
          ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
          setLoading(false);
          setNoData(true);
          setDataCar("");
          setRefreshing(false);
        }
      };
      asyncWrapper();
    }
  }, [selectedOption]);

  const onNav = (data) => {
    const routeMap = {
      1: "FaPickTaskGoodsPositionListStack",
      2: "PickTaskGoodsPositionListStack",
      3: "CarPickGoodsPositionListStack",
    };
    //(1)组波任务特例;
    if (selectedOption?.value == 1) {
      if (data.noteStatus == 28) {
        navigation.navigate("FaDropTaskStack", { faTaskDetail: data });
        //去落放;
      } else {
        navigation.navigate("FaPickTaskGoodsPositionListStack", {
          taskDetail: data,
        });
      }
      return;
    }
    console.log("当前任务信息", data);
    //(2)其他任务跳转;
    const routeName = routeMap[selectedOption?.value];
    navigation.navigate(routeName, { taskDetail: data });
  };
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setSelectedOption({ ...selectedOption });
  };
  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );
  const onBack = () => {
    navigation.navigate("ChooseStashStack");
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: width,
          height: 60,
          backgroundColor: "#004D92",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <TouchableNativeFeedback onPress={() => onBack()}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: 150,
              height: 60,
            }}
          >
            <BackIcon width={25} height={25} />
            <Text
              style={{
                fontSize: 18,
                color: "white",
              }}
            >
              重选仓库
            </Text>
          </View>
        </TouchableNativeFeedback>
        <Text
          style={{
            fontSize: 16,
            color: "white",
          }}
        >
          {ctxState?.userInfo?.storages?.find(
            (x) => x.storageId == ctxState?.optSet?.curStorageId
          )?.storageName ?? "——"}
          -任务列表
        </Text>
      </View>
      <View
        style={{
          height: 60,
          width: width * 0.95,
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
          padding: 10,
          marginTop: 10,
          borderRadius: 5,
        }}
      >
        <Select
          options={options}
          selectedLabel={selectedOption?.label ?? "-"}
          onValueChange={handleValueChange}
        />
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "black",
              marginRight: 5,
            }}
          >
            {ctxState?.userInfo?.userName}
          </Text>
          <Image
            source={{
              uri:
                ctxState?.userInfo?.avatarUrl ??
                "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg3.doubanio.com%2Fview%2Fgroup_topic%2Fl%2Fpublic%2Fp515017572.jpg&refer=http%3A%2F%2Fimg3.doubanio.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1727005862&t=853fb35d132b10871ed8611db04299c6",
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
            }}
          />
        </View>
      </View>
      {/* 加载动画 */}
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width,
            height: Height * 0.5,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}

      {noData && !loading ? (
        <View
          style={{
            marginTop: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width,
            height: Height * 0.05,
          }}
        >
          <Text style={{ color: "rgb(180,180,180)" }}>下拉刷新任务</Text>
        </View>
      ) : null}

      {/* 任务 */}
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: width * 0.99,
        }}
      >
        {!loading ? (
          <ScrollView
            style={{
              width: "95%",
              height: "80%",
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* 组波 */}
            {selectedOption?.value == "1" && groupData && !noData && (
              <GoodsPositionDetailCard
                width={"100%"}
                marginTop={10}
                onPress={() => onNav(groupData)}
                item1_left={
                  <Content color={"#004D92"} fontSize={18} value={"组波任务"} />
                }
                item1_right={
                  <View
                    style={{
                      width: 100,
                      height: 30,
                      backgroundColor: "#FFF7EA",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 17, color: "#B48032" }}>
                      {groupData?.statusText}
                    </Text>
                  </View>
                }
                item2_left={
                  <Content color={"#7A7A7A"} fontSize={17} value={`任务号`} />
                }
                item2_right={
                  <Content
                    color={"#222222"}
                    fontSize={17}
                    value={`${groupData?.groupCode}`}
                  />
                }
                item3_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={15}
                    value={`${groupData?.groupCreateTime}`}
                  />
                }
              ></GoodsPositionDetailCard>
            )}
            {/* 叉车 */}
            {dataCar && (
              <GoodsPositionDetailCard
                width={"100%"}
                marginTop={10}
                onPress={() => onNav(dataCar)}
                item1_left={
                  <Content
                    color={"#004D92"}
                    fontSize={20}
                    value={`${dataCar?.taskTypeText ?? "—"}`}
                  />
                }
                item1_right={
                  <Content
                    color={"#004D92"}
                    fontSize={20}
                    value={`${dataCar?.statusName}`}
                  />
                }
                item2_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`任务单号:${dataCar?.taskNo ?? "-"}`}
                  />
                }
                item3_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`项次合计:${dataCar?.skuIdTotal}`}
                  />
                }
                item4_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`项次总数:${dataCar?.skuNumTotal}`}
                  />
                }
                item5_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`申请部门:${dataCar?.customerDepartment}`}
                  />
                }
                item6_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`创建时间:${dataCar?.createTime}`}
                  />
                }
              ></GoodsPositionDetailCard>
            )}
            {/* 按单 */}
            {dataOrder && (
              <GoodsPositionDetailCard
                width={"100%"}
                marginTop={10}
                onPress={() => onNav(dataOrder)}
                item1_left={
                  <Content
                    color={"#004D92"}
                    fontSize={20}
                    value={`${dataOrder?.taskTypeText ?? "—"}`}
                  />
                }
                item1_right={
                  <Content
                    color={"#004D92"}
                    fontSize={20}
                    value={`${dataOrder?.statusName}`}
                  />
                }
                item2_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`任务单号${dataOrder?.taskNo ?? "-"}`}
                  />
                }
                item3_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`项次合计${dataOrder?.skuIdTotal}`}
                  />
                }
                item4_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`项次总数${dataOrder?.skuNumTotal}`}
                  />
                }
                item5_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`申请部门${dataOrder?.customerDepartment}`}
                  />
                }
                item6_left={
                  <Content
                    color={"#7A7A7A"}
                    fontSize={17}
                    value={`创建时间${dataOrder?.createTime}`}
                  />
                }
              ></GoodsPositionDetailCard>
            )}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
};
export default React.memo(TasksTab);
