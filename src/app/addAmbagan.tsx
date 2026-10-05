import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getUser, getUserId } from "@/data/authStorage";
import { router } from "expo-router";
import { createAmbagan } from "./api/createAmbagan";
import { joinContribution } from "./api/joinContribution";

export interface AmbaganFormData {
  user: string;
  ambaganName: string;
  contributionType: "Fixed" | "Open";
  targetAmount?: number;
  visibility: "Public" | "Private";
  dueDate?: string;
}

interface AmbaganFormProps {
  onSubmit?: (data: AmbaganFormData) => void;
  loading?: boolean;
}

export default function AmbaganForm({
  onSubmit,
  loading = false,
}: AmbaganFormProps) {
  const [ambaganName, setAmbaganName] = useState("");

  const [contributionType, setContributionType] = useState<"Fixed" | "Open">(
    "Open",
  );

  const [targetAmount, setTargetAmount] = useState("");

  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");

  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async () => {
    try {
      const currentUser = await getUser();

      if (!currentUser) {
        Alert.alert("Error", "User is not logged in.");
        return;
      }

      if (!ambaganName.trim()) {
        Alert.alert("Missing Information", "Please enter an Ambagan name.");
        return;
      }

      let amount: number | undefined;

      if (contributionType === "Fixed") {
        amount = Number(targetAmount);

        if (!targetAmount.trim() || isNaN(amount) || amount <= 0) {
          Alert.alert(
            "Invalid Amount",
            "Please enter a target amount greater than 0.",
          );
          return;
        }
      }

      const data: AmbaganFormData = {
        user: currentUser._id,
        ambaganName: ambaganName.trim(),
        contributionType,
        visibility,
      };

      if (amount !== undefined) {
        data.targetAmount = amount;
      }

      if (dueDate.trim()) {
        data.dueDate = dueDate.trim();
      }

      if (onSubmit) {
        onSubmit(data);
        return;
      }

      const result = await createAmbagan(data);

      if (!result || !result.id) {
        Alert.alert("Error", "Failed to create Ambagan.");
        return;
      }

      const userid = await getUserId();

      if (userid) {
        try {
          const joinThisUser = await joinContribution(result.id, userid);

          console.log("Host joined Ambagan:", joinThisUser);
        } catch (joinError) {
          console.error("Failed to automatically join host:", joinError);
        }
      }

      Alert.alert(
        "Ambagan Created! 🎉",
        "Your Ambagan has been successfully created.",
        [
          {
            text: "Let's Go!",
            onPress: () => router.replace("/"),
          },
        ],
      );
    } catch (error) {
      console.error("Create Ambagan error:", error);

      Alert.alert("Error", "Something went wrong while creating the Ambagan.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* HERO HEADER */}
        {/* ================================================= */}

        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>✨ NEW AMBAGAN</Text>
          </View>

          <Text style={styles.title}>
            Create Your{"\n"}
            <Text style={styles.titleAccent}>Ambagan!</Text>
          </Text>

          <Text style={styles.subtitle}>
            Start a group contribution and bring everyone together for something
            awesome.
          </Text>
        </View>

        {/* ================================================= */}
        {/* STEP INDICATOR */}
        {/* ================================================= */}

        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>

            <Text style={styles.stepTextActive}>Details</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>

            <Text style={styles.stepText}>Options</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>

            <Text style={styles.stepText}>Create</Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* HOST CARD */}
        {/* ================================================= */}

        <View style={styles.hostCard}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostAvatarText}>{getInitial("You")}</Text>
          </View>

          <View style={styles.hostInfo}>
            <Text style={styles.hostLabel}>YOU ARE THE HOST</Text>

            <Text style={styles.hostName}>
              {/** Current user is handled during submit */}
              Ambagan Organizer
            </Text>

            <Text style={styles.hostDescription}>
              You'll manage this Ambagan and its members.
            </Text>
          </View>

          <View style={styles.hostBadge}>
            <Text style={styles.hostBadgeText}>HOST</Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* AMBAGAN NAME */}
        {/* ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>01</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Name your Ambagan</Text>

              <Text style={styles.sectionSubtitle}>
                Give your event a memorable name
              </Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputIcon}>🎯</Text>

            <TextInput
              value={ambaganName}
              onChangeText={setAmbaganName}
              placeholder="e.g. Birthday Celebration"
              placeholderTextColor="#A6A3B5"
              style={styles.input}
              maxLength={100}
            />
          </View>

          <Text style={styles.characterCount}>{ambaganName.length}/100</Text>
        </View>

        {/* ================================================= */}
        {/* CONTRIBUTION TYPE */}
        {/* ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>02</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Choose your contribution style
              </Text>

              <Text style={styles.sectionSubtitle}>
                Decide how people will contribute
              </Text>
            </View>
          </View>

          <View style={styles.optionGrid}>
            {/* FIXED */}

            <TouchableOpacity
              style={[
                styles.bigOption,
                contributionType === "Fixed" && styles.bigOptionActive,
              ]}
              onPress={() => setContributionType("Fixed")}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIcon, styles.optionIconPurple]}>
                <Text style={styles.optionEmoji}>🎯</Text>
              </View>

              <Text style={styles.bigOptionTitle}>Fixed</Text>

              <Text style={styles.bigOptionDescription}>
                Set a target amount for the group.
              </Text>

              <View
                style={[
                  styles.selectionIndicator,
                  contributionType === "Fixed" &&
                    styles.selectionIndicatorActive,
                ]}
              >
                {contributionType === "Fixed" && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* OPEN */}

            <TouchableOpacity
              style={[
                styles.bigOption,
                contributionType === "Open" && styles.bigOptionActiveOrange,
              ]}
              onPress={() => setContributionType("Open")}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIcon, styles.optionIconOrange]}>
                <Text style={styles.optionEmoji}>🪙</Text>
              </View>

              <Text style={styles.bigOptionTitle}>Open</Text>

              <Text style={styles.bigOptionDescription}>
                Let everyone contribute any amount.
              </Text>

              <View
                style={[
                  styles.selectionIndicator,
                  contributionType === "Open" &&
                    styles.selectionIndicatorOrange,
                ]}
              >
                {contributionType === "Open" && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================= */}
        {/* TARGET AMOUNT */}
        {/* ================================================= */}

        {contributionType === "Fixed" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>03</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Set your target</Text>

                <Text style={styles.sectionSubtitle}>
                  How much do you want to collect?
                </Text>
              </View>
            </View>

            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>TOTAL TARGET</Text>

              <View style={styles.targetInputRow}>
                <Text style={styles.targetCurrency}>₱</Text>

                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0"
                  placeholderTextColor="#B4AADB"
                  keyboardType="decimal-pad"
                  style={styles.targetInput}
                />
              </View>

              <Text style={styles.targetHelper}>
                Example: ₱10,000 for a group celebration
              </Text>
            </View>
          </View>
        )}

        {/* ================================================= */}
        {/* VISIBILITY */}
        {/* ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>
                {contributionType === "Fixed" ? "04" : "03"}
              </Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Who can join?</Text>

              <Text style={styles.sectionSubtitle}>
                Choose your Ambagan visibility
              </Text>
            </View>
          </View>

          <View style={styles.visibilityContainer}>
            {/* PUBLIC */}

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === "Public" && styles.visibilityActive,
              ]}
              onPress={() => setVisibility("Public")}
              activeOpacity={0.85}
            >
              <View style={styles.visibilityIcon}>
                <Text style={styles.visibilityEmoji}>🌎</Text>
              </View>

              <View style={styles.visibilityText}>
                <Text style={styles.visibilityTitle}>Public</Text>

                <Text style={styles.visibilityDescription}>
                  Anyone can discover and join.
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  visibility === "Public" && styles.radioActive,
                ]}
              >
                {visibility === "Public" && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>

            {/* PRIVATE */}

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === "Private" && styles.visibilityActive,
              ]}
              onPress={() => setVisibility("Private")}
              activeOpacity={0.85}
            >
              <View style={styles.visibilityIcon}>
                <Text style={styles.visibilityEmoji}>🔒</Text>
              </View>

              <View style={styles.visibilityText}>
                <Text style={styles.visibilityTitle}>Private</Text>

                <Text style={styles.visibilityDescription}>
                  Only invited people can join.
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  visibility === "Private" && styles.radioActive,
                ]}
              >
                {visibility === "Private" && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================= */}
        {/* DUE DATE */}
        {/* ================================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>
                {contributionType === "Fixed" ? "05" : "04"}
              </Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Add a deadline</Text>

              <Text style={styles.sectionSubtitle}>
                Optional — set when contributions end
              </Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputIcon}>📅</Text>

            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A6A3B5"
              style={styles.input}
            />
          </View>
        </View>

        {/* ================================================= */}
        {/* LIVE PREVIEW */}
        {/* ================================================= */}

        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewLabel}>LIVE PREVIEW</Text>

              <Text style={styles.previewTitle}>
                This is what your Ambagan will look like
              </Text>
            </View>

            <Text style={styles.previewEmoji}>👀</Text>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.previewTop}>
              <View style={styles.previewIcon}>
                <Text style={styles.previewIconText}>🎉</Text>
              </View>

              <View style={styles.previewInfo}>
                <Text style={styles.previewSmall}>AMBAGAN</Text>

                <Text style={styles.previewName} numberOfLines={1}>
                  {ambaganName || "Your Ambagan Name"}
                </Text>
              </View>

              <View style={styles.previewVisibility}>
                <Text style={styles.previewVisibilityText}>
                  {visibility === "Public" ? "PUBLIC" : "PRIVATE"}
                </Text>
              </View>
            </View>

            <View style={styles.previewAmount}>
              <Text style={styles.previewAmountLabel}>
                CURRENT CONTRIBUTION
              </Text>

              <Text style={styles.previewAmountValue}>₱0</Text>

              <Text style={styles.previewTarget}>
                of{" "}
                {contributionType === "Fixed"
                  ? `₱${Number(targetAmount || 0).toLocaleString()}`
                  : "open"}{" "}
                target
              </Text>
            </View>

            <View style={styles.previewBottom}>
              <View>
                <Text style={styles.previewBottomLabel}>HOST</Text>

                <Text style={styles.previewHost}>You</Text>
              </View>

              <View>
                <Text style={styles.previewBottomLabel}>MEMBERS</Text>

                <Text style={styles.previewHost}>1</Text>
              </View>

              <View>
                <Text style={styles.previewBottomLabel}>TYPE</Text>

                <Text style={styles.previewHost}>{contributionType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryEmoji}>🚀</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Ready to launch?</Text>

              <Text style={styles.summarySubtitle}>
                Review your Ambagan before creating it.
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <SummaryRow label="Name" value={ambaganName || "Not set"} />

          <SummaryRow label="Contribution" value={contributionType} />

          {contributionType === "Fixed" && (
            <SummaryRow
              label="Target"
              value={`₱${Number(targetAmount || 0).toLocaleString()}`}
            />
          )}

          <SummaryRow label="Visibility" value={visibility} />

          {dueDate.trim() && <SummaryRow label="Due Date" value={dueDate} />}
        </View>

        {/* ================================================= */}
        {/* CREATE BUTTON */}
        {/* ================================================= */}

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <View style={styles.createButtonIcon}>
            <Text style={styles.createButtonIconText}>
              {loading ? "..." : "🚀"}
            </Text>
          </View>

          <Text style={styles.createButtonText}>
            {loading ? "Creating Ambagan..." : "Create Ambagan"}
          </Text>

          {!loading && <Text style={styles.createButtonArrow}>→</Text>}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You will become the host of this Ambagan.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ========================================================= */
