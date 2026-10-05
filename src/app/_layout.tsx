// app/_layout.tsx

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Ambag/[id]"
        options={{
          title: "Ambagan",
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          title: "login",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          title: "register",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="addAmbagan"
        options={{
          title: "Create Amabagan",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="seachAmbagan"
        options={{
          title: "Search Ambagan",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
