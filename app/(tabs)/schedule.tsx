import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import ScheduleRow from "@/components/scheduleRow";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ScheduleScreen() {
  const rows = [
    {
      name: "name1",
      shiftsByDay: [
        { time: "9:00am – 5:00pm", role: "Position" },
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    },
    {
      name: "name2",
      shiftsByDay: [null, null, null, null, null, null, null],
    },
    {
      name: "name3",
      shiftsByDay: [null, null, null, null, null, null, null],
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Header row */}
      <ScheduleRow
        isHeader
        name=""
        shiftsByDay={DAYS}
      />

      {/* Department header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="chevron-down" size={18} color="#111" />
        <ThemedText type="title" style={styles.sectionText}>
          Department
        </ThemedText>
      </View>

      {/* Employee rows */}
      {rows.map((r) => (
        <ScheduleRow
          key={r.name}
          name={r.name}
          shiftsByDay={r.shiftsByDay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 24,
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
