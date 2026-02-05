import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import api from "@/app/config/axios";

type AssignedEmployee = {
  id: number;
  firstName: string;
  lastName: string;
};

type Shift = {
  id: number;
  startTime: string;
  endTime: string;
  position: string;
  location: string;
  assignedEmployee: AssignedEmployee;
  createdBy: { id: number; firstName: string; lastName: string };
  createdAt: string;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const HOURS = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM",
];
const HOUR_HEIGHT = 60;
const START_HOUR = 8;

function parseShiftTimes(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dayOfWeek = start.getDay(); // 0 = Sun, 1 = Mon, ...
  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = end.getHours() + end.getMinutes() / 60;
  return { dayOfWeek, startHour, endHour };
}

function formatTimeRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const toStr = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return m > 0 ? `${hour}:${m.toString().padStart(2, "0")}${ampm}` : `${hour}${ampm}`;
  };
  return `${toStr(start)} – ${toStr(end)}`;
}

export default function MyScheduleScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShifts = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<Shift[]>("/shifts/me");
      setShifts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? "Failed to load shifts.");
      setShifts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShifts();
  }, [fetchShifts]);

  // Group shifts by day (Sun=0 .. Sat=6) and render within each day column
  const shiftsByDay: Record<number, Shift[]> = {};
  DAY_NAMES.forEach((_, i) => (shiftsByDay[i] = []));
  shifts.forEach((s) => {
    const { dayOfWeek } = parseShiftTimes(s.startTime, s.endTime);
    if (dayOfWeek in shiftsByDay) {
      shiftsByDay[dayOfWeek].push(s);
    }
  });

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color="#6579FF" />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryHint} onPress={fetchShifts}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Schedule</Text>
      <Text style={styles.subtitle}>This Week</Text>

      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.timeHeader} />
            {DAY_NAMES.map((day) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.body}>
              <View style={styles.timeColumn}>
                {HOURS.map((hour, index) => (
                  <View
                    key={index}
                    style={[styles.timeSlot, { height: HOUR_HEIGHT }]}
                  >
                    <Text style={styles.timeText}>{hour}</Text>
                  </View>
                ))}
              </View>

              {DAY_NAMES.map((_, dayIndex) => (
                <View key={dayIndex} style={styles.dayColumn}>
                  {HOURS.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.hourCell, { height: HOUR_HEIGHT }]}
                    />
                  ))}

                  {(shiftsByDay[dayIndex] ?? []).map((shift) => {
                    const { startHour, endHour } = parseShiftTimes(
                      shift.startTime,
                      shift.endTime
                    );
                    const top = (startHour - START_HOUR) * HOUR_HEIGHT;
                    const height = Math.max(
                      (endHour - startHour) * HOUR_HEIGHT,
                      40
                    );

                    return (
                      <View
                        key={shift.id}
                        style={[
                          styles.shiftCard,
                          {
                            top,
                            height,
                          },
                        ]}
                      >
                        <Text style={styles.shiftTitle}>
                          {shift.position}
                        </Text>
                        <Text style={styles.shiftTime}>
                          {formatTimeRange(shift.startTime, shift.endTime)}
                        </Text>
                        {shift.location ? (
                          <Text style={styles.shiftLocation} numberOfLines={1}>
                            {shift.location}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "#c62828",
    textAlign: "center",
  },
  retryHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#6579FF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timeHeader: {
    width: 60,
  },
  dayHeader: {
    width: 170,
    alignItems: "center",
    marginRight: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "700",
  },
  body: {
    flexDirection: "row",
  },
  timeColumn: {
    width: 60,
  },
  timeSlot: {
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
  },
  dayColumn: {
    width: 170,
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginRight: 8,
  },
  hourCell: {
    borderBottomWidth: 1,
    borderBottomColor: "#edeff1",
  },
  shiftCard: {
    position: "absolute",
    left: 8,
    right: 8,
    backgroundColor: "#6579FF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  shiftTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
  },
  shiftTime: {
    fontSize: 12,
    color: "#d5dae1",
  },
  shiftLocation: {
    fontSize: 11,
    color: "#b8c4d4",
    marginTop: 4,
  },
});
