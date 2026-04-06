import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type ShiftInfo = {
  label: string;
  name: string;
  date: string;
  time: string;
};

type ShiftRequestCardProps = {
  current: ShiftInfo;
  requested: ShiftInfo;
  onAccept?: () => void;
  onDecline?: () => void;
};

export default function ShiftRequestCard({
  current,
  requested,
  onAccept,
  onDecline,
}: ShiftRequestCardProps) {
  return (
    <View style={styles.card}>
      {/* Current shift */}
      <View style={styles.shiftBlock}>
        <View style={[styles.accent, { backgroundColor: "#FFB74D" }]} />
        <View>
          {/* label + name */}
          <View style={styles.titleRow}>
            <Text style={styles.label}>{current.label}</Text>
            <Text style={styles.nameInline}>{current.name}</Text>
          </View>

          {/* date + time */}
          <View style={styles.metaRow}>
            <MaterialIcons name="event" size={14} color="#555" />
            <Text style={styles.metaText}>{current.date}</Text>

            <MaterialIcons
              name="schedule"
              size={14}
              color="#555"
              style={{ marginLeft: 10 }}
            />
            <Text style={styles.metaText}>{current.time}</Text>
          </View>
        </View>
      </View>

      <MaterialIcons name="swap-horiz" size={26} color="#111" />

      {/* Requested shift */}
      <View style={styles.shiftBlock}>
        <View style={[styles.accent, { backgroundColor: "#7986CB" }]} />
        <View>
          {/* label + name */}
          <View style={styles.titleRow}>
            <Text style={styles.label}>{requested.label}</Text>
            <Text style={styles.nameInline}>{requested.name}</Text>
          </View>

          {/* date + time */}
          <View style={styles.metaRow}>
            <MaterialIcons name="event" size={14} color="#555" />
            <Text style={styles.metaText}>{requested.date}</Text>

            <MaterialIcons
              name="schedule"
              size={14}
              color="#555"
              style={{ marginLeft: 10 }}
            />
            <Text style={styles.metaText}>{requested.time}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.declineBtn, pressed && { opacity: 0.85 }]}
          onPress={onDecline}
        >
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}
          onPress={onAccept}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  shiftBlock: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },

  accent: {
    width: 4,
    borderRadius: 2,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  label: {
    fontSize: 12,
    color: "#777",
  },

  nameInline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    color: "#555",
  },

  actions: {
    gap: 8,
  },

  declineBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7C83FF",
  },

  declineText: {
    color: "#7C83FF",
    fontWeight: "500",
  },

  acceptBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#7C83FF",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
});