/* SUMMARY ROW */
/* ========================================================= */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>

      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* ========================================================= */
/* INITIAL */
/* ========================================================= */

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  /* ========================= */
  /* HERO */
  /* ========================= */

  hero: {
    marginTop: 18,
    marginBottom: 25,
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE8FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 12,
  },

  heroBadgeText: {
    color: "#6C4AB6",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  title: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: "#24213A",
  },

  titleAccent: {
    color: "#6C4AB6",
  },

  subtitle: {
    marginTop: 10,
    color: "#777487",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 350,
  },

  /* ========================= */
  /* STEPS */
  /* ========================= */

  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  stepItem: {
    alignItems: "center",
  },

  stepCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6C4AB6",
    justifyContent: "center",
    alignItems: "center",
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E2EA",
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumberActive: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 13,
  },

  stepNumber: {
    color: "#898493",
    fontWeight: "800",
    fontSize: 13,
  },

  stepTextActive: {
    marginTop: 5,
    fontSize: 10,
    color: "#6C4AB6",
    fontWeight: "800",
  },

  stepText: {
    marginTop: 5,
    fontSize: 10,
    color: "#9895A0",
    fontWeight: "700",
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2DFE8",
    marginHorizontal: 8,
    marginBottom: 18,
  },

  /* ========================= */
  /* HOST */
  /* ========================= */

  hostCard: {
    backgroundColor: "#24213A",
    borderRadius: 22,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  hostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFD447",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  hostAvatarText: {
    color: "#24213A",
    fontSize: 20,
    fontWeight: "900",
  },

  hostInfo: {
    flex: 1,
  },

  hostLabel: {
    color: "#AFAABE",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  hostName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  hostDescription: {
    color: "#B8B3C6",
    fontSize: 10,
    marginTop: 3,
  },

  hostBadge: {
    backgroundColor: "#6C4AB6",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  hostBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  /* ========================= */
  /* SECTION */
  /* ========================= */

  section: {
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEE8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  sectionNumberText: {
    color: "#6C4AB6",
    fontSize: 11,
    fontWeight: "900",
  },

  sectionTitle: {
    color: "#24213A",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#888492",
    fontSize: 11,
    marginTop: 2,
  },

  /* ========================= */
  /* INPUT */
  /* ========================= */

  inputCard: {
    height: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#E5E1EC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  inputIcon: {
    fontSize: 20,
    marginRight: 11,
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#24213A",
    fontWeight: "600",
  },

  characterCount: {
    color: "#AAA6B1",
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
  },

  /* ========================= */
  /* CONTRIBUTION OPTIONS */
  /* ========================= */

  optionGrid: {
    flexDirection: "row",
    gap: 11,
  },

  bigOption: {
    flex: 1,
    minHeight: 175,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E8E5ED",
    position: "relative",
  },

  bigOptionActive: {
    borderColor: "#6C4AB6",
    backgroundColor: "#F6F2FF",
  },

  bigOptionActiveOrange: {
    borderColor: "#FF8A3D",
    backgroundColor: "#FFF7F0",
  },

  optionIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  optionIconPurple: {
    backgroundColor: "#E9E1FF",
  },

  optionIconOrange: {
    backgroundColor: "#FFE6D5",
  },

  optionEmoji: {
    fontSize: 22,
  },

  bigOptionTitle: {
    color: "#24213A",
    fontSize: 17,
    fontWeight: "900",
  },

  bigOptionDescription: {
    color: "#888492",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  selectionIndicator: {
    position: "absolute",
    top: 13,
    right: 13,
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D8D3DF",
    justifyContent: "center",
    alignItems: "center",
  },

  selectionIndicatorActive: {
    backgroundColor: "#6C4AB6",
    borderColor: "#6C4AB6",
  },

  selectionIndicatorOrange: {
    backgroundColor: "#FF8A3D",
    borderColor: "#FF8A3D",
  },

  checkMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* ========================= */
  /* TARGET */
  /* ========================= */

  targetCard: {
    backgroundColor: "#6C4AB6",
    borderRadius: 22,
    padding: 20,
  },

  targetLabel: {
    color: "#D8CEF2",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  targetInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  targetCurrency: {
    color: "#FFD447",
    fontSize: 30,
    fontWeight: "900",
    marginRight: 6,
  },

  targetInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "900",
    padding: 0,
  },

  targetHelper: {
    color: "#D8CEF2",
    fontSize: 11,
    marginTop: 7,
  },

  /* ========================= */
  /* VISIBILITY */
  /* ========================= */

  visibilityContainer: {
    gap: 10,
  },

  visibilityOption: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E6E2EA",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  visibilityActive: {
    backgroundColor: "#F6F2FF",
    borderColor: "#6C4AB6",
  },

  visibilityIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#F1EFF5",
    justifyContent: "center",
    alignItems: "center",
  },

  visibilityEmoji: {
    fontSize: 20,
  },

  visibilityText: {
    flex: 1,
    marginLeft: 12,
  },

  visibilityTitle: {
    color: "#24213A",
    fontSize: 14,
    fontWeight: "900",
  },

  visibilityDescription: {
    color: "#8B8794",
    fontSize: 11,
    marginTop: 3,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D5D1DA",
    justifyContent: "center",
    alignItems: "center",
  },

  radioActive: {
    borderColor: "#6C4AB6",
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#6C4AB6",
  },

  /* ========================= */
  /* PREVIEW */
  /* ========================= */

  previewSection: {
    marginBottom: 27,
  },

  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  previewLabel: {
    color: "#6C4AB6",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  previewTitle: {
    color: "#24213A",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },

  previewEmoji: {
    fontSize: 28,
    marginLeft: "auto",
  },

  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E6EE",
  },

  previewTop: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  previewIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#6C4AB6",
    justifyContent: "center",
    alignItems: "center",
  },

  previewIconText: {
    fontSize: 22,
  },

  previewInfo: {
    flex: 1,
    marginLeft: 11,
  },

  previewSmall: {
    color: "#96919F",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  previewName: {
    color: "#24213A",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  previewVisibility: {
    backgroundColor: "#F0EBFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  previewVisibilityText: {
    color: "#6C4AB6",
    fontSize: 8,
    fontWeight: "900",
  },

  previewAmount: {
    backgroundColor: "#6C4AB6",
    padding: 18,
  },

  previewAmountLabel: {
    color: "#D7CDED",
    fontSize: 9,
    fontWeight: "800",
  },

  previewAmountValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },

  previewTarget: {
    color: "#D7CDED",
    fontSize: 11,
    marginTop: 2,
  },

  previewBottom: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  previewBottomLabel: {
    color: "#A09BA8",
    fontSize: 8,
    fontWeight: "800",
  },

  previewHost: {
    color: "#24213A",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },

  /* ========================= */
  /* SUMMARY */
  /* ========================= */

  summaryCard: {
    backgroundColor: "#FFF9DF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F5E7A7",
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryEmoji: {
    fontSize: 28,
    marginRight: 11,
  },

  summaryTitle: {
    color: "#3E3824",
    fontSize: 16,
    fontWeight: "900",
  },

  summarySubtitle: {
    color: "#8D8054",
    fontSize: 10,
    marginTop: 2,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EBDFAF",
    marginVertical: 13,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },

  summaryLabel: {
    color: "#8A7D50",
    fontSize: 12,
  },

  summaryValue: {
    color: "#403920",
    fontSize: 12,
    fontWeight: "900",
    maxWidth: "60%",
    textAlign: "right",
  },

  /* ========================= */
  /* CREATE BUTTON */
  /* ========================= */

  createButton: {
    height: 62,
    backgroundColor: "#6C4AB6",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingRight: 18,
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  createButtonDisabled: {
    opacity: 0.6,
  },

  createButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFD447",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  createButtonIconText: {
    fontSize: 20,
  },

  createButtonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  createButtonArrow: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "400",
  },

  footerText: {
    textAlign: "center",
    color: "#9A96A2",
    fontSize: 10,
    marginTop: 11,
  },
});
