import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ShiftBlock from "./shiftBlock";

type Shift = {
  time: string;
  role: string;
};

type ScheduleRowProps = {
  name: string;
  shiftsByDay: (Shift | string | null)[];
  isHeader?: boolean;
  onPress?: () => void;
};

export default function ScheduleRow({
  name,
  shiftsByDay,
  isHeader = false,
  onPress,
}: ScheduleRowProps) {
  const RowWrapper: any = !isHeader && onPress ? Pressable : View;

  return (
    <RowWrapper style={styles.row} onPress={onPress}>
      {/* Name column */}
      <View style={styles.cell}>
        <Text style={[styles.cellText, isHeader && styles.headerText]}>
          {name}
        </Text>
      </View>

      {/* Day columns */}
      {shiftsByDay.map((item, i) => (
        <View key={i} style={styles.cell}>
          {isHeader ? (
            <Text style={styles.headerText}>{item}</Text>
          ) : item ? (
            <ShiftBlock time={item.time} role={item.role} />
          ) : null}
        </View>
      ))}
    </RowWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  cell: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 6,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  cellText: {
    textAlign: "center",
    fontSize: 14,
    color: "#111",
  },
  headerText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
});
