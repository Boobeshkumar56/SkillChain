import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);
const redirectUri = AuthSession.makeRedirectUri({
  native: "skillchain:/oauthredirect", // for mobile
  // for Expo proxy
});
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      android: "your-android-client-id.apps.googleusercontent.com",
      ios: "your-ios-client-id.apps.googleusercontent.com",
      default: "820846877419-98s233ftgn31mglddgj6cotm32hs8lj1.apps.googleusercontent.com", // Web
  }),
   redirectUri

});

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => router.replace("/Profile"))
        .catch((err) => {
          alert("Login failed: " + err.message);
          setLoggingIn(false);
        });
    } else if (response?.type === "error" || response?.type === "dismiss") {
      setLoggingIn(false);
    }
  }, [response]);

  const handleLogin = async () => {
    setLoggingIn(true);
 


    await promptAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>SkillChain</Text>
      <Text style={styles.slogan}>Connect through skills. Empower each other.</Text>

      <Image source={require("../assets/images/logo.jpg")} style={styles.logo} />

      {loggingIn ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={styles.googleButton} onPress={handleLogin} disabled={!request}>
          <Image
            source={{
              uri: "https://developers.google.com/identity/images/g-logo.png",
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  brand: {
    fontSize: 36,
    fontWeight: "700",
    color: "#be123c",
    marginBottom: 6,
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7f1d1d",
    marginBottom: 40,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 40,
    resizeMode: "contain",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#be123c",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 14,
    resizeMode: "contain",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
});
