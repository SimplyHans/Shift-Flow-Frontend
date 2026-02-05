import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";


type ScheduleRowProps = {
  values: (string | number)[];
  rowIndex: number;
  onPress?: () => void;
};

function ScheduleRow({ values, rowIndex, onPress }: ScheduleRowProps) {
  const RowWrapper: any = onPress ? Pressable : View;

  const renderCell = (index: number) => {
    const showShift = rowIndex === 1 && index === 1;

    return (
      <View key={index} style={styles.cell}>
        {showShift ? (
          <View style={styles.blueBlock}>
            <View style={styles.blueStripe} />

            <View style={styles.blueContent}>
              <Text style={styles.blueTime}>9:00am – 5:00pm</Text>
              <Text style={styles.blueRole}>Position</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.cellText}>{values[index] ?? ""}</Text>
        )}
      </View>
    );
  };

  return (
    <RowWrapper style={styles.row} onPress={onPress}>
      {Array.from({ length: 8 }).map((_, index) => renderCell(index))}
    </RowWrapper>
  );
}


export default function ScheduleScreen() {
  return (
    <View style={styles.screen}>
      {/* Header row */}
      <ScheduleRow
        rowIndex={0}
        values={[
          " ",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ]}
      />

      <View style={styles.sectionHeader}>
        <Ionicons name="chevron-down" size={18} color="#111" />
        <ThemedText type="title" style={styles.sectionText}>
          Department
        </ThemedText>
      </View>

      {/* Data rows */}
      <ScheduleRow rowIndex={1} values={["name2", "", "", "", "", "", "", ""]} />
      <ScheduleRow rowIndex={2} values={["name2", "", "", "", "", "", "", ""]} />
      <ScheduleRow rowIndex={3} values={["name2", "", "", "", "", "", "", ""]} />
      <ScheduleRow rowIndex={4} values={["name2", "", "", "", "", "", "", ""]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#fff",

    flex: 1,
    padding: 24,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderColor: "#EEEEEE",
    backgroundColor: "white",
    borderRadius: 6,
  },

  cell: {
    flex: 1,
    height: 70,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },

  cellText: {
    fontSize: 14,
    textAlign: "center",
    color: "#111",
  },

  blueBlock: {
    width: "95%",
    height: "95%",
    backgroundColor: "rgba(66, 135, 245, 0.15)",
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
  },

  blueStripe: {
    position: "absolute",
    left: 3,
    top: 3,
    bottom: 3,
    width: 4,
    backgroundColor: "#1C54D4",
    borderRadius: 3,
  },

  blueContent: {
    justifyContent: "center",
    paddingLeft: 12,
    paddingRight: 6,
  },

  blueTime: {
    color: "#0D47A1",
    fontSize: 12,
    fontWeight: "600",
  },

  blueRole: {
    color: "#1565C0",
    fontSize: 11,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 8,
  },

  sectionText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "600",
  },
});
