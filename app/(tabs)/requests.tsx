import { StyleSheet, Text, View } from "react-native";
import ShiftRequestCard from "@/components/shiftRequestCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RequestsScreen() {
  const hasRequests = true;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Requests</Text>

      {!hasRequests && (
        <View style={styles.emptyWrap}>
          <View style={styles.subtitleRow}>
            <MaterialIcons name="swap-horiz" size={28} color="black" />
            <Text style={styles.subtitle}>Shift requests will appear here.</Text>
          </View>
        </View>
      )}

      {hasRequests && (
        <ShiftRequestCard
          current={{
            label: "Current Shift",
            name: "YOU",
            date: "2025-11-17",
            time: "3 p.m. - 11 p.m.",
          }}
          requested={{
            label: "Requested Shift",
            name: "Hans Casilao",
            date: "2025-11-17",
            time: "3 p.m. - 11 p.m.",
          }}
          onDecline={() => console.log("Decline")}
          onAccept={() => console.log("Accept")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FAFAFA",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  subtitle: {
    fontSize: 18,
    opacity: 0.75,
  },
});
