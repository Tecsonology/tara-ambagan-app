import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ContributionButtonProps = {
  onPress: () => void;
};

export default function ContributionButton({
  onPress,
}: ContributionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.plus}>+</Text>
      </View>

      <Text style={styles.text}>Mag-ambag</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",

    right: 20,
    bottom: 25,

    height: 58,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FF8A3D",

    borderRadius: 30,

    elevation: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    zIndex: 999,
  },

  iconCircle: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  plus: {
    fontSize: 24,
    fontWeight: "800",
    color: "#6C4AB6",

    lineHeight: 27,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
