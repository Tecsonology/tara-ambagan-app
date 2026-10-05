import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ambagan, getCurrentAmbagan } from "./api/getCurrentAmbagan";

export default function SearchAmbagan() {
  const [search, setSearch] = useState("");
  const [ambagan, setAmbagan] = useState<Ambagan | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================================
  // SEARCH AMBAGAN BY ID
  // =========================================

  const handleSearch = async () => {
    const id = search.trim();

    if (!id) {
      Alert.alert("Enter Ambagan ID", "Please enter an Ambagan ID to search.");
      return;
    }

    try {
      setLoading(true);
      setAmbagan(null);

      const response = await getCurrentAmbagan(id);

      if (!response) {
        Alert.alert("Not Found", "No Ambagan was found with that ID.");
        return;
      }

      setAmbagan(response);
    } catch (error) {
      console.error("Search Ambagan error:", error);

      Alert.alert(
        "Ambagan Not Found",
        error instanceof Error ? error.message : "Unable to find the Ambagan.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // CLEAR SEARCH
  // =========================================

  const clearSearch = () => {
    setSearch("");
    setAmbagan(null);
  };

  // =========================================
  // OPEN AMBAGAN
  // =========================================

  const openAmbagan = (id: string) => {
    router.push({
      pathname: "/Ambag",
      params: {
        id,
      },
    });
  };

  // =========================================
  // AMBAGAN CARD
  // =========================================

  const renderAmbagan = (item: Ambagan) => {
    const current = item.currentAmount ?? 0;
    const target = item.targetAmount ?? 0;

    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => openAmbagan(item._id)}
      >
        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          {/* ICON */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🤝</Text>
          </View>

          {/* NAME + ID */}
          <View style={styles.cardHeaderText}>
            <Text style={styles.ambaganName} numberOfLines={1}>
              {item.ambaganName}
            </Text>

            <Text style={styles.idText} numberOfLines={1}>
              ID: {item._id}
            </Text>
          </View>

          {/* VISIBILITY */}
          <View style={styles.visibilityBadge}>
            <Text style={styles.visibilityIcon}>
              {item.visibility === "Private" ? "🔒" : "🌐"}
            </Text>

            <Text style={styles.visibilityText}>
              {item.visibility?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* TYPE + MEMBERS */}
        <View style={styles.typeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {item.contributionType?.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.membersText}>
            👥 {item.membersCount ?? 0} Members
          </Text>
        </View>

        {/* AMOUNTS */}
        <View style={styles.amountContainer}>
          <View style={styles.amountRow}>
            {/* CURRENT */}
            <View>
              <Text style={styles.amountLabel}>RAISED</Text>
              <Text style={styles.currentAmount}>
                ₱{current.toLocaleString()}
              </Text>
            </View>

            {/* TARGET */}
            <View style={styles.targetContainer}>
              <Text style={styles.amountLabel}>TARGET</Text>
              <Text style={styles.targetAmount}>
                {target > 0 ? `₱${target.toLocaleString()}` : "Open"}
              </Text>
            </View>
          </View>
        </View>

        {/* PROGRESS */}
        {target > 0 ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {Math.round(progress)}% FUNDED
            </Text>
          </View>
        ) : (
          <View style={styles.openContribution}>
            <Text style={styles.openContributionText}>
              OPEN CONTRIBUTION POOL
            </Text>
          </View>
        )}

        {/* VIEW BUTTON */}
        <TouchableOpacity
          style={styles.viewButton}
          activeOpacity={0.85}
          onPress={() => openAmbagan(item._id)}
        >
          <Text style={styles.viewButtonText}>JOIN & VIEW</Text>
          <Text style={styles.viewArrow}>→</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // =========================================
  // PAGE
  // =========================================

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.titleBadge}>
          <Text style={styles.smallTitle}>DISCOVER</Text>
        </View>

        <Text style={styles.title}>Enter Ambagan ID</Text>

        <Text style={styles.subtitle}>
          Search for a pool or event to join the team!
        </Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        {/* INPUT */}
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Paste Ambagan ID here..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        {/* CLEAR BUTTON */}
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* SEARCH BUTTON */}
        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButton}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.searchButtonText}>FIND</Text>
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#46178F" />
          <Text style={styles.loadingText}>Finding your pool...</Text>
        </View>
      )}

      {/* RESULT */}
      {!loading && ambagan && (
        <View style={styles.resultsContainer}>
          {/* RESULT HEADER */}
          <View style={styles.resultHeader}>
            <View style={styles.resultTitleBadge}>
              <Text style={styles.resultTitle}>AMBAGAN FOUND</Text>
            </View>

            <View style={styles.resultCountContainer}>
              <Text style={styles.resultCount}>1</Text>
            </View>
          </View>

          {/* CARD */}
          {renderAmbagan(ambagan)}
        </View>
      )}

      {/* EMPTY STATE */}
      {!loading && !ambagan && (
        <View style={styles.emptyList}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🔎</Text>
          </View>

          <Text style={styles.emptyTitle}>Find an Ambagan</Text>

          <Text style={styles.emptyText}>
            Enter an Ambagan ID above to find an event and contribute with your
            squad.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================
  // CONTAINER
  // =========================================

  container: {
    flex: 1,
    backgroundColor: "#F2F4F8",
    paddingHorizontal: 16,
  },

  // =========================================
  // HEADER
  // =========================================

  header: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "flex-start",
  },

  titleBadge: {
    backgroundColor: "#1368CE", // Kahoot Blue
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  smallTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#FFFFFF",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 4,
  },

  // =========================================
  // SEARCH BAR
  // =========================================

  searchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderBottomWidth: 5,
    borderBottomColor: "#D1D5DB",
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  clearText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
  },

  searchButton: {
    backgroundColor: "#26890C", // Kahoot Green
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#1B5E08",
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // =========================================
  // RESULTS
  // =========================================

  resultsContainer: {
    flex: 1,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  resultTitleBadge: {
    backgroundColor: "#46178F", // Kahoot Purple
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  resultTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },

  resultCountContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },

  resultCount: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  // =========================================
  // CARD
  // =========================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#1368CE",
    borderBottomWidth: 6,
    borderBottomColor: "#0E4B95",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E8F2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#1368CE",
  },

  icon: {
    fontSize: 22,
  },

  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  ambaganName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  idText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 2,
  },

  // =========================================
  // VISIBILITY
  // =========================================

  visibilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  visibilityIcon: {
    fontSize: 10,
    marginRight: 4,
  },

  visibilityText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#374151",
  },

  // =========================================
  // DIVIDER
  // =========================================

  divider: {
    height: 2,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  // =========================================
  // TYPE
  // =========================================

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  typeBadge: {
    backgroundColor: "#FFEBEF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  typeText: {
    color: "#E21B3C", // Kahoot Red
    fontSize: 11,
    fontWeight: "900",
  },

  membersText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "800",
  },

  // =========================================
  // AMOUNTS
  // =========================================

  amountContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  targetContainer: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    letterSpacing: 0.5,
  },

  currentAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1368CE",
    marginTop: 2,
  },

  targetAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 2,
  },

  // =========================================
  // PROGRESS
  // =========================================

  progressContainer: {
    marginBottom: 14,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#D89E00", // Kahoot Yellow/Gold
    borderRadius: 5,
  },

  progressText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textAlign: "right",
    marginTop: 4,
  },

  // =========================================
  // OPEN CONTRIBUTION
  // =========================================

  openContribution: {
    marginBottom: 14,
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },

  openContributionText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#B45309",
  },

  // =========================================
  // VIEW BUTTON
  // =========================================

  viewButton: {
    height: 48,
    backgroundColor: "#1368CE",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    borderBottomColor: "#0E4B95",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  viewArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 8,
  },

  // =========================================
  // LOADING
  // =========================================

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },

  loadingText: {
    marginTop: 12,
    color: "#46178F",
    fontSize: 14,
    fontWeight: "900",
  },

  // =========================================
  // EMPTY
  // =========================================

  emptyList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginTop: 10,
  },

  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyIcon: {
    fontSize: 28,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
});
