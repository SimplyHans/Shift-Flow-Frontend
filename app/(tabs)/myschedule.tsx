import api from "@/app/config/axios";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  return d;
}

function getSundayOf(monday: Date): Date {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

function weekLabel(monday: Date): string {
  const sunday = getSundayOf(monday);
  const fmt = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function buildDayHeaders(monday: Date): { day: string; date: string }[] {
  return DAY_NAMES.map((day, i) => {
    const d = new Date(monday);
    // DAY_NAMES starts Sun=0, but monday is Mon, so offset by -1 (Sun = day 6 of the week starting Mon)
    // Actually map: Mon=0, Tue=1, ... Sun=6
    const offsets = [1, 2, 3, 4, 5, 6, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat -> offset from monday
    d.setDate(monday.getDate() + offsets[i]);
    return {
      day,
      date: `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`,
    };
  });
}

function parseShiftTimes(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dayOfWeek = start.getDay();
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

export default function MyScheduleScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeekMonday, setSelectedWeekMonday] = useState<Date | null>(null);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [myOpenShiftIds, setMyOpenShiftIds] = useState<Set<number>>(new Set());

  const currentMonday = useMemo(() => getMondayOf(new Date()), []);

  const weekOptions = useMemo(() => {
    const past = Array.from({ length: 8 }, (_, i) => {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() - (i + 1) * 7);
      return { label: weekLabel(monday), monday, isFuture: false };
    });
    const future = Array.from({ length: 1 }, (_, i) => {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() + (i + 1) * 7);
      return { label: weekLabel(monday), monday, isFuture: true };
    });
    return [...future, ...past];
  }, [currentMonday]);

  const activeMonday = selectedWeekMonday ?? currentMonday;
  const activeSunday = getSundayOf(activeMonday);
  activeSunday.setHours(23, 59, 59, 999);

  const activeWeekLabel = selectedWeekMonday
    ? weekLabel(selectedWeekMonday)
    : `${weekLabel(currentMonday)} (Current)`;

  const dayHeaders = useMemo(() => buildDayHeaders(activeMonday), [activeMonday]);

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

  const fetchMyOpenShifts = useCallback(() => {
    api.get("/open-shifts/me")
      .then((res) => {
        const activeIds = new Set<number>(
          res.data
            .filter((o: any) => o.status === "OPEN")
            .map((o: any) => o.shiftId)
        );
        setMyOpenShiftIds(activeIds);
      })
      .catch(() => setMyOpenShiftIds(new Set()));
  }, []);

  useEffect(() => {
    fetchShifts();
    fetchMyOpenShifts();
  }, [fetchShifts, fetchMyOpenShifts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShifts();
    fetchMyOpenShifts();
  }, [fetchShifts, fetchMyOpenShifts]);

  const handlePostOpen = () => {
    if (!selectedShift) return;
    setPosting(true);
    setPostError(null);
    api.post("/open-shifts", { shiftId: selectedShift.id })
      .then(() => {
        setPostSuccess(true);
        fetchMyOpenShifts();
        setTimeout(() => {
          setSelectedShift(null);
          setPostSuccess(false);
        }, 1500);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? "Failed to post shift. Please try again.";
        setPostError(msg);
      })
      .finally(() => setPosting(false));
  };

  const weekShifts = useMemo(() => {
    const start = activeMonday.getTime();
    const end = activeSunday.getTime();
    return shifts.filter((s) => {
      const t = new Date(s.startTime).getTime();
      return t >= start && t <= end;
    });
  }, [shifts, activeMonday, activeSunday]);

  const shiftsByDay: Record<number, Shift[]> = {};
  DAY_NAMES.forEach((_, i) => (shiftsByDay[i] = []));
  weekShifts.forEach((s) => {
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
        <Text style={styles.retryHint} onPress={fetchShifts}>Tap to retry</Text>
      </View>
    );
  }

  const isAlreadyPosted = !!(selectedShift && myOpenShiftIds.has(selectedShift.id));

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Schedule</Text>

      {/* ===== Week Dropdown ===== */}
      <View style={styles.weekDropdownWrapper}>
        <Pressable
          style={styles.weekDropdownTrigger}
          onPress={() => setWeekDropdownOpen((prev) => !prev)}
        >
          <Text style={styles.weekDropdownTriggerText} numberOfLines={1}>
            {activeWeekLabel}
          </Text>
          <Ionicons name={weekDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#111" />
        </Pressable>

        {weekDropdownOpen && (
          <View style={styles.weekDropdownMenu}>
            <Pressable
              style={[styles.weekDropdownItem, selectedWeekMonday === null && styles.weekDropdownItemActive]}
              onPress={() => { setSelectedWeekMonday(null); setWeekDropdownOpen(false); }}
            >
              <Text style={styles.weekDropdownItemText}>{weekLabel(currentMonday)} (Current)</Text>
            </Pressable>
            {weekOptions.map((opt) => (
              <Pressable
                key={opt.label}
                style={[
                  styles.weekDropdownItem,
                  selectedWeekMonday?.getTime() === opt.monday.getTime() && styles.weekDropdownItemActive,
                ]}
                onPress={() => { setSelectedWeekMonday(opt.monday); setWeekDropdownOpen(false); }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.weekDropdownItemText}>{opt.label}</Text>
                  {opt.isFuture && (
                    <Text style={styles.weekDropdownFutureTag}>Upcoming</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView horizontal>
        <View>
          {/* Day headers with dates */}
          <View style={styles.headerRow}>
            <View style={styles.timeHeader} />
            {dayHeaders.map((h, i) => (
              <View key={i} style={styles.dayHeader}>
                <Text style={styles.dayText}>{h.day}</Text>
                <Text style={styles.dayDate}>{h.date}</Text>
              </View>
            ))}
          </View>

          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={styles.body}>
              <View style={styles.timeColumn}>
                {HOURS.map((hour, index) => (
                  <View key={index} style={[styles.timeSlot, { height: HOUR_HEIGHT }]}>
                    <Text style={styles.timeText}>{hour}</Text>
                  </View>
                ))}
              </View>

              {DAY_NAMES.map((_, dayIndex) => (
                <View key={dayIndex} style={styles.dayColumn}>
                  {HOURS.map((_, index) => (
                    <View key={index} style={[styles.hourCell, { height: HOUR_HEIGHT }]} />
                  ))}

                  {(shiftsByDay[dayIndex] ?? []).map((shift) => {
                    const { startHour, endHour } = parseShiftTimes(shift.startTime, shift.endTime);
                    const top = (startHour - START_HOUR) * HOUR_HEIGHT;
                    const height = Math.max((endHour - startHour) * HOUR_HEIGHT, 40);
                    const isPast = new Date(shift.startTime) < new Date();

                    return (
                      <Pressable
                        key={shift.id}
                        style={[
                          styles.shiftCard,
                          { top, height },
                          isPast && { opacity: 0.5 },
                        ]}
                        onPress={() => !isPast && setSelectedShift(shift)}
                      >
                        <Text style={styles.shiftTitle}>{shift.position}</Text>
                        <Text style={styles.shiftTime}>
                          {formatTimeRange(shift.startTime, shift.endTime)}
                        </Text>
                        {shift.location ? (
                          <Text style={styles.shiftLocation} numberOfLines={1}>
                            {shift.location}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* ===== Post Open Shift Modal ===== */}
      <Modal visible={!!selectedShift} transparent animationType="none" onRequestClose={() => { setSelectedShift(null); setPostError(null); }}>
        <Pressable style={styles.backdrop} onPress={() => { setSelectedShift(null); setPostError(null); }}>
          <View style={styles.popup} onStartShouldSetResponder={() => true}>
            {postSuccess ? (
              <View style={styles.successWrap}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.successText}>Posted as Open!</Text>
              </View>
            ) : (
              <>
                <Text style={styles.popupTitle}>Post as Open Shift?</Text>
                <Text style={styles.popupSubtitle}>
                  This will make your shift available for other employees to claim.
                </Text>

                {selectedShift && (
                  <View style={styles.shiftPreview}>
                    <Text style={styles.previewTitle}>{selectedShift.position ?? "Shift"}</Text>
                    <Text style={styles.previewSub}>{formatDate(selectedShift.startTime)}</Text>
                    <Text style={styles.previewSub}>
                      {formatTimeRange(selectedShift.startTime, selectedShift.endTime)}
                    </Text>
                    {selectedShift.location ? (
                      <Text style={styles.previewSub}>{selectedShift.location}</Text>
                    ) : null}
                  </View>
                )}

                {isAlreadyPosted && (
                  <Text style={styles.alreadyPostedText}>
                    This shift is already posted as open.
                  </Text>
                )}

                {postError && (
                  <Text style={styles.postErrorText}>{postError}</Text>
                )}

                <View style={styles.popupActions}>
                  <Pressable
                    style={styles.cancelPopupBtn}
                    onPress={() => setSelectedShift(null)}
                  >
                    <Text style={styles.cancelPopupText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.postConfirmBtn, (posting || isAlreadyPosted) && { opacity: 0.4 }]}
                    disabled={posting || isAlreadyPosted}
                    onPress={handlePostOpen}
                  >
                    <Text style={styles.postConfirmText}>Post</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F6F8", padding: 16 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },
  errorText: { fontSize: 16, color: "#c62828", textAlign: "center" },
  retryHint: { marginTop: 8, fontSize: 14, color: "#6579FF" },
  title: { fontSize: 28, fontWeight: "700" },

  weekDropdownWrapper: {
    marginBottom: 16,
    marginTop: 4,
    zIndex: 100,
    alignSelf: "flex-start",
    width: 200,
    position: "relative",
  },
  weekDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  weekDropdownTriggerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    marginRight: 6,
  },
  weekDropdownMenu: {
    position: "absolute",
    top: 44,
    left: 0,
    width: 200,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#fff",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  weekDropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  weekDropdownItemActive: { backgroundColor: "#F5F6FF" },
  weekDropdownItemText: { fontSize: 13, color: "#111" },
  weekDropdownFutureTag: {
    fontSize: 11,
    color: "#6366F1",
    fontWeight: "600",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  headerRow: { flexDirection: "row", marginBottom: 8 },
  timeHeader: { width: 60 },
  dayHeader: { width: 170, alignItems: "center", marginRight: 8 },
  dayText: { fontSize: 14, fontWeight: "700" },
  dayDate: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  body: { flexDirection: "row" },
  timeColumn: { width: 60 },
  timeSlot: { justifyContent: "flex-start", paddingTop: 4 },
  timeText: { fontSize: 12, color: "#6B7280" },
  dayColumn: {
    width: 170,
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginRight: 8,
  },
  hourCell: { borderBottomWidth: 1, borderBottomColor: "#edeff1" },
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
  shiftTitle: { fontSize: 13, fontWeight: "700", color: "white" },
  shiftTime: { fontSize: 12, color: "#d5dae1" },
  shiftLocation: { fontSize: 11, color: "#b8c4d4", marginTop: 4 },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popup: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  popupTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  popupSubtitle: { fontSize: 13, color: "#777" },
  shiftPreview: {
    backgroundColor: "#F5F6FF",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  previewTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  previewSub: { fontSize: 13, color: "#555" },
  alreadyPostedText: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "600",
  },
  popupActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelPopupBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelPopupText: { color: "#EF4444", fontWeight: "700" },
  postConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  postConfirmText: { color: "#fff", fontWeight: "700" },
  successWrap: { alignItems: "center", paddingVertical: 20, gap: 12 },
  successText: { fontSize: 18, fontWeight: "700", color: "#10B981" },
  postErrorText: { fontSize: 13, fontWeight: "600", color: "#EF4444" },
});