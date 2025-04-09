package com.awesometsproject;

import android.util.Log;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Logger;

import javax.crypto.Cipher;
import java.io.File;
import java.io.FileNotFoundException;
import android.os.Bundle;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.dothantech.lpapi.LPAPI;
import com.dothantech.lpapi.LPAPI.BarcodeType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;

public class SDK extends ReactContextBaseJavaModule {
    public SDK(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SDK";
    }

    public LPAPI api;

    @ReactMethod
    public void onCreate() {
        // 调用LPAPI对象的init方法初始化对象
        this.api = LPAPI.Factory.createInstance();
        // 请求权限
    }

    // printText("德佟电子");
    // printQRcode("http://www.detonger.com");
    @ReactMethod
    public void onDestroy() {
        // 断开蓝牙连接，释放 LPAPI 对象
        api.quit();
        // this.api.onDestroy();
    }

    @ReactMethod
    public void printQRcode(String content) {
        // 连接配对的第一个打印机对象
        api.openPrinter("");

        // 开始绘图任务，传入参数(页面宽度, 页面高度)
        api.startJob(40, 30, 0);

        // 开始一个页面的绘制，绘制二维码
        api.draw2DQRCode(content, 4, 5, 20);

        // 结束绘图任务提交打印
        api.commitJob();
    }

    @ReactMethod
    public void printText(String content) {
        // 连接配对的第一个打印机对象
        api.openPrinter("");

        // 开始绘图任务，传入参数(页面宽度, 页面高度)
        api.startJob(50, 60, 0);
        // 传入参数(需要绘制的文本字符串, 绘制的文本框左上角水平位置, 绘制的文本框左上角垂直位置, 绘制的文本框水平宽度, 绘制的文本框垂直高度, 文字大小;
        api.drawText("hello,world", 4, 5, 40, 40, 4);
        api.draw2DQRCode("http://www.detonger.com", 4, 15, 20);
        api.draw1DBarcode("123456789012", BarcodeType.AUTO, 4, 40, 20, 15, 3);
        // 结束绘图任务提交打印
        api.commitJob();
    }

    @ReactMethod
    public void printImage(String path) {
        // 连接配对的第一个打印机对象
        // api.openPrinter("");

        // // 开始绘图任务，传入参数(页面宽度, 页面高度)
        // api.startJob(100, 60, 0);
        // // 传入参数(需要绘制的文本字符串, 绘制的文本框左上角水平位置, 绘制的文本框左上角垂直位置, 绘制的文本框水平宽度, 绘制的文本框垂直高度,
        // // 文字大小;
        // api.drawImage("https://dinolloss.event.com.cn/2025_dongfeng/admin/8bb03d23-8e48-4775-83bf-c3ea0a8c6209.png",
        // 0, 0, 100, 40);

        // // 结束绘图任务提交打印
        // api.commitJob();
        // // promise.resolve("打印成功");
        // api.openPrinter("");

        // // 开始绘图任务，传入参数(页面宽度, 页面高度)
        // api.startJob(50, 60, 0);
        // // 传入参数(需要绘制的文本字符串, 绘制的文本框左上角水平位置, 绘制的文本框左上角垂直位置, 绘制的文本框水平宽度, 绘制的文本框垂直高度,
        // 文字大小;
        // api.drawText("hello,world", 4, 5, 40, 40, 4);
        // api.draw2DQRCode("http://www.detonger.com", 4, 15, 20);
        // api.draw2DQRCode("http://www.detonger.com", 4, 15, 20);
        // api.draw2DQRCode("http://www.detonger.com", 4, 15, 20);

        // // 结束绘图任务提交打印
        // api.commitJob();
    }

    public Bundle getPrintParam(int orientation, int x, int y, int printSpeed, int printDensity) {
        Bundle param = new Bundle();
        // 打印页面旋转角度
        if (orientation != 0) {
            param.putInt("PRINT_DIRECTION", orientation);
        }
        if (x >= 0) {
            param.putInt("HORIZONTAL_OFFSET_PX", x);
        }
        if (y >= 0) {
            param.putInt("VERTICAL_OFFSET_PX", y);
        }
        if (printSpeed >= 0) {
            param.putInt("PRINT_SPEED", printSpeed);
        }
        if (printDensity >= 0) {
            param.putInt("PRINT_DENSITY", printDensity);
        }
        // if (copies > 1) {
        // param.putInt("PRINT_COPIES", 3);
        // }
        // // 间隔类型
        // if (gapType >= 0) {
        // param.putInt(PrintParamName.GAP_TYPE, gapType);
        // }
        // // 间隔长度
        // if (gapLength >= 0) {
        // param.putInt(PrintParamName.GAP_LENGTH, gapLength);
        // }
        // // 打印浓度
        // if (printDensity >= 0) {
        // param.putInt(PrintParamName.PRINT_DENSITY, printDensity);
        // }
        // 打印速度
        // // 打印份数
        // if (copies > 1) {
        // param.putInt(PrintParamName.PRINT_COPIES, copies);
        // }
        return param;
    }

    @ReactMethod
    public boolean printBitmap(Bitmap bitmap, Bundle param, int paperWidth, int paperHeight) {
        // api.setPrintSpeed(5);
        // api.setPrintDarkness(10);
        // api.startJob(paperWidth, paperHeight, 0);
        return api.printBitmap(bitmap, param);
    }

    @ReactMethod
    public void loadBitmapFromAbsolutePath(String uri, int orientation, int xOffset, int yOffset, int paperWidth,
            int paperHeight,
            Callback callback) {
        String path = uri.startsWith("file://") ? uri.substring(7) : uri;
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inPreferredConfig = Bitmap.Config.RGB_565;
        Bitmap bitmap = BitmapFactory.decodeFile(path, options);
        WritableMap event = Arguments.createMap();
        event.putInt("width", bitmap.getWidth());
        event.putInt("height", bitmap.getHeight());
        callback.invoke(null, event);
        api.openPrinterSync("");
        printBitmap(bitmap, getPrintParam(orientation, xOffset, yOffset, 5, 2),
                paperWidth, paperHeight);
    }

    @ReactMethod
    public void getLPAPI(Promise promise) {
        onCreate();
    }
}
