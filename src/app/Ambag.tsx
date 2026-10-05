import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ContributionButton from "@/components/contributionButton";
import JoinContributionButton from "@/components/joinContributionButton";
import { getUser } from "@/data/authStorage";

import { addContribution } from "./api/addContribution";
import { checkJoinedAmbagan } from "./api/checkIfUserIsJoined";
import { Contributor, getCurrentAmbagan } from "./api/getCurrentAmbagan";
import { joinContribution } from "./api/joinContribution";

interface AmbaganItem {
  _id: string;
  ambaganName: string;

  contributionType: "Fixed" | "Open";

  targetAmount: number | null;

  visibility: "Public" | "Private";

  currentAmount: number;

  membersCount: number;

  user:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };

  contributors: Contributor[];

  dueDate?: string;
}

interface Member {
  user: string;
  contributorName?: string;
  amount: number;
}

export default function Ambag() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // =========================================================
  // AMBAGAN DATA
  // =========================================================

  const [ambagEvent, setAmbagEvent] = useState<AmbaganItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // =========================================================
  // MEMBERS
  // =========================================================

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // =========================================================
  // CONTRIBUTION MODAL
  // =========================================================

  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);

  const [contributionAmount, setContributionAmount] = useState("");
  const [contributeForSomeone, setContributeForSomeone] = useState(false);
  const [contributorName, setContributorName] = useState("");

  // =========================================================
  // JOIN STATUS
  // =========================================================

  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  // =========================================================
  // LOAD AMBAGAN
  // =========================================================

  const loadAmbagan = async () => {
    try {
      if (!id) {
        return;
      }

      setLoading(true);

      const data = await getCurrentAmbagan(id);

      setAmbagEvent(data);
      setMembers(data.contributors || []);
    } catch (error) {
      console.error("Failed to get ambagan:", error);

      Alert.alert("Oops!", "We couldn't load this Ambagan right now.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHECK JOIN STATUS
  // =========================================================

  const checkJoinStatus = async () => {
    try {
      if (!id) {
        return;
      }

      const user = await getUser();

      if (!user) {
        setIsJoined(false);
        return;
      }

      const joined = await checkJoinedAmbagan(id, user._id);

      setIsJoined(Boolean(joined));
    } catch (error) {
      console.error("Failed to check join status:", error);

      setIsJoined(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const initialize = async () => {
      await loadAmbagan();
      await checkJoinStatus();
    };

    initialize();
  }, [id]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetContributionForm = () => {
    setContributionAmount("");
    setContributorName("");
    setContributeForSomeone(false);
  };

  // =========================================================
  // HANDLE JOIN
  // =========================================================

  const handleJoinContribution = async () => {
    try {
      if (!id) {
        Alert.alert("Error", "Ambagan ID is missing.");
        return;
      }

      const user = await getUser();

      if (!user) {
        Alert.alert("Error", "User is not logged in.");
        return;
      }

      setJoining(true);

      const response = await joinContribution(id, user._id);

      if (!response) {
        Alert.alert("Something went wrong", "Unable to join this Ambagan.");

        return;
      }

      setIsJoined(true);

      await loadAmbagan();

      Alert.alert(
        "You're In! 🎉",
        "You have successfully joined this Ambagan.",
      );
    } catch (error) {
      console.error("Join Ambagan error:", error);

      Alert.alert("Oops!", "Failed to join this Ambagan.");
    } finally {
      setJoining(false);
    }
  };

  // =========================================================
  // HANDLE CONTRIBUTION
  // =========================================================

  const handleContribution = async () => {
    try {
      const amount = Number(contributionAmount);

      if (!contributionAmount.trim()) {
        Alert.alert("Invalid Amount", "Please enter a contribution amount.");

        return;
      }

      if (isNaN(amount) || amount <= 0) {
        Alert.alert(
          "Invalid Amount",
          "Please enter a valid contribution amount.",
        );

        return;
      }

      if (contributeForSomeone && !contributorName.trim()) {
        Alert.alert(
          "Name Required",
          "Please enter the name of the contributor.",
        );

        return;
      }

      const user = await getUser();

      if (!user) {
        Alert.alert("Error", "User is not logged in.");

        return;
      }

      const finalContributorName = contributeForSomeone
        ? contributorName.trim()
        : user.name;

      const contributionData: Member = {
        user: user._id,
        contributorName: finalContributorName,
        amount,
      };

      await addContribution(id, contributionData);

      await loadAmbagan();

      setIsContributionModalOpen(false);

      resetContributionForm();

      Alert.alert(
        "Ambag Added! 🎉",
        `Your ₱${amount.toLocaleString()} contribution has been recorded for ${finalContributorName}.`,
      );
    } catch (error) {
      console.error("Contribution error:", error);

      Alert.alert("Oops!", "Failed to add your contribution.");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingEmoji}>💜</Text>
        </View>

        <ActivityIndicator size="large" color="#6C4AB6" />

        <Text style={styles.loadingTitle}>Loading Ambagan...</Text>

        <Text style={styles.loadingText}>Getting everything ready for you</Text>
      </View>
    );
  }

  // =========================================================
  // NO DATA
  // =========================================================

  if (!ambagEvent) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyEmoji}>😕</Text>
        </View>

        <Text style={styles.emptyTitle}>Ambagan not found</Text>

        <Text style={styles.emptyText}>
          We couldn't find this Ambagan event.
        </Text>
      </View>
    );
  }

  // =========================================================
  // EVENT DATA
  // =========================================================

  const event = ambagEvent;

  const target = event.targetAmount ?? 0;
  const current = event.currentAmount ?? 0;

  const remaining = Math.max(target - current, 0);

  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  // =========================================================
  // HOST
  // =========================================================

  const host = typeof event.user === "object" ? event.user : null;

  const hostName = host?.name || "Ambagan Host";

  const hostInitial = hostName.charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* TOP BRAND */}
        {/* ================================================= */}

        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>A</Text>
            </View>

            <View>
              <Text style={styles.brandName}>TARA, AMBAGAN</Text>

              <Text style={styles.brandSubtitle}>GROUP CONTRIBUTION</Text>
            </View>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* EVENT HERO */}
        {/* ================================================= */}

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.eventTypeBadge}>
              <Text style={styles.eventTypeText}>
                {event.contributionType === "Fixed"
                  ? "🎯 FIXED GOAL"
                  : "🌟 OPEN CONTRIBUTION"}
              </Text>
            </View>

            <View style={styles.visibilityBadge}>
              <Text style={styles.visibilityText}>
                {event.visibility === "Public" ? "🌎 Public" : "🔒 Private"}
              </Text>
            </View>
          </View>

          <Text style={styles.heroLabel}>AMBAGAN EVENT</Text>

          <Text style={styles.heroTitle}>{event.ambaganName}</Text>

          <Text style={styles.heroDescription}>
            Everyone chips in. Every ambag counts.
          </Text>

          {/* HOST */}

          <View style={styles.hostCard}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>{hostInitial}</Text>
            </View>

            <View style={styles.hostInfo}>
              <View style={styles.hostTitleRow}>
                <Text style={styles.hostLabel}>HOST</Text>

                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>ORGANIZER</Text>
                </View>
              </View>

              <Text style={styles.hostName} numberOfLines={1}>
                {hostName}
              </Text>

              {host?.email && (
                <Text style={styles.hostEmail} numberOfLines={1}>
                  {host.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* CONTRIBUTION SCORE */}
        {/* ================================================= */}

        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <View>
              <Text style={styles.scoreLabel}>TOTAL AMBAG</Text>

              <Text style={styles.scoreAmount}>
                ₱{current.toLocaleString()}
              </Text>
            </View>

            <View style={styles.scoreIcon}>
              <Text style={styles.scoreIconText}>💰</Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {event.contributionType === "Fixed"
                ? "Goal Progress"
                : "Contribution Progress"}
            </Text>

            <Text style={styles.progressPercent}>
              {target > 0 ? `${progress.toFixed(0)}%` : "OPEN"}
            </Text>
          </View>

          {event.contributionType === "Fixed" ? (
            <>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressFooter}>
                <Text style={styles.progressFooterText}>
                  ₱{current.toLocaleString()} collected
                </Text>

                <Text style={styles.progressFooterText}>
                  ₱{target.toLocaleString()} goal
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.openContributionBar}>
              <Text style={styles.openContributionText}>
                ✨ No fixed contribution limit
              </Text>
            </View>
          )}
        </View>

        {/* ================================================= */}
        {/* JOIN */}
        {/* ================================================= */}

        {!isJoined && (
          <View style={styles.joinSection}>
            <View style={styles.joinMessage}>
              <Text style={styles.joinEmoji}>👋</Text>

              <View style={styles.joinMessageText}>
                <Text style={styles.joinTitle}>Want to be part of this?</Text>

                <Text style={styles.joinSubtitle}>
                  Join the Ambagan before making your ambag.
                </Text>
              </View>
            </View>

            <JoinContributionButton onPress={handleJoinContribution} />
          </View>
        )}

        {joining && (
          <View style={styles.joiningContainer}>
            <ActivityIndicator size="small" color="#6C4AB6" />

            <Text style={styles.joiningText}>Joining Ambagan...</Text>
          </View>
        )}

        {/* ================================================= */}
        {/* QUICK STATS */}
        {/* ================================================= */}

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => setIsDrawerOpen(true)}
          >
            <View style={styles.statIconBox}>
              <Text style={styles.statIcon}>👥</Text>
            </View>

            <Text style={styles.statValue}>{event.membersCount}</Text>

            <Text style={styles.statLabel}>Members</Text>

            <Text style={styles.statAction}>VIEW MEMBERS →</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Text style={styles.statIcon}>🎯</Text>
            </View>

            <Text style={styles.statValue}>
              {target > 0 ? `₱${target.toLocaleString()}` : "OPEN"}
            </Text>

            <Text style={styles.statLabel}>Target</Text>

            <Text style={styles.statAction}>
              {target > 0 ? "GOAL AMOUNT" : "NO LIMIT"}
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* REMAINING */}
        {/* ================================================= */}

        <View style={styles.remainingCard}>
          <View style={styles.remainingLeft}>
            <View style={styles.remainingTitleRow}>
              <View style={styles.remainingIcon}>
                <Text>📊</Text>
              </View>

              <Text style={styles.remainingLabel}>STILL NEEDED</Text>
            </View>

            <Text style={styles.remainingAmount}>
              {target > 0 ? `₱${remaining.toLocaleString()}` : "OPEN"}
            </Text>

            <Text style={styles.remainingSubtext}>
              {target > 0
                ? "until the goal is reached"
                : "contribute any amount you can"}
            </Text>
          </View>

          <View style={styles.circularProgress}>
            <Text style={styles.circularPercent}>
              {target > 0 ? `${progress.toFixed(0)}%` : "∞"}
            </Text>

            <Text style={styles.circularLabel}>DONE</Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* EVENT INFORMATION */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Event Info</Text>

          <Text style={styles.sectionSubtitle}>ABOUT THIS AMBAGAN</Text>
        </View>

        <View style={styles.infoCard}>
          {/* NAME */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>🏷️</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ambagan Name</Text>

              <Text style={styles.infoValue}>{event.ambaganName}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* TYPE */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>💸</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contribution Type</Text>

              <Text style={styles.infoValue}>{event.contributionType}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* TARGET */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>🎯</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Target Amount</Text>

              <Text style={styles.infoValue}>
                {target > 0
                  ? `₱${target.toLocaleString()}`
                  : "Open Contribution"}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* VISIBILITY */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>{event.visibility === "Public" ? "🌎" : "🔒"}</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Visibility</Text>

              <Text style={styles.infoValue}>{event.visibility}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* HOST */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>👑</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hosted By</Text>

              <Text style={styles.infoValue}>{hostName}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* MEMBERS */}

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setIsDrawerOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.infoIcon}>
              <Text>👥</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Members</Text>

              <Text style={[styles.infoValue, styles.infoLink]}>
                {event.membersCount} members →
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* EVENT ID */}
        {/* ================================================= */}

        <View style={styles.eventIdContainer}>
          <Text style={styles.eventIdLabel}>AMBAGAN EVENT ID</Text>

          <Text style={styles.eventId}>{event._id}</Text>
        </View>
      </ScrollView>

      {/* ================================================= */}
      {/* FLOATING CONTRIBUTION BUTTON */}
      {/* ================================================= */}

      {isJoined && (
        <ContributionButton onPress={() => setIsContributionModalOpen(true)} />
      )}

      {/* ================================================= */}
      {/* CONTRIBUTION MODAL */}
      {/* ================================================= */}

      <Modal
        visible={isContributionModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setIsContributionModalOpen(false);
          resetContributionForm();
        }}
      >
        <View style={styles.contributionOverlay}>
          <View style={styles.contributionModal}>
            <View style={styles.modalHandle} />

            {/* HEADER */}

            <View style={styles.contributionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contributionTitle}>Make an Ambag</Text>

                <Text style={styles.contributionSubtitle}>
                  Every contribution makes a difference.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setIsContributionModalOpen(false);
                  resetContributionForm();
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* EVENT PREVIEW */}

            <View style={styles.eventPreview}>
              <View style={styles.eventPreviewIcon}>
                <Text style={styles.eventPreviewEmoji}>🎉</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.eventPreviewLabel}>CONTRIBUTING TO</Text>

                <Text style={styles.eventPreviewName} numberOfLines={1}>
                  {event.ambaganName}
                </Text>

                <Text style={styles.eventPreviewHost}>
                  Hosted by {hostName}
                </Text>
              </View>
            </View>

            {/* CONTRIBUTOR SWITCH */}

            <View style={styles.contributorOption}>
              <View style={styles.contributorOptionIcon}>
                <Text>👤</Text>
              </View>

              <View style={styles.contributorOptionText}>
                <Text style={styles.contributorOptionTitle}>
                  Contributing for someone else?
                </Text>

                <Text style={styles.contributorOptionSubtitle}>
                  Turn this on if this ambag belongs to another person.
                </Text>
              </View>

              <Switch
                value={contributeForSomeone}
                onValueChange={setContributeForSomeone}
                trackColor={{
                  false: "#D8D8D8",
                  true: "#B8A4E8",
                }}
                thumbColor={contributeForSomeone ? "#6C4AB6" : "#FFFFFF"}
                ios_backgroundColor="#D8D8D8"
              />
            </View>

            {/* CONTRIBUTOR NAME */}

            {contributeForSomeone && (
              <View style={styles.contributorNameContainer}>
                <Text style={styles.inputLabel}>Contributor Name</Text>

                <TextInput
                  style={styles.contributorNameInput}
                  value={contributorName}
                  onChangeText={setContributorName}
                  placeholder="Enter contributor name"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* AMOUNT */}

            <Text style={styles.inputLabel}>Contribution Amount</Text>

            <View style={styles.amountInputContainer}>
              <Text style={styles.currency}>₱</Text>

              <TextInput
                style={styles.amountInput}
                value={contributionAmount}
                onChangeText={setContributionAmount}
                placeholder="0"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
              />
            </View>

            {/* QUICK AMOUNTS */}

            <Text style={styles.quickLabel}>QUICK AMOUNT</Text>

            <View style={styles.quickAmounts}>
              {[100, 250, 500, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setContributionAmount(amount.toString())}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickAmountText}>₱{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CONFIRM */}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleContribution}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>CONFIRM AMBAG</Text>

              <Text style={styles.confirmArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================================= */}
      {/* MEMBERS DRAWER */}
      {/* ================================================= */}

      <Modal
        visible={isDrawerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.memberModalOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHandle} />

            {/* HEADER */}

            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerEyebrow}>AMBAGAN CREW</Text>

                <Text style={styles.drawerTitle}>Members</Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsDrawerOpen(false)}
                style={styles.drawerClose}
              >
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* MEMBER COUNT */}

            <View style={styles.memberCountBanner}>
              <View style={styles.memberCountIcon}>
                <Text>👥</Text>
              </View>

              <View>
                <Text style={styles.memberCountNumber}>
                  {event.membersCount}
                </Text>

                <Text style={styles.memberCountLabel}>
                  people joined this Ambagan
                </Text>
              </View>
            </View>

            {/* HOST */}

            <View style={styles.drawerHostCard}>
              <View style={styles.drawerHostAvatar}>
                <Text style={styles.drawerHostAvatarText}>{hostInitial}</Text>
              </View>

              <View style={styles.drawerHostInfo}>
                <Text style={styles.drawerHostLabel}>👑 HOST</Text>

                <Text style={styles.drawerHostName}>{hostName}</Text>
              </View>

              <View style={styles.hostOrganizerBadge}>
                <Text style={styles.hostOrganizerText}>ORGANIZER</Text>
              </View>
            </View>

            {/* MEMBERS */}

            {members.length === 0 ? (
              <View style={styles.noMembersContainer}>
                <Text style={styles.noMembersEmoji}>🫶</Text>

                <Text style={styles.noMembersTitle}>No contributors yet</Text>

                <Text style={styles.noMembersText}>
                  Be the first one to make an ambag!
                </Text>
              </View>
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item, index) => `${item.user}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.memberList}
                renderItem={({ item, index }) => {
                  const name = item.contributorName || "Unknown contributor";

                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <View style={styles.memberRow}>
                      <View style={styles.memberRank}>
                        <Text style={styles.memberRankText}>#{index + 1}</Text>
                      </View>

                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>{initial}</Text>
                      </View>

                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{name}</Text>

                        <Text style={styles.memberRole}>CONTRIBUTOR</Text>
                      </View>

                      <View style={styles.memberAmount}>
                        <Text style={styles.memberAmountLabel}>AMBAG</Text>

                        <Text style={styles.memberAmountValue}>
                          ₱{item.amount.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F7F5FC",
  },

  content: {
    padding: 18,
    paddingBottom: 130,
  },

  // =======================================================
  // LOADING
  // =======================================================

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F5FC",
    padding: 30,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#6C4AB6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  loadingEmoji: {
    fontSize: 30,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#27213D",
    marginTop: 15,
  },

  loadingText: {
    marginTop: 5,
    color: "#8C879A",
    fontSize: 13,
  },

  // =======================================================
  // EMPTY
  // =======================================================

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F5FC",
    padding: 30,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#EEE8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyEmoji: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#27213D",
  },

  emptyText: {
    color: "#888393",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },

  // =======================================================
  // TOP BAR
  // =======================================================

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 18,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#6C4AB6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  brandIconText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  brandName: {
    color: "#302744",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  brandSubtitle: {
    color: "#9891A6",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0ED",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F05A4F",
    marginRight: 5,
  },

  liveText: {
    color: "#D9483D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  // =======================================================
  // HERO
  // =======================================================

  heroCard: {
    backgroundColor: "#6C4AB6",
    borderRadius: 28,
    padding: 21,
    marginBottom: 14,
    overflow: "hidden",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  eventTypeBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  eventTypeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  visibilityBadge: {
    backgroundColor: "#FFD447",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  visibilityText: {
    color: "#44370B",
    fontSize: 9,
    fontWeight: "900",
  },

  heroLabel: {
    color: "#DCD0F7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    marginTop: 5,
  },

  heroDescription: {
    color: "#E1D9F4",
    fontSize: 13,
    marginTop: 7,
    lineHeight: 19,
  },

  // =======================================================
  // HOST
  // =======================================================

  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 17,
    padding: 11,
    marginTop: 20,
  },

  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FFD447",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  hostAvatarText: {
    color: "#4A3A09",
    fontSize: 19,
    fontWeight: "900",
  },

  hostInfo: {
    flex: 1,
  },

  hostTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  hostLabel: {
    color: "#E3D9F5",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  hostBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 7,
  },

  hostBadgeText: {
    color: "#6C4AB6",
    fontSize: 7,
    fontWeight: "900",
  },

  hostName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },

  hostEmail: {
    color: "#D8D0ED",
    fontSize: 10,
    marginTop: 2,
  },

  // =======================================================
  // SCORE
  // =======================================================

  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },

  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scoreLabel: {
    color: "#918B9F",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  scoreAmount: {
    color: "#2A2340",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 3,
  },

  scoreIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FFF4CC",
    justifyContent: "center",
    alignItems: "center",
  },

  scoreIconText: {
    fontSize: 25,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },

  progressLabel: {
    color: "#777180",
    fontSize: 11,
    fontWeight: "700",
  },

  progressPercent: {
    color: "#6C4AB6",
    fontSize: 11,
    fontWeight: "900",
  },

  progressTrack: {
    height: 13,
    borderRadius: 10,
    backgroundColor: "#EAE6F1",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#FFD447",
  },

  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },

  progressFooterText: {
    color: "#9993A1",
    fontSize: 10,
    fontWeight: "600",
  },

  openContributionBar: {
    backgroundColor: "#F2EDFF",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },

  openContributionText: {
    color: "#6C4AB6",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
  },

  // =======================================================
  // JOIN
  // =======================================================

  joinSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE8F3",
  },

  joinMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  joinEmoji: {
    fontSize: 27,
    marginRight: 11,
  },

  joinMessageText: {
    flex: 1,
  },

  joinTitle: {
    color: "#2B2440",
    fontSize: 14,
    fontWeight: "900",
  },

  joinSubtitle: {
    color: "#8D8797",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  joiningContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 13,
  },

  joiningText: {
    marginLeft: 8,
    color: "#6C4AB6",
    fontSize: 12,
    fontWeight: "800",
  },

  // =======================================================
  // STATS
  // =======================================================

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },

  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statIcon: {
    fontSize: 19,
  },

  statValue: {
    color: "#29223D",
    fontSize: 20,
    fontWeight: "900",
  },

  statLabel: {
    color: "#888290",
    fontSize: 11,
    marginTop: 2,
  },

  statAction: {
    color: "#6C4AB6",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 10,
  },

  // =======================================================
  // REMAINING
  // =======================================================

  remainingCard: {
    backgroundColor: "#29223D",
    borderRadius: 23,
    padding: 19,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },

  remainingLeft: {
    flex: 1,
  },

  remainingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  remainingIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },

  remainingLabel: {
    color: "#BEB6CD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  remainingAmount: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 7,
  },

  remainingSubtext: {
    color: "#A9A2B5",
    fontSize: 10,
    marginTop: 3,
  },

  circularProgress: {
    width: 69,
    height: 69,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "#FFD447",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },

  circularPercent: {
    color: "#FFD447",
    fontSize: 14,
    fontWeight: "900",
  },

  circularLabel: {
    color: "#AAA3B6",
    fontSize: 6,
    fontWeight: "900",
    marginTop: 1,
  },

  // =======================================================
  // INFO
  // =======================================================

  sectionHeader: {
    marginBottom: 11,
  },

  sectionTitle: {
    color: "#2B2440",
    fontSize: 21,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#9A94A3",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 3,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F5F2FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#9992A0",
    fontSize: 10,
    fontWeight: "700",
  },

  infoValue: {
    color: "#2B2440",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },

  infoLink: {
    color: "#6C4AB6",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#F0EDF4",
  },

  eventIdContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },

  eventIdLabel: {
    color: "#AAA4B2",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  eventId: {
    color: "#8C8595",
    fontSize: 9,
    marginTop: 4,
  },

  // =======================================================
  // CONTRIBUTION MODAL
  // =======================================================

  contributionOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 40, 0.65)",
    justifyContent: "flex-end",
  },

  contributionModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  modalHandle: {
    width: 43,
    height: 5,
    backgroundColor: "#DDD9E3",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 19,
  },

  contributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 17,
  },

  contributionTitle: {
    color: "#29223D",
    fontSize: 23,
    fontWeight: "900",
  },

  contributionSubtitle: {
    color: "#8D8796",
    fontSize: 11,
    marginTop: 4,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F2F0F5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  closeButtonText: {
    color: "#615C68",
    fontSize: 15,
    fontWeight: "900",
  },

  // =======================================================
  // EVENT PREVIEW
  // =======================================================

  eventPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EFFF",
    borderRadius: 17,
    padding: 13,
    marginBottom: 15,
  },

  eventPreviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#6C4AB6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  eventPreviewEmoji: {
    fontSize: 21,
  },

  eventPreviewLabel: {
    color: "#9481BD",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  eventPreviewName: {
    color: "#29223D",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  eventPreviewHost: {
    color: "#8B8495",
    fontSize: 9,
    marginTop: 2,
  },

  // =======================================================
  // CONTRIBUTOR OPTION
  // =======================================================

  contributorOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF8FF",
    borderRadius: 16,
    padding: 13,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE8FA",
  },

  contributorOptionIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  contributorOptionText: {
    flex: 1,
    paddingRight: 8,
  },

  contributorOptionTitle: {
    color: "#29223D",
    fontSize: 12,
    fontWeight: "900",
  },

  contributorOptionSubtitle: {
    color: "#8E8897",
    fontSize: 9,
    marginTop: 3,
    lineHeight: 13,
  },

  contributorNameContainer: {
    marginBottom: 15,
  },

  inputLabel: {
    color: "#5E5867",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 7,
  },

  contributorNameInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#D9D1E9",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FBFAFE",
    fontSize: 15,
    color: "#29223D",
  },

  // =======================================================
  // AMOUNT
  // =======================================================

  amountInputContainer: {
    height: 62,
    borderWidth: 2,
    borderColor: "#6C4AB6",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    backgroundColor: "#FBFAFE",
  },

  currency: {
    color: "#6C4AB6",
    fontSize: 27,
    fontWeight: "900",
    marginRight: 7,
  },

  amountInput: {
    flex: 1,
    color: "#29223D",
    fontSize: 27,
    fontWeight: "900",
    padding: 0,
  },

  // =======================================================
  // QUICK AMOUNTS
  // =======================================================

  quickLabel: {
    color: "#85808D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },

  quickAmounts: {
    flexDirection: "row",
    gap: 7,
  },

  quickAmountButton: {
    flex: 1,
    backgroundColor: "#FFF3D0",
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE6A1",
  },

  quickAmountText: {
    color: "#9A7200",
    fontSize: 11,
    fontWeight: "900",
  },

  // =======================================================
  // CONFIRM
  // =======================================================

  confirmButton: {
    height: 56,
    backgroundColor: "#6C4AB6",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 21,
    flexDirection: "row",
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  confirmArrow: {
    color: "#FFD447",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 8,
  },

  // =======================================================
  // MEMBER MODAL
  // =======================================================

  memberModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 40, 0.65)",
    justifyContent: "flex-end",
  },

  drawerContainer: {
    backgroundColor: "#F8F6FC",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingBottom: 25,
    maxHeight: "82%",
  },

  drawerHandle: {
    width: 43,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#DAD5E2",
    alignSelf: "center",
    marginTop: 11,
    marginBottom: 15,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  drawerEyebrow: {
    color: "#958EA0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  drawerTitle: {
    color: "#29223D",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },

  drawerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECE9F1",
    justifyContent: "center",
    alignItems: "center",
  },

  drawerCloseText: {
    color: "#5D5865",
    fontSize: 15,
    fontWeight: "900",
  },

  // =======================================================
  // MEMBER COUNT
  // =======================================================

  memberCountBanner: {
    backgroundColor: "#6C4AB6",
    borderRadius: 19,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  memberCountIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  memberCountNumber: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  memberCountLabel: {
    color: "#DCD3EE",
    fontSize: 10,
    marginTop: 1,
  },

  // =======================================================
  // DRAWER HOST
  // =======================================================

  drawerHostCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#ECE8F3",
  },

  drawerHostAvatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFD447",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  drawerHostAvatarText: {
    color: "#4B3B09",
    fontSize: 17,
    fontWeight: "900",
  },

  drawerHostInfo: {
    flex: 1,
  },

  drawerHostLabel: {
    color: "#6C4AB6",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  drawerHostName: {
    color: "#29223D",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },

  hostOrganizerBadge: {
    backgroundColor: "#F0EBFF",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  hostOrganizerText: {
    color: "#6C4AB6",
    fontSize: 7,
    fontWeight: "900",
  },

  // =======================================================
  // MEMBERS
  // =======================================================

  memberList: {
    paddingBottom: 15,
  },

  memberRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#ECE8F3",
  },

  memberRank: {
    width: 26,
    alignItems: "center",
  },

  memberRankText: {
    color: "#AAA3B1",
    fontSize: 8,
    fontWeight: "900",
  },

  memberAvatar: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: "#6C4AB6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },

  memberAvatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: "#29223D",
    fontSize: 13,
    fontWeight: "900",
  },

  memberRole: {
    color: "#9A94A2",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 3,
  },

  memberAmount: {
    alignItems: "flex-end",
  },

  memberAmountLabel: {
    color: "#AAA3B1",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  memberAmountValue: {
    color: "#6C4AB6",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },

  noMembersContainer: {
    paddingVertical: 35,
    alignItems: "center",
  },

  noMembersEmoji: {
    fontSize: 34,
    marginBottom: 9,
  },

  noMembersTitle: {
    color: "#302944",
    fontSize: 15,
    fontWeight: "900",
  },

  noMembersText: {
    color: "#908A98",
    fontSize: 11,
    marginTop: 4,
  },
});
