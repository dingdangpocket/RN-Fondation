/* eslint-disable curly */
/* eslint-disable eqeqeq */
/* eslint-disable no-dupe-keys */
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
  View,
  Dimensions,
  PermissionsAndroid,
  ImageBackground,
  Text,
} from "react-native";
import { useContext } from "react";
import { LogoIcon } from "src/icons/index";
import { useNavigation } from "@react-navigation/native";
import { ContentContext } from "src/context/ContextProvider";
import { TouchableOpacity } from "react-native-gesture-handler";
import scale from "src/functions/scale";

const Login = () => {
  const { width } = Dimensions.get("window");
  const { dispatch, ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const requestPermission = async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
  };
  requestPermission();
  const onLogin = async () => {
    navigation.navigate("HomeTabs");
  };
  return (
    <ImageBackground
      source={require("src/static/back.jpg")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LogoIcon width="45%" height="45%" />
        <TouchableOpacity onPress={onLogin}>
          <Text style={{ fontSize: scale(50) }}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};
export default Login;
