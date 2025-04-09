import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { BackIcon } from "src/icons/index";
import { useNavigation } from "@react-navigation/native";

const TabAndBackBar = ({
  titleA,
  titleB,
  PageA,
  listA,
  listB,
  PageB,
  onRightFun,
  handleTabChange,
  activeTab,
  icon,
}) => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  // const [activeTab, setActiveTab] = useState("A");
  const onTabChange = (tab) => {
    handleTabChange(tab);
  };
  return (
    <View
      style={{
        flex: 1,
        width: width,
      }}
    >
      <View
        style={{
          backgroundColor: "#004D92",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          height: 60,
          flexDirection: "row",
        }}
      >
        <TouchableWithoutFeedback
          activeOpacity={0.8}
          delayPressIn={5}
          delayPressOut={15}
          onPress={() => navigation.goBack()}
        >
          <View
            style={{
              marginLeft: "3%",
              width: 55,
              height: 30,
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <BackIcon width={25} height={25} />
          </View>
        </TouchableWithoutFeedback>
        <View
          style={{
            flexDirection: "row",
            width: 200,
            marginLeft: "10%",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            delayPressIn={5}
            delayPressOut={15}
            onPress={() => onTabChange("A")}
          >
            <View
              style={[
                styles.tabButton,
                activeTab === "A" && styles.activeTabButton,
              ]}
            >
              <Text style={styles.tabText}>{titleA}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            delayPressIn={5}
            delayPressOut={15}
            style={[
              styles.tabButton,
              activeTab === "B" && styles.activeTabButton,
            ]}
            onPress={() => onTabChange("B")}
          >
            <Text style={styles.tabText}>{titleB}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          delayPressIn={5}
          delayPressOut={15}
          onPress={() => onRightFun()}
        >
          <View
            style={{
              marginLeft: "10%",
              width: 60,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon}
          </View>
        </TouchableOpacity>
      </View>
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "A" && <PageA list={listA} />}
        {activeTab === "B" && <PageB list={listB} />}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    margin: 5,
  },
  activeTabButton: {
    borderBottomColor: "white",
  },
  tabText: {
    fontSize: 16,
    color: "white",
  },
  tabContent: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default TabAndBackBar;
