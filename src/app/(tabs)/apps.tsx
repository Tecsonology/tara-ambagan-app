import { router } from "expo-router";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AppCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  tag: string;
  color: string;
  routePath?: string;
}

const APPS: AppCardProps[] = [
  {
    title: "Ambagan",
    subtitle: "Group Contributions & Pools",
    description:
      "Collect money for shared events, gifts, and group projects effortlessly.",
    icon: "🤝",
    tag: "Featured",
    color: "#4F46E5", // Indigo
    routePath: "/",
  },
  {
    title: "Split Bills",
    subtitle: "Equal & Custom Expense Split",
    description:
      "Scan receipts and instantly divide dining, trip, or hangout costs.",
    icon: "💸",
    tag: "Popular",
    color: "#059669", // Emerald Green
    routePath: "/Ambag/1",
  },
  {
    title: "BahayHub",
    subtitle: "Household Shared Expenses",
    description:
      "Manage monthly rent, electricity, Wi-Fi, and grocery contributions.",
    icon: "🏠",
    tag: "Utility",
    color: "#D97706", // Amber
    routePath: "/",
  },
];

export default function AppShowcase() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />

      {/* 3 Grid Stack */}
      <View style={styles.gridContainer}>
        {APPS.map((app, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              if (app.routePath) {
                router.push(app.routePath as any);
              }
            }}
          >
            {/* Top Row: Icon + Tag */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: app.color + "15" },
                ]}
              >
                <Text style={styles.icon}>{app.icon}</Text>
              </View>
              <View
                style={[styles.badge, { backgroundColor: app.color + "15" }]}
              >
                <Text style={[styles.badgeText, { color: app.color }]}>
                  {app.tag}
                </Text>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.cardTitle}>{app.title}</Text>
            <Text style={styles.cardSubtitle}>{app.subtitle}</Text>
            <Text style={styles.cardDescription}>{app.description}</Text>

            {/* Action Bar */}
            <View style={styles.cardFooter}>
              <Text style={[styles.actionText, { color: app.color }]}>
                Open App
              </Text>
              <Text style={[styles.arrow, { color: app.color }]}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1d3ec1",
    paddingHorizontal: 20,
    justifyContent: "center",
    padding: 10,
  },
  header: {
    marginBottom: 20,
  },
  topTag: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  gridContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  arrow: {
    fontSize: 15,
    fontWeight: "700",
  },
});
