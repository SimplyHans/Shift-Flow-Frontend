import React from "react";
import { View, Text, StyleSheet } from "react-native";

type ShiftBlockProps = {
  time: string;
  role: string;
};

export default function ShiftBlock({ time, role }: ShiftBlockProps) {
  return (
    <View style={styles.blueBlock}>
      <View style={styles.blueStripe} />

      <View style={styles.blueContent}>
        <Text style={styles.blueTime}>{time}</Text>
        <Text style={styles.blueRole}>{role}</Text>
      </View>
    </View>
  );
}
