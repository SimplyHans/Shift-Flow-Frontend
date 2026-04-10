import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/app/config/axios";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

type Slot = { id: number; dayOfWeek: string; startTime: string; endTime: string };

function toDisplayTime(backend: string): string {
  const [h, m] = backend.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export default function EmployeeAvailabilityScreen() {
  const { employeeId, name } = useLocalSearchParams<{ employeeId: string; name: string }>();
  const router = useRouter();
  const [slots, setSlots] = useState<(Slot | null)[]>(DAYS.map(() => null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data } = await api.get<Slot[]>(`/availability/employee/${employeeId}`);
        const updated: (Slot | null)[] = DAYS.map(() => null);
        data.forEach((slot) => {
          const idx = DAYS.indexOf(slot.dayOfWeek);
          if (idx !== -1) updated[idx] = slot;
        });
        setSlots(updated);
      } catch {
        setError("Failed to load availability.");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchAvailability();
  }, [employeeId]);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6579FF" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#262626" />
        </Pressable>
        <Text style={styles.title}>{name ? `${name}'s Availability` : "Availability"}</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {DAYS.map((day, idx) => (
        <View key={day} style={styles.dayRow}>
          <Text style={styles.dayLabel}>{day}</Text>
          {slots[idx] ? (
            <View style={styles.timeBlock}>
              <MaterialIcons name="check" size={18} color="#4CAF50" />
              <Text style={styles.timeText}>
                {toDisplayTime(slots[idx]!.startTime)} - {toDisplayTime(slots[idx]!.endTime)}
              </Text>
            </View>
          ) : (
            <Text style={styles.noTime}>Not available</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: "#FAFAFA" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { marginRight: 12, padding: 4 },
  title: { fontSize: 24, fontWeight: "700", flex: 1 },
  errorBox: { backgroundColor: "#ffebee", borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: "#c62828", fontSize: 14, textAlign: "center" },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
  },
  dayLabel: { flex: 1, fontSize: 18, fontWeight: "500" },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8F7C5",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeText: { color: "#4CAF50", fontWeight: "600", marginLeft: 6 },
  noTime: { color: "#AAA", fontStyle: "italic" },
});
