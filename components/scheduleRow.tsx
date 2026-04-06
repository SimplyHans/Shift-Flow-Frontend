import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ShiftBlock from "./shiftBlock";

export type Shift = {
  time: string;
  role: string;
};

type ScheduleRowProps = {
  name: string;
  shiftsByDay: (Shift | string | null)[];
  isHeader?: boolean;
  onCellPress?: (dayIndex: number, shift: Shift | null) => void;

  canEdit?: boolean; 
};

export default function ScheduleRow({
  name,
  shiftsByDay,
  isHeader = false,
  onCellPress,
  canEdit = true, 
}: ScheduleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <Text style={[styles.cellText, isHeader && styles.headerText]}>{name}</Text>
      </View>

      {shiftsByDay.map((item, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.cell,
            pressed && !isHeader && canEdit && { backgroundColor: "#F5F6FF" },
          ]}
          disabled={isHeader || !canEdit}
          onPress={() => {
            if (!canEdit || isHeader) return;
            onCellPress?.(i, (item as Shift) ?? null);
          }}
        >
          {isHeader ? (
            <Text style={styles.headerText}>{item}</Text>
          ) : item ? (
            <ShiftBlock time={(item as Shift).time} role={(item as Shift).role} />
          ) : canEdit ? (
            <Text style={styles.emptyText}>+</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "stretch" },
  cell: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cellText: { textAlign: "center", fontSize: 14, color: "#111" },
  headerText: { textAlign: "center", fontSize: 13, fontWeight: "700", color: "#111" },
  emptyText: { fontSize: 18, color: "#AAA", fontWeight: "600" },
});
