import React, { useState, useEffect, useContext } from "react";
import {
  View,
  ToastAndroid,
  ActivityIndicator,
  Text,
  FlatList,
} from "react-native";
import InputBar from "src/components/InputBar";
import useWindow from "src/hooks/useWindow";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import NoTabHeadBar from "src/components/NoTabHeadBar";

//按单拣货列表;
//🚀查看可用库存增加SKUID参数;
const AblePositionStack = ({ route }) => {
  const { last_taskDetail, last_itemDetail } = route.params;
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const [goodsSet, setGoodsSet] = useState("");
  const [Width, Height] = useWindow();
  const navigation = useNavigation();
  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    setRetake(!reTake);

    //获取可用列表;
    const asyncWrapper = async () => {
      setLoading(true);
      //获取任务下的项次可用货位列表;
      const response = await fetchData({
        path: `/task/orderPicking/getHasInventoryBin`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          // 任务id
          taskId: last_itemDetail.taskId,
          // 当前拣货位
          pickingStorageBinId: last_itemDetail.pickingStorageBinId,
          // 拣货作业单明细id
          // pickingNoteDetailIds: last_itemDetail.pickingNoteDetails,
          pickingNoteDetailIds: last_itemDetail?.pickingNoteDetails?.map(
            (item) => {
              return item?.pickingNoteDetailId;
            }
          ),
          skuId: last_itemDetail.skuId,
        },
      });
      console.log("可用库存", response);
      if (response.code == 200) {
        setGoodsSet(response.data);
        setLoading(false);
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        setLoading(false);
      }
    };
    asyncWrapper();
  }, [isFocused]);
  const [storageBinCode, setStorageBinCode] = useState("");
  const [resultDone, setResultDone] = useState("");
  const cancle = () => {
    setStorageBinCode("");
  };
  const onTextChange = (value) => {
    setStorageBinCode(value);
  };

  //200ms延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (storageBinCode) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(storageBinCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [storageBinCode]);

  //🚀匹配容器编码,带货位编码
  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const code = resultDone.slice(1);
    const res = goodsSet?.find((x) => {
      return x.containerCode == code;
    });
    if (!res) {
      setStorageBinCode("");
      ToastAndroid.show("未匹配到可用容器", ToastAndroid.SHORT);
    } else {
      setStorageBinCode("");
      navigation.navigate("PickTaskDetailStack", {
        pickingStorageBinCode: res.pickingStorageBinCode,
        last_taskDetail: last_taskDetail,
        curSetItem: res,
      });
    }
  }, [resultDone]);

  const handleSubmit = () => {
    if (goodsSet) {
      const res = goodsSet.find((x) => {
        return x.containerCode == storageBinCode;
      });
      if (!res) {
        setStorageBinCode("");
        ToastAndroid.show("未匹配到可用容器", ToastAndroid.SHORT);
      } else {
        setStorageBinCode("");
        navigation.navigate("PickTaskDetailStack", {
          pickingStorageBinCode: res.pickingStorageBinCode,
          last_taskDetail: last_taskDetail,
          curSetItem: res,
        });
      }
    }
  };

  return (
    <View>
      <NoTabHeadBar
        titleA={"可用库存"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <InputBar
          reTake={reTake}
          value={storageBinCode}
          placeholder={"请扫描容器编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></InputBar>
        {loading ? (
          <View
            style={{
              marginTop: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
              height: Height * 0.3,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {goodsSet && !loading && (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
              marginBottom: 0,
            }}
          >
            <FlatList
              style={{
                height: Height * 0.7,
                width: Width * 0.94,
                marginTop: 5,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={10}
              data={goodsSet}
              renderItem={({ item }) => (
                <GoodsPositionDetailCard
                  marginTop={15}
                  item1_left={<Text>容器编码:{item?.containerCode}</Text>}
                  item2_left={
                    <Text>货位编码:{item?.pickingStorageBinCode}</Text>
                  }
                  item3_left={<Text>可用库存</Text>}
                  item3_right={
                    <Text>
                      {item?.usableNum}
                      {item.unit}
                    </Text>
                  }
                  // onPress={() => onPress(item)}
                ></GoodsPositionDetailCard>
              )}
              keyExtractor={(item, index) => index}
            ></FlatList>
          </View>
        )}
      </View>
    </View>
  );
};
export default AblePositionStack;
