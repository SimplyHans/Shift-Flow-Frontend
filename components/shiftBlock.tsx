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
const styles = StyleSheet.create({
  

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
}); 
