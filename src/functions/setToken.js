import AsyncStorage from "@react-native-async-storage/async-storage";
const setToken = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {}
};

export default setToken;
