import { NativeModules, ToastAndroid } from "react-native";
const { SDK } = NativeModules;
import RNFS from "react-native-fs";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import getTimeId from "src/functions/getTimeId";
export default async function printImage(
  imageLink,
  token,
  width,
  height,
  type,
  quality,
  xOffset,
  yOffset,
  rotation,
  paperWidth,
  paperHeight
) {
  SDK.getLPAPI();
  const downloadImageAndGetURI = async (imageLink, token, attempt = 1) => {
    const maxAttempts = 4;
    const downloadDest = `${
      RNFS.DocumentDirectoryPath
    }/${getTimeId()}test-pic.jpeg`;
    const { promise } = RNFS.downloadFile({
      fromUrl: imageLink,
      toFile: downloadDest,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    ToastAndroid.show("正在打印中,请稍等", ToastAndroid.LONG);
    const { statusCode } = await promise;
    if (statusCode === 200) {
      return `file://${downloadDest}`;
    } else {
      if (attempt < maxAttempts) {
        ToastAndroid.show(
          "数据异常,打印失败,正在重新请求数据",
          ToastAndroid.SHORT
        );
        return downloadImageAndGetURI(imageLink, token, attempt + 1);
      } else {
        ToastAndroid.show(
          "达到最大重试次数,请在后续环节补打",
          ToastAndroid.SHORT
        );
        return null;
      }
    }
  };
  const localURI = await downloadImageAndGetURI(imageLink, token);
  if (!localURI) return;
  try {
    const response = await ImageResizer.createResizedImage(
      localURI,
      width ?? 800,
      height ?? 480,
      // width ?? 550,
      // height ?? 390,
      type ?? "JPEG",
      quality ?? 30,
      rotation ?? 0
    );
    if (!response.uri) return;
    SDK.loadBitmapFromAbsolutePath(
      response.uri,
      rotation ?? 0,
      //临时解决方案；
      xOffset ?? 20,
      yOffset ?? 0,
      // paperWidth ?? 70,
      // paperHeight ?? 50,
      paperWidth ?? 100,
      paperHeight ?? 60,
      async (error, event) => {
        if (error) {
          ToastAndroid.show("打印失败,请检查设备连接状态", ToastAndroid.SHORT);
        } else {
          try {
            await RNFS.unlink(response.uri);
            await RNFS.unlink(localURI);
            console.log(`清除打印缓存图片: ${response.uri}`);
          } catch (deleteError) {
            console.error("删除文件失败:", deleteError);
          }
        }
      }
    );
  } catch (err) {
    ToastAndroid.show("数据异常,打印失败", ToastAndroid.SHORT);
    return;
  }
}
