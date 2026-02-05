import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type ScheduleRowProps = {
  values: (string | number)[];
  rowIndex: number;
  onPress?: () => void;
};

export default function ScheduleRow({ values, rowIndex, onPress }: ScheduleRowProps) {
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

const styles = StyleSheet.create({

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
    color: "#111",
    textAlign: "center",
  },

});
