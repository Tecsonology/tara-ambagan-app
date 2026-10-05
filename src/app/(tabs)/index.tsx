import { ThemedText } from "@/components/themed-text";
import { StoredUser } from "@/data/authStorage";
import * as Device from "expo-device";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import AmbaganPage from "../AmabaganPage";

import { getUser } from "@/data/authStorage";

function getDevMenuHint() {
  if (Platform.OS === "web") {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === "android" ? "cmd+m (or ctrl+m)" : "cmd+d";
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

type Item = {
  name: string;
  amount: number;
};

export default function HomeScreen() {
  const [contribute, setContribute] = useState(0);
  const [targetAmount, setTargetAmount] = useState(79);
  const [lists, setLists] = useState<Item[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await getUser();

        if (!storedUser) {
          router.replace("/login");
          return;
        }

        setUser(storedUser);
      } catch (error) {
        console.error("Failed to load profile:", error);
        Alert.alert("Error", "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    try {
      const getList = async () => {};
    } catch (error) {}
  });

  const onAdd = ({ name, amount }: Item) => {
    console.log(name + amount);
    setContribute(contribute + amount);
    setLists((prev) => [...prev, { name, amount }]);
  };

  const progressPercent = Math.min(
    100,
    Math.round((contribute / targetAmount) * 100),
  );

  return <AmbaganPage />;
}
