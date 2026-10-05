import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type JoinContributionButtonProps = {
  onPress?: () => void;
};

export default function JoinContributionButton({
  onPress,
}: JoinContributionButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={onPress}
      >
        {/* Icon */}

        {/* Text */}
        <Text style={styles.buttonText}>SUMALI SA AMBAGAN</Text>

        {/* Arrow */}
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================
  // CONTAINER
  // =========================================

  container: {
    width: "100%",
  },

  // =========================================
  // BUTTON
  // =========================================

  button: {
    width: "100%",
    height: 64,
    marginBottom: 20,
    backgroundColor: "#109e00",

    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    // Kahoot-style depth
    borderBottomWidth: 6,
    borderBottomColor: "#134502",

    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,

    elevation: 6,
  },

  // =========================================
  // ICON
  // =========================================

  iconContainer: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  icon: {
    fontSize: 27,
  },

  // =========================================
  // TEXT
  // =========================================

  buttonText: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "900",

    letterSpacing: 0.5,

    textAlign: "center",
  },

  // =========================================
  // ARROW
  // =========================================

  arrow: {
    color: "#FFFFFF",

    fontSize: 38,
    fontWeight: "300",

    lineHeight: 40,

    marginLeft: 8,
  },
});
