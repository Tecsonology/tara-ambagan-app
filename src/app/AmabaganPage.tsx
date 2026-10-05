import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getUserId } from "@/data/authStorage";
import { getUserAmbagan, JoinedContribution } from "./api/getUserAmbagan";
import { Ambagan, getUserCreatedAmbagan } from "./api/getUserCreatedAmbagan";

export default function AmbaganPage() {
  const [lists, setLists] = useState<JoinedContribution[]>([]);
  const [myLists, setMyLists] = useState<Ambagan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAmbagans = async () => {
      try {
        setLoading(true);
        const userId = await getUserId();

        if (!userId) {
          setLists([]);
          setMyLists([]);
          return;
        }

        const [joinedData, createdData] = await Promise.all([
          getUserAmbagan(userId),
          getUserCreatedAmbagan(userId),
        ]);

        setLists(Array.isArray(joinedData) ? joinedData : []);
        setMyLists(Array.isArray(createdData) ? createdData : []);
      } catch (error) {
        console.error("Error fetching Ambagans:", error);
        setLists([]);
        setMyLists([]);
      } finally {
        setLoading(false);
      }
    };

    loadAmbagans();
  }, []);

  const selectedList = (id?: string) => {
    if (!id) return;
    router.push({
      pathname: "/Ambag",
      params: { id },
    });
  };

  const getProgress = (currentAmount: number, targetAmount: number | null) => {
    if (!targetAmount || targetAmount <= 0) return 0;
    return Math.round(Math.min(currentAmount / targetAmount, 1) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND HEADER */}
        <View style={styles.brandHeader}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("@/assets/unofficial_logo.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          {/* ACTION BUTTONS GROUP */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.joinButton}
              activeOpacity={0.85}
              onPress={() => router.push("/searchAmbagan")}
            >
              <Text style={styles.joinButtonIcon}>🔗</Text>
              <Text style={styles.joinButtonText}>JOIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              onPress={() => router.replace("/addAmbagan")}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>CREATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#46178F" />
            <Text style={styles.loadingText}>Gathering your pools...</Text>
          </View>
        ) : (
          <>
            {/* MY AMBAGAN SECTION */}
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionTitleBadge,
                  { backgroundColor: "#1368CE" },
                ]}
              >
                <Text style={styles.sectionTitle}>MY AMBAGANS</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{myLists.length}</Text>
              </View>
            </View>

            {myLists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Ambagan Created Yet!</Text>
                <Text style={styles.emptySubtitle}>
                  Host a pool to collect contributions with your group.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  activeOpacity={0.85}
                  onPress={() => router.replace("/addAmbagan")}
                >
                  <Text style={styles.emptyButtonText}>+ START AN AMBAGAN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myLists.map((ambagan) => {
                const currentAmount = ambagan.currentAmount || 0;
                const targetAmount = ambagan.targetAmount || 0;
                const progressPercentage = getProgress(
                  currentAmount,
                  targetAmount,
                );

                return (
                  <TouchableOpacity
                    key={ambagan._id}
                    style={styles.cardHost}
                    activeOpacity={0.88}
                    onPress={() => selectedList(ambagan._id)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.typeTagHost}>
                        <Text style={styles.typeTagText}>
                          {ambagan.contributionType || "POOL"}
                        </Text>
                      </View>
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>★ HOST</Text>
                      </View>
                    </View>

                    <Text style={styles.ambaganTitle}>
                      {ambagan.ambaganName}
                    </Text>

                    <View style={styles.amountContainer}>
                      <Text style={styles.amountLabel}>RAISED</Text>
                      <View style={styles.amountRow}>
                        <Text style={styles.amountText}>
                          ₱{currentAmount.toLocaleString()}
                        </Text>
                        {targetAmount > 0 && (
                          <Text style={styles.targetText}>
                            {" "}
                            / ₱{targetAmount.toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    {targetAmount > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFillHost,
                              { width: `${progressPercentage}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {progressPercentage}% FUNDED
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.footerInfoText}>
                        👥 {ambagan.membersCount} Members
                      </Text>
                      <Text style={styles.footerInfoText}>
                        🔒 {ambagan.visibility}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* JOINED AMBAGAN SECTION */}
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <View
                style={[
                  styles.sectionTitleBadge,
                  { backgroundColor: "#E21B3C" },
                ]}
              >
                <Text style={styles.sectionTitle}>JOINED AMBAGANS</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{lists.length}</Text>
              </View>
            </View>

            {lists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Joined Ambagans</Text>
                <Text style={styles.emptySubtitle}>
                  When you join other pools, they will show up right here.
                </Text>
              </View>
            ) : (
              lists.map((item) => {
                const ambagan = item.ambaganId;
                if (!ambagan) return null;

                const currentAmount = ambagan.currentAmount || 0;
                const targetAmount = ambagan.targetAmount || 0;
                const progressPercentage = getProgress(
                  currentAmount,
                  targetAmount,
                );

                return (
                  <TouchableOpacity
                    key={ambagan._id}
                    style={styles.cardJoined}
                    activeOpacity={0.88}
                    onPress={() => selectedList(ambagan._id)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.typeTagJoined}>
                        <Text style={styles.typeTagText}>
                          {ambagan.contributionType || "MEMBER"}
                        </Text>
                      </View>
                      <Text style={styles.membersCountPill}>
                        👥 {ambagan.membersCount}
                      </Text>
                    </View>

                    <Text style={styles.ambaganTitle}>
                      {ambagan.ambaganName}
                    </Text>

                    <View style={styles.amountContainer}>
                      <Text style={styles.amountLabel}>TOTAL POOL</Text>
                      <View style={styles.amountRow}>
                        <Text style={styles.amountTextJoined}>
                          ₱{currentAmount.toLocaleString()}
                        </Text>
                        {targetAmount > 0 && (
                          <Text style={styles.targetText}>
                            {" "}
                            / ₱{targetAmount.toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    {targetAmount > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFillJoined,
                              { width: `${progressPercentage}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {progressPercentage}% FUNDED
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.footerInfoText}>
                        🌐 {ambagan.visibility} Pool
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F8",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* BRAND HEADER */
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: "#E5E7EB",
  },

  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#46178F",
  },

  logoImage: {
    width: "100%",
    height: "100%",
  },

  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1368CE", // Blue Accent
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: "#0E4B95",
  },

  joinButtonIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 6,
  },

  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#26890C", // Kahoot Green
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: "#1B5E08",
  },

  addButtonIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 4,
    lineHeight: 20,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  /* SECTIONS */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitleBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },

  countBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },

  countBadgeText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
  },

  /* HOST CARDS */
  cardHost: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#1368CE",
    borderBottomWidth: 6,
    borderBottomColor: "#0E4B95",
  },

  /* JOINED CARDS */
  cardJoined: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E21B3C",
    borderBottomWidth: 6,
    borderBottomColor: "#A31028",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  typeTagHost: {
    backgroundColor: "#E8F2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  typeTagJoined: {
    backgroundColor: "#FFEBEF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  typeTagText: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  hostBadge: {
    backgroundColor: "#D89E00",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  hostBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  membersCountPill: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },

  ambaganTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  amountContainer: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  amountLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    letterSpacing: 0.5,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },

  amountText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1368CE",
  },

  amountTextJoined: {
    fontSize: 18,
    fontWeight: "900",
    color: "#E21B3C",
  },

  targetText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
  },

  progressContainer: {
    marginTop: 4,
    marginBottom: 10,
  },

  progressBarBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
  },

  progressBarFillHost: {
    height: "100%",
    backgroundColor: "#1368CE",
    borderRadius: 5,
  },

  progressBarFillJoined: {
    height: "100%",
    backgroundColor: "#E21B3C",
    borderRadius: 5,
  },

  progressText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    marginTop: 4,
    textAlign: "right",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
    marginTop: 4,
  },

  footerInfoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "capitalize",
  },

  /* EMPTY STATE */
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 16,
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },

  emptySubtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },

  emptyButton: {
    marginTop: 16,
    backgroundColor: "#1368CE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: "#0E4B95",
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  centered: {
    paddingVertical: 60,
    alignItems: "center",
  },

  loadingText: {
    color: "#46178F",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
  },
});
