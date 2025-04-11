
package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.ArrayList;

// @bam.tech/react-native-image-resizer
import com.reactnativeimageresizer.ImageResizerPackage;
// @react-native-async-storage/async-storage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
// react-native-ble-manager
import it.innove.BleManagerPackage;
// react-native-code-push
import com.microsoft.codepush.react.CodePush;
// react-native-fs
import com.rnfs.RNFSPackage;
// react-native-gesture-handler
import com.swmansion.gesturehandler.RNGestureHandlerPackage;
// react-native-localize
import com.zoontek.rnlocalize.RNLocalizePackage;
// react-native-reanimated
import com.swmansion.reanimated.ReanimatedPackage;
// react-native-safe-area-context
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
// react-native-screens
import com.swmansion.rnscreens.RNScreensPackage;
// react-native-svg
import com.horcrux.svg.SvgPackage;
// react-native-view-shot
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
// react-native-wechat-lib
import com.theweflex.react.WeChatPackage;
// rn-fetch-blob
import com.RNFetchBlob.RNFetchBlobPackage;

public class PackageList {
  private Application application;
  private ReactNativeHost reactNativeHost;
  private MainPackageConfig mConfig;

  public PackageList(ReactNativeHost reactNativeHost) {
    this(reactNativeHost, null);
  }

  public PackageList(Application application) {
    this(application, null);
  }

  public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
    this.reactNativeHost = reactNativeHost;
    mConfig = config;
  }

  public PackageList(Application application, MainPackageConfig config) {
    this.reactNativeHost = null;
    this.application = application;
    mConfig = config;
  }

  private ReactNativeHost getReactNativeHost() {
    return this.reactNativeHost;
  }

  private Resources getResources() {
    return this.getApplication().getResources();
  }

  private Application getApplication() {
    if (this.reactNativeHost == null) return this.application;
    return this.reactNativeHost.getApplication();
  }

  private Context getApplicationContext() {
    return this.getApplication().getApplicationContext();
  }

  public ArrayList<ReactPackage> getPackages() {
    return new ArrayList<>(Arrays.<ReactPackage>asList(
      new MainReactPackage(mConfig),
      new ImageResizerPackage(),
      new AsyncStoragePackage(),
      new BleManagerPackage(),
      new CodePush(getResources().getString(com.awesometsproject.R.string.CodePushDeploymentKey), getApplicationContext(), com.awesometsproject.BuildConfig.DEBUG),
      new RNFSPackage(),
      new RNGestureHandlerPackage(),
      new RNLocalizePackage(),
      new ReanimatedPackage(),
      new SafeAreaContextPackage(),
      new RNScreensPackage(),
      new SvgPackage(),
      new RNViewShotPackage(),
      new WeChatPackage(),
      new RNFetchBlobPackage()
    ));
  }
}
