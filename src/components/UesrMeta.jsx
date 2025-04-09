import React from "react";
import { Text, View, Image, TouchableNativeFeedback } from "react-native";

const UesrMeta = ({ userName, avator, storage, onPress, rightText }) => {
  return (
    <View
      style={{
        backgroundColor: "#004D92",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
      }}
    >
      <View>
        <Text style={{ fontSize: 22, color: "white" }}>你好！{userName}</Text>
        <Text style={{ fontSize: 18, color: "white" }}>{storage}</Text>
      </View>
      {rightText ? (
        <View>
          <TouchableNativeFeedback onPress={() => onPress()}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                width: 120,
                height: 60,
              }}
            >
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
        </View>
      ) : null}
      {avator ? (
        <Image
          source={{
            uri: avator,
          }}
          resizeMode="contain"
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
          }}
        />
      ) : null}
    </View>
  );
};
export default UesrMeta;
