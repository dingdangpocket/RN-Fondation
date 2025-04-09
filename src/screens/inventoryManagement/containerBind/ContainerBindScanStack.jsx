import {
  View,
  Text,
  ActivityIndicator,
  ToastAndroid,
  Keyboard,
} from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import InputRef from "./Comp/InputRef";
import fetchData from "src/api/fetchData";
const ST = {
  backgroundColor: "white",
  width: "100%",
  height: 65,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ContainerBindScanStack = ({ route }) => {
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);

  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) inputRef1.current.focus();
  }, [isFocused]);

  const checkToken = (response) => {
    if (response.code == 1400) {
      ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
      navigation.navigate("Login");
      return;
    }
  };
  const [unBindState, setUnBindState] = useState(false);
  const [comfirmBindState, setComfirmBindState] = useState(false);
  useEffect(() => {
    if (containerCode == "" && positionCode == "") {
      setUnBindState(false);
      setComfirmBindState(false);
    }
  }, [containerCode, positionCode]);

  //1.货位编码框
  const [positionCode, setPositionCode] = useState("");
  const [positionCodeDone, setPositionCodeDone] = useState("");
  const onPositionCodeCancle = () => {
    setPositionCode("");
    inputRef1.current.focus();
  };
  const onPositionCodeChange = (result) => {
    setPositionCode(result);
  };
  //100ms延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    // console.log("货位编码", positionCode);
    if (positionCode) {
      const TIMER = setTimeout(() => {
        setPositionCodeDone("");
        setPositionCodeDone(positionCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [positionCode]);

  const [res, setRes] = useState();
  useEffect(() => {
    //Todo🚀
    //如果扫货位编码带出来容器编码，则显示“解除绑定”按钮；
    //如果没有带出来容器编码，则主动激活容器编码框，扫码容器编码校验通过后进行绑定，显示“确认绑定”按钮；
    // console.log("货位编码", positionCodeDone);
    if (!positionCodeDone.startsWith(SCAN_TAG)) return;
    if (positionCodeDone) {
      const code = positionCodeDone.slice(1);
      setLoading(true);
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/inside/storageBinContainer/getContainerByStorageBin",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { code: code },
        });
        // console.log("response", response);
        setRes(response);
        if (response.code == 200) {
          setLoading(false);
          //如果没有绑定且容器编码没数据则提示扫容器编码;
          if (response.data.binding == 0) {
            inputRef2.current.focus();
            // setContainerCode("");
            setUnBindState(false);
            setComfirmBindState(true);
          }
          if (response.data.binding == 1) {
            if (containerCode) {
              ToastAndroid.show("货位已绑定", ToastAndroid.SHORT);
              setPositionCode("");
              return;
            }
            setContainerCode("");
            setContainerCode(response.data.containerCode);
            setUnBindState(true);
            setComfirmBindState(false);
            Keyboard.dismiss();
          }
        } else {
          checkToken(response);
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  }, [positionCodeDone]);

  const handleSubmitPositionCode = () => {
    if (positionCode.startsWith(SCAN_TAG)) return;
    if (positionCode) {
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/inside/storageBinContainer/getContainerByStorageBin",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { code: positionCode },
        });
        // console.log("response", response);
        if (response.code == 200) {
          setLoading(false);
          if (response.data.binding == 0) {
            inputRef2.current.focus();
            setUnBindState(false);
            setComfirmBindState(true);
          }
          if (response.data.binding == 1) {
            setContainerCode("");
            setContainerCode(response.data.containerCode);
            setUnBindState(true);
            setComfirmBindState(false);
            Keyboard.dismiss();
          }
        } else {
          checkToken(response);
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  };

  //2.容器编码框
  const [containerCode, setContainerCode] = useState("");
  const [containerCodeDone, setContainerCodeDone] = useState("");
  const onContainerCodeCancle = () => {
    setContainerCode("");
    inputRef2.current.focus();
  };
  const onContainerCodeChange = (result) => {
    setContainerCode(result);
  };
  //100ms延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (containerCode) {
      const TIMER = setTimeout(() => {
        setContainerCodeDone("");
        setContainerCodeDone(containerCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [containerCode]);

  useEffect(() => {
    //Todo🚀
    //扫码校验容器编码;
    //如果扫容器编码带出来货位编码，则显示“解除绑定”按钮；
    //如果没有带出来货位编码，则主动激活货位编码框，扫码货位编码进行绑定，显示“确认绑定”按钮；
    // console.log("容器编码", containerCodeDone);
    if (!containerCodeDone.startsWith(SCAN_TAG)) return;
    if (containerCodeDone) {
      const code = containerCodeDone.slice(1);
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/inside/storageBinContainer/getStorageBinByContainer",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { code: code },
        });
        // console.log("response", response);
        if (response.code == 200) {
          if (response.data.binding == 0) {
            // setPositionCode("");
            setUnBindState(false);
            setComfirmBindState(true);
            inputRef1.current.focus();
          }
          if (response.data.binding == 1) {
            if (positionCode) {
              ToastAndroid.show("容器已绑定", ToastAndroid.SHORT);
              setContainerCode("");
              return;
            }
            setPositionCode("");
            setPositionCode(response.data.storageBinCode);
            setUnBindState(true);
            setComfirmBindState(false);
            Keyboard.dismiss();
          }

          setLoading(false);
        } else {
          checkToken(response);
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
  }, [containerCodeDone]);

  const handleSubmitContainerCode = () => {
    if (containerCode.startsWith(SCAN_TAG)) return;
    if (containerCode) {
      setLoading(true);
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/inside/storageBinContainer/getStorageBinByContainer",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { code: containerCode },
        });
        // console.log("response", response);
        if (response.code == 200) {
          setLoading(false);
          if (response.data.binding == 0) {
            setUnBindState(false);
            setComfirmBindState(true);
            inputRef1.current.focus();
          }
          if (response.data.binding == 1) {
            setPositionCode("");
            setPositionCode(response.data.storageBinCode);
            setUnBindState(true);
            setComfirmBindState(false);
            Keyboard.dismiss();
          }
        } else {
          checkToken(response);
          setLoading(false);
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        }
      };
      asyncWrapper();
    }
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
          containerCode: containerCode.startsWith(SCAN_TAG)
            ? containerCode.slice(1)
            : containerCode,
          storageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("绑定成功", ToastAndroid.SHORT);
        setContainerCode("");
        setPositionCode("");
      } else {
        checkToken(response);
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };

  const onUnBind = () => {
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: "/inside/storageBinContainer/submit",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          binding: 1,
          containerCode: containerCode.startsWith(SCAN_TAG)
            ? containerCode.slice(1)
            : containerCode,
          storageBinCode: positionCode.startsWith(SCAN_TAG)
            ? positionCode.slice(1)
            : positionCode,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("解绑成功", ToastAndroid.SHORT);
        setContainerCode("");
        setPositionCode("");
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
        height: Height,
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
        <InputRef
          ref={inputRef1}
          value={positionCode}
          placeholder={"请扫描货位编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={onPositionCodeCancle}
          onTextChange={onPositionCodeChange}
          inputColor={"white"}
          handleSubmit={handleSubmitPositionCode}
        ></InputRef>
      </View>
      <View
        style={{
          ...ST,
        }}
      >
        <InputRef
          ref={inputRef2}
          value={containerCode}
          placeholder={"请扫描容器编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={onContainerCodeCancle}
          onTextChange={onContainerCodeChange}
          inputColor={"white"}
          handleSubmit={handleSubmitContainerCode}
        ></InputRef>
      </View>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width * 0.8,
            height: Height * 0.5,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {unBindState ? (
        <CustomButton
          title="解除绑定"
          titleColor="white"
          fontSize={18}
          width={350}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={Height * 0.45}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onUnBind}
        />
      ) : null}
      {comfirmBindState ? (
        <CustomButton
          title="确认绑定"
          titleColor="white"
          fontSize={18}
          width={350}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={Height * 0.45}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onBind}
        />
      ) : null}
    </View>
  );
};
export default ContainerBindScanStack;
