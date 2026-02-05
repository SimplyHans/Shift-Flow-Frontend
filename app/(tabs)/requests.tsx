import { StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ScheduleRow from "@/components/scheduleRow"; // ✅ adjust path if needed

export default function RequestsScreen() {
  // 🔁 TEMP toggle (later replace with DB logic)
  const hasRequests = true; // 👈 change to false to see empty state

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Requests</Text>

      {/* ✅ EMPTY STATE */}
      {!hasRequests && (
        <View style={styles.emptyWrap}>
          <View style={styles.subtitleRow}>
            <MaterialIcons name="swap-horiz" size={28} color="black" />
            <Text style={styles.subtitle}>
              Shift requests will appear here.
            </Text>
          </View>
        </View>
      )}

      {/* ✅ REQUESTS EXIST */}
      {hasRequests && (
        <View>
          <ScheduleRow
            rowIndex={0}
      values={[
        "Current Shift", // 👈 shows in first cell
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]}
          />

        </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderColor: "#EEEEEE",
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },

  /* Empty state */
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
