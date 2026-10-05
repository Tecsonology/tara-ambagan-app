import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getUser, removeUser, StoredUser } from "../../data/authStorage";

// Sample members data (Replace with API fetch if needed)
interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

const SAMPLE_MEMBERS: Member[] = [
  { id: "1", name: "Alex Cruz", email: "alex@example.com", role: "Admin" },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    role: "Contributor",
  },
  { id: "3", name: "John Doe", email: "john@example.com", role: "Contributor" },
  {
    id: "4",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    role: "Contributor",
  },
];

export default function Profile() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  // State for controlling the Members Drawer Modal
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleLogout = async () => {
    await removeUser();
    router.replace("/login");
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await removeUser();
            console.log("Logout successful");
            router.replace("/login");
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Error", "Failed to logout.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Profile not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.backButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account information
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoCard}>
          {/* Name */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* User ID */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🆔</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.userId} numberOfLines={1}>
                {user._id}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>Account & Group</Text>

        <View style={styles.actionCard}>
          {/* Members Button (Triggers Drawer) */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsDrawerOpen(true)}
          >
            <Text style={styles.actionIcon}>👥</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Group Members</Text>
              <Text style={styles.actionSubtitle}>
                View contributors in your active pool
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Coming Soon", "Edit profile will be available soon.")
            }
          >
            <Text style={styles.actionIcon}>✏️</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>
                Change your account information
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Change Password */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Change password will be available soon.",
              )
            }
          >
            <Text style={styles.actionIcon}>🔒</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Change Password</Text>
              <Text style={styles.actionSubtitle}>
                Update your account password
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Logout */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>

            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.logoutText]}>
                Logout
              </Text>
              <Text style={styles.actionSubtitle}>
                Sign out of your account
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Members Bottom Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDrawerOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.drawerContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle Visual */}
            <View style={styles.drawerHandle} />

            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                Members ({SAMPLE_MEMBERS.length})
              </Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={SAMPLE_MEMBERS}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{item.role}</Text>
                  </View>
                </View>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  loadingText: {
    marginTop: 12,
    color: "#777",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  backButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
  profileCard: {
    backgroundColor: "#202020",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#202020",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  email: {
    color: "#BDBDBD",
    fontSize: 14,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  icon: {
    fontSize: 19,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  userId: {
    fontSize: 12,
    color: "#6B7280",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
  },
  actionIcon: {
    fontSize: 20,
    width: 42,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
  },
  arrow: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 10,
  },
  logoutText: {
    color: "#DC2626",
  },

  /* Drawer Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  drawerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "65%",
  },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "700",
    padding: 4,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  memberEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  roleBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: "#4F46E5",
    fontSize: 11,
    fontWeight: "700",
  },
});
