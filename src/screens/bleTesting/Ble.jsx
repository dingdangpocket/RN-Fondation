// import React, { useEffect, useState } from "react";
// import { View, Text, Button, Alert, PermissionsAndroid } from "react-native";
// import BleManager from "react-native-ble-manager";
// const Ble = () => {
//   const [isScanning, setIsScanning] = useState(false);
//   const [devices, setDevices] = useState([]);
//   useEffect(() => {
//     BleManager.start({ showAlert: false });
//     const bleManagerEmitter = new BleManager();
//     bleManagerEmitter.on(
//       "BleManagerDiscoverPeripheral",
//       handleDiscoverPeripheral
//     );
//     bleManagerEmitter.on("BleManagerStopScan", handleStopScan);
//     return () => {
//       bleManagerEmitter.remove("BleManagerDiscoverPeripheral");
//       bleManagerEmitter.remove("BleManagerStopScan");
//     };
//   }, []);

//   const handleDiscoverPeripheral = (peripheral) => {
//     console.log("Discovered", peripheral);
//     setDevices((prevDevices) => [...prevDevices, peripheral]);
//   };

//   const handleStopScan = () => {
//     setIsScanning(false);
//   };

//   const startScan = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: "Location Permission",
//           message:
//             "This app needs access to your location for bluetooth scanning.",
//           buttonNeutral: "Ask Me Later",
//           buttonNegative: "Cancel",
//           buttonPositive: "OK",
//         }
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         BleManager.scan([], 5, true).then((results) => {
//           console.log("Scanning...");
//           setIsScanning(true);
//         });
//       } else {
//         Alert.alert("Location permission denied");
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   const connectToDevice = async (peripheral) => {
//     try {
//       await BleManager.connect(peripheral.id);
//       console.log("Connected to", peripheral.name);

//       // 假设的打印机服务UUID和特征UUID
//       const serviceUUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
//       const characteristicUUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

//       await BleManager.retrieveServices(peripheral.id);
//       console.log("Retrieved services");

//       // 发送打印数据，这里使用的是假设的打印指令
//       const printData = Buffer.from([
//         0x1b,
//         0x40, // 初始化打印机
//         0x1b,
//         0x61,
//         0x01, // 设置居中对齐
//         "Hello, Printer!".toString("ascii"), // 打印文本
//         0x0a,
//         0x0a, // 打印两行空白
//         0x1d,
//         0x56,
//         0x01, // 切纸
//       ]);
//       await BleManager.write(
//         peripheral.id,
//         serviceUUID,
//         characteristicUUID,
//         printData.toString("base64"),
//         printData.length
//       );
//       console.log("Data sent to printer");
//     } catch (error) {
//       console.error("Connection error", error);
//     }
//   };
//   return (
//     <View>
//       <Button
//         title={isScanning ? "Scanning..." : "Scan for Printers"}
//         onPress={startScan}
//       />
//       {devices.map((device, index) => (
//         <Text
//           key={index}
//           style={{
//             padding: 10,
//             borderBottomWidth: 1,
//             borderBottomColor: "#ccc",
//           }}
//           onPress={() => connectToDevice(device)}
//         >
//           {device.name} - {device.id}
//         </Text>
//       ))}
//     </View>
//   );
// };

// export default Ble;
