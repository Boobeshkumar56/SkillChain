import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    // Run navigation after initial render to avoid mounting error
    setTimeout(() => {
      router.replace("/Auth");
    }, 0);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
