import { View, Text, ActivityIndicator, ToastAndroid } from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import InputRefBind from "./Comp/InputRefBind";
import fetchData from "src/api/fetchData";
const ST = {
  backgroundColor: "white",
  width: "100%",
  height: 65,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const CENTER = {
  alignItems: "center",
  justifyContent: "center",
};

const CommonContainerBindStack = ({ route }) => {
  const { fromPage, containerCode, receivingNoteDetailId, routeData } =
    route.params;
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const inputRef1 = useRef(null);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    setPositionCode("");
    if (isFocused) {
      inputRef1.current.focus();
    }
  }, [isFocused]);

  const checkToken = (response) => {
    if (response.code == 1400) {
      ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
      navigation.navigate("Login");
      return;
    }
  };

  //1.货位编码框
  const [positionCode, setPositionCode] = useState("");
  const onPositionCodeCancle = () => {
    setPositionCode("");
  };
  const onPositionCodeChange = (result) => {
    setPositionCode(result);
  };

  const onBind = () => {
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: "/inside/storageBinContainer/submit",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          binding: 0,
          containerCode: containerCode,
          storageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("绑定成功", ToastAndroid.SHORT);
        navigation.navigate(fromPage, {
          bindContainerCode: containerCode,
          bindStorageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
          receivingNoteDetailId: receivingNoteDetailId,
          routeData,
        });
      } else {
        checkToken(response);
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };

  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"货位容器绑定"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View
        style={{
          ...ST,
        }}
      >
        <InputRefBind
          ref={inputRef1}
          value={positionCode}
          placeholder={"请扫描货位编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={onPositionCodeCancle}
          onTextChange={onPositionCodeChange}
          inputColor={"white"}
        ></InputRefBind>
      </View>
      <View
        style={{
          ...ST,
        }}
      >
        <Text style={{ fontSize: 20 }}>容器编码:{containerCode}</Text>
      </View>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            width: Width * 0.8,
            height: Height * 0.58,
            ...CENTER,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      <CustomButton
        title="确认绑定"
        titleColor="white"
        fontSize={18}
        width={350}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={loading ? 10 : 500}
        align={{
          ...CENTER,
        }}
        onPress={onBind}
      />
    </View>
  );
};
export default CommonContainerBindStack;
