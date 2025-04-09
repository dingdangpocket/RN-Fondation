import AsyncStorage from "@react-native-async-storage/async-storage";
const setToken = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    // console.log("Data stored successfully");
  } catch (error) {
    // console.log("Error storing data: ", error);
  }
};

export default setToken;
