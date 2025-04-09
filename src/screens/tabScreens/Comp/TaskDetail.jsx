import React from "react";
import { View, Text, Dimensions, TouchableNativeFeedback } from "react-native";
const { width, height } = Dimensions.get("window");
const centerST = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
};
const TaskDetails = ({
  taskTitle,
  taskStatus,
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
          <Text>叉车拣货任务{taskTitle}</Text>
        </View>
        <TouchableNativeFeedback onPress={() => onChangeTaskStatus(taskTitle)}>
          <View
            style={{
              ...centerST,
              marginRight: 30,
            }}
          >
            <Text
              style={{
                backgroundColor: "#FFF7EA",
                padding: 10,
                fontSize: 15,
                color: "#B48032",
              }}
            >
              {taskStatus ? "已领取" : "待领取"}
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      <TouchableNativeFeedback
        onPress={onPress}
        activeOpacity={0.4}
        delayPressIn={2}
        delayPressOut={8}
      >
        <View>
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
              <Text>任务单号</Text>
            </View>
            <View
              style={{
                ...centerST,
                marginRight: 30,
              }}
            >
              <Text style={{ fontSize: 16 }}>JG-CZ01-240701-0001</Text>
            </View>
          </View>
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
              <Text>项次合计</Text>
            </View>
            <View
              style={{
                ...centerST,
                marginRight: 30,
              }}
            >
              <Text style={{ fontSize: 16 }}>10</Text>
            </View>
          </View>
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
              <Text>项次总数量</Text>
            </View>
            <View
              style={{
                ...centerST,
                marginRight: 30,
              }}
            >
              <Text style={{ fontSize: 16 }}>10</Text>
            </View>
          </View>
          <View
            style={{
              ...centerST,
              height: 40,
              padding: 10,
            }}
          >
            <Text>2024-07-01 13:00:00</Text>
          </View>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};
export default TaskDetails;
