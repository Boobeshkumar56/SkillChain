
  import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../firebaseConfig";

  export default function Layout() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
  
    if (!user) {
      router.replace("/Auth");
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);


    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return <Stack screenOptions={{headerShown:false}}/>;
  }
