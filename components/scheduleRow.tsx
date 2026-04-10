import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  activeMonday?: Date;
};

export default function ScheduleRow({
  name,
  shiftsByDay,
  isHeader = false,
  onCellPress,
  canEdit = true,
  activeMonday,
}: ScheduleRowProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getCellBackground = (dayIndex: number) => {
    if (isHeader || !activeMonday) return "#fff";
    const cellDate = new Date(activeMonday);
    cellDate.setDate(activeMonday.getDate() + dayIndex);
    cellDate.setHours(0, 0, 0, 0);
if (cellDate.getTime() === today.getTime()) return "#b0ffb3";    return "#fff";
  };

  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <Text style={[styles.cellText, isHeader && styles.headerText]}>{name}</Text>
      </View>
      {shiftsByDay.map((item, i) => {
        const hasShift = !isHeader && !!item;
        const isClickable = !isHeader && !!onCellPress && (canEdit || hasShift);
        const bg = getCellBackground(i);

        return (
          <Pressable
            key={i}
            style={({ pressed }) => [
              styles.cell,
              { backgroundColor: pressed && isClickable ? "#F5F6FF" : bg },
            ]}
            disabled={!isClickable}
            onPress={() => {
              if (!isClickable) return;
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
        );
      })}
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