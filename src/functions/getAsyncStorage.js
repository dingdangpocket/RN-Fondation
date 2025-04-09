import AsyncStorage from "@react-native-async-storage/async-storage";
const getAsyncStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // console.log("storage数据获取成功");
      return JSON.parse(value);
    } else {
      // console.log("storage中无该数据");
    }
  } catch (error) {
    console.log("Error retrieving data: ", error);
  }
};
export default getAsyncStorage;
