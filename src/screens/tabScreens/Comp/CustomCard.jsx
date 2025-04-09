import React from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
const { width, height } = Dimensions.get("window");
const centerST = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
};
const CustomCard = ({
  item1_left,
  item2_left,
  item2_right,
  item3_left,
  item3_right,
  item4_left,
  item4_right,
  onPress,
  onChangeTaskStatus,
}) => {
  return (
    <View
      style={{
        marginTop: 10,
        width: "92%",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 10,
      }}
    >
      <View
        style={{
          ...centerST,
          height: 60,
          padding: 10,
          borderBottomWidth: 2,
          borderBottomColor: "rgb(230,230,230)",
        }}
      >
        <View
          style={{
            ...centerST,
          }}
        >
          <Text>{item1_left}</Text>
        </View>
      </View>

      <View>
        {item2_left && (
          <View
            style={{
              ...centerST,
              height: 60,
              padding: 10,
            }}
          >
            <View
              style={{
                ...centerST,
              }}
            >
              <Text>{item2_left}</Text>
            </View>
            <View
              style={{
                ...centerST,
                marginRight: 30,
              }}
            >
              <Text style={{ fontSize: 16 }}>{item2_right}</Text>
            </View>
          </View>
        )}
        {item3_left && (
          <View
            style={{
              ...centerST,
              height: 60,
              padding: 10,
            }}
          >
            <View
              style={{
                ...centerST,
              }}
            >
              <Text>{item3_left}</Text>
            </View>
            <View
              style={{
                ...centerST,
                marginRight: 30,
              }}
            >
              <Text style={{ fontSize: 16 }}>{item3_right}</Text>
            </View>
          </View>
        )}
        {item4_left && (
          <View
            style={{
              ...centerST,
              height: 40,
              padding: 10,
            }}
          >
            <View
              style={{
                ...centerST,
              }}
            >
              <Text>{item4_left}</Text>
            </View>
            <View
              style={{
                ...centerST,
              }}
            >
              {item4_right}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
export default CustomCard;
