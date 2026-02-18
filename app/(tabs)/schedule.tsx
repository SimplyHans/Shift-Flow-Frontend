import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Modal, Pressable, Text, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import ScheduleRow, { Shift } from "@/components/scheduleRow";
import api from "@/app/config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HOURS = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM",
];

// ===== Backend DTO shape =====
type AssignedEmployee = {
  id: number;
  firstName: string;
  lastName: string;
};

type ShiftApi = {
  id: number;
  startTime: string; 
  endTime: string;
  position: string;
  location: string;
  assignedEmployee: AssignedEmployee;
  createdBy?: { id: number; firstName: string; lastName: string };
  createdAt?: string;
};

// ===== /auth/me DTO =====
type MeResponse = {
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE" | string;
};

// ===== Helpers =====
function toHourLabel(shiftTime: string) {
  const raw = shiftTime.split("–")[0]?.trim() ?? "";
  const m = raw.match(/^(\d{1,2})(?::\d{2})?\s*(am|pm)$/i);
  if (!m) return null;
  const hour = m[1];
  const ampm = m[2].toUpperCase();
  return `${hour} ${ampm}`;
}

function dayIndexMon0FromISO(iso: string) {
  // JS: 0=Sun..6=Sat -> convert to Monday=0..Sunday=6
  const js = new Date(iso).getDay();
  return (js + 6) % 7;
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

function hourLabelTo24Hour(label: string) {
  // label like "8 AM", "12 PM"
  const [hStr, ampm] = label.split(" ");
  let h = parseInt(hStr, 10);
  const upper = (ampm ?? "").toUpperCase();

  if (upper === "AM") {
    if (h === 12) h = 0;
  } else if (upper === "PM") {
    if (h !== 12) h += 12;
  }
  return h;
}

function getMondayOfCurrentWeek() {
  // returns local Date at 00:00 of Monday this week
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMonday = (day + 6) % 7; // Mon=0
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diffToMonday);
  return monday;
}

function buildISOForSelected(dayIndexMon0: number, hourLabel: string) {
  // Build a local datetime for this week's selected day + hour, then to ISO string
  const monday = getMondayOfCurrentWeek();
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndexMon0);

  const h24 = hourLabelTo24Hour(hourLabel);
  d.setHours(h24, 0, 0, 0);

  // Backend expects "2026-02-04T09:00:00" style (no Z)
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoNoZ = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return isoNoZ;
}

async function getToken() {
  // Use ONE source of truth for token
  const token = await AsyncStorage.getItem("token");
  if (token) return token;

  // fallback if some parts of your app saved it differently
  const userRaw = await AsyncStorage.getItem("user");
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u?.token) return u.token as string;
    } catch {}
  }

  return null;
}

export default function ScheduleScreen() {
  // ===== Auth role (controls edit permissions) =====
  const [role, setRole] = useState<string | null>(null);
  const canManage = role === "ADMIN" || role === "MANAGER";

  // ===== Fetch shifts from backend =====
  const [allShifts, setAllShifts] = useState<ShiftApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // for add/remove
  const [error, setError] = useState<string | null>(null);

  // Fetch role once
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const { data } = await api.get<MeResponse>("/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setRole(data?.role ?? null);
      } catch {
        setRole(null);
      }
    })();
  }, []);

  const fetchAllShifts = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const token = await getToken();

      const { data } = await api.get<ShiftApi[]>("/shifts/all", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      setAllShifts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;

      console.log("GET /shifts/all failed:", status, err?.response?.data);

      setError(
        backendMsg ??
          (status ? `Failed to load shifts (HTTP ${status}).` : "Failed to load shifts.")
      );
      setAllShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllShifts();
  }, [fetchAllShifts]);

  // ===== Convert backend shifts -> rows expected by ScheduleRow =====
  // We also store a mapping so we can find the real backend shiftId when user taps a cell.
  const { rows, idByCell } = useMemo(() => {
    const map = new Map<string, (Shift | null)[]>();
    const idMap = new Map<string, (number | null)[]>();

    for (const s of allShifts) {
      const name =
        `${s.assignedEmployee?.firstName ?? ""} ${s.assignedEmployee?.lastName ?? ""}`.trim() ||
        "Unknown";

      const dayIndex = dayIndexMon0FromISO(s.startTime);

      if (!map.has(name)) map.set(name, Array(7).fill(null));
      if (!idMap.has(name)) idMap.set(name, Array(7).fill(null));

      map.get(name)![dayIndex] = {
        time: formatTimeRange(s.startTime, s.endTime),
        role: s.position ?? "Shift",
      };

      idMap.get(name)![dayIndex] = s.id;
    }

    return {
      rows: Array.from(map.entries()).map(([name, shiftsByDay]) => ({ name, shiftsByDay })),
      idByCell: idMap,
    };
  }, [allShifts]);

  // ===== Modal state =====
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<{
    employee: string;
    dayIndex: number;
    shift: Shift | null;
    shiftId: number | null;
    employeeId: number | null; // for POST
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState(HOURS[0]);
  const [endTime, setEndTime] = useState(HOURS[1]);

  const openPopup = (employee: string, dayIndex: number, shift: Shift | null) => {
    if (!canManage) return;

    const shiftId = idByCell.get(employee)?.[dayIndex] ?? null;

    // find employeeId from any shift in that row (best effort)
    // If employee has no shifts at all, we can't infer employeeId from /shifts/all.
    // In that case you’ll need a separate endpoint to list employees.
    let employeeId: number | null = null;
    const match = allShifts.find((s) => {
      const name = `${s.assignedEmployee?.firstName ?? ""} ${s.assignedEmployee?.lastName ?? ""}`.trim();
      return name === employee;
    });
    employeeId = match?.assignedEmployee?.id ?? null;

    setSelected({ employee, dayIndex, shift, shiftId, employeeId });

    const guess = shift?.time ? toHourLabel(shift.time) : null;
    const start = guess && HOURS.includes(guess) ? guess : HOURS[0];
    setStartTime(start);

    const idx = HOURS.indexOf(start);
    setEndTime(HOURS[Math.min(idx + 1, HOURS.length - 1)]);

    setOpenDropdown(null);
    setModalVisible(true);
  };

  const closePopup = () => {
    setModalVisible(false);
    setSelected(null);
    setOpenDropdown(null);
  };

  // ===== API actions =====
  const handleRemoveShift = useCallback(async () => {
    if (!canManage) return;
    if (!selected?.shiftId) return;

    try {
      setBusy(true);
      setError(null);

      const token = await getToken();
      await api.delete(`/shifts/${selected.shiftId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      closePopup();
      await fetchAllShifts();
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;

      console.log("DELETE /shifts/{id} failed:", status, err?.response?.data);

      Alert.alert("Error", backendMsg ?? (status ? `Failed to remove shift (HTTP ${status}).` : "Failed to remove shift."));
    } finally {
      setBusy(false);
    }
  }, [canManage, selected, fetchAllShifts]);

  const handleAddShift = useCallback(async () => {
    if (!canManage) return;
    if (!selected) return;

    if (!selected.employeeId) {
      Alert.alert(
        "Can't add shift",
        "I don't know this employee's ID yet. To add shifts for employees with no shifts, you need an endpoint to list employees (or include employeeId in your rows)."
      );
      return;
    }

    try {
      setBusy(true);
      setError(null);

      const token = await getToken();

      // Build ISO strings for backend
      const startISO = buildISOForSelected(selected.dayIndex, startTime);
      const endISO = buildISOForSelected(selected.dayIndex, endTime);

      // IMPORTANT: adjust these field names if your CreateShiftRequest uses different ones
      const payload = {
        assignedEmployeeId: selected.employeeId,
        startTime: startISO,
        endTime: endISO,
        position: selected.shift?.role ?? "Shift",
        location: "Store A",
      };

      await api.post("/shifts", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      closePopup();
      await fetchAllShifts();
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;

      console.log("POST /shifts failed:", status, err?.response?.data);

      Alert.alert("Error", backendMsg ?? (status ? `Failed to add shift (HTTP ${status}).` : "Failed to add shift."));
    } finally {
      setBusy(false);
    }
  }, [canManage, selected, startTime, endTime, fetchAllShifts]);

  return (
    <View style={styles.screen}>
      <ScheduleRow isHeader name="" shiftsByDay={DAYS} canEdit={false} />

      <View style={styles.sectionHeader}>
        <Ionicons name="chevron-down" size={18} color="#111" />
        <ThemedText type="title" style={styles.sectionText}>
          Department
        </ThemedText>
        <Text style={{ marginLeft: "auto", color: "#666", fontSize: 12 }}>
          {role ? `Role: ${role}` : ""}
        </Text>
      </View>

      {loading ? (
        <Text style={{ marginTop: 12 }}>Loading shifts...</Text>
      ) : error ? (
        <Pressable onPress={fetchAllShifts}>
          <Text style={{ marginTop: 12, color: "red" }}>{error}</Text>
          <Text style={{ marginTop: 6, color: "#111" }}>Tap to retry</Text>
        </Pressable>
      ) : rows.length === 0 ? (
        <Text style={{ marginTop: 12, color: "#444" }}>No shifts found.</Text>
      ) : (
        rows.map((r) => (
          <ScheduleRow
            key={r.name}
            name={r.name}
            shiftsByDay={r.shiftsByDay}
            canEdit={canManage} // ✅ ScheduleRow must use this to hide "+"
            onCellPress={canManage ? (dayIndex, shift) => openPopup(r.name, dayIndex, shift) : undefined}
          />
        ))
      )}

      {/* Popup Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closePopup}>
        <Pressable style={styles.backdrop} onPress={closePopup}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Pressable style={styles.closeBtn} onPress={closePopup}>
              <Ionicons name="close" size={22} color="#111" />
            </Pressable>

            <Text style={styles.popupTitle}>{selected?.employee ?? ""}</Text>
            <Text style={styles.popupText}>{selected ? DAYS[selected.dayIndex] : ""}</Text>

            {selected?.shift ? (
              <Text style={styles.popupSubText}>
                Current: {selected.shift.time} • {selected.shift.role}
              </Text>
            ) : (
              <Text style={styles.popupSubText}>No shift assigned</Text>
            )}

            <Text style={styles.dropdownLabel}>Time</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Text style={styles.timeLabel}>Start</Text>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => setOpenDropdown(openDropdown === "start" ? null : "start")}
                >
                  <Text style={styles.dropdownTriggerText}>{startTime}</Text>
                  <Ionicons name={openDropdown === "start" ? "chevron-up" : "chevron-down"} size={16} color="#111" />
                </Pressable>

                {openDropdown === "start" && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {HOURS.map((h) => (
                        <Pressable
                          key={h}
                          style={({ pressed }) => [
                            styles.dropdownItem,
                            h === startTime && styles.dropdownItemActive,
                            pressed && { opacity: 0.9 },
                          ]}
                          onPress={() => {
                            setStartTime(h);
                            const idx = HOURS.indexOf(h);
                            setEndTime(HOURS[Math.min(idx + 1, HOURS.length - 1)]);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{h}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.timeCol}>
                <Text style={styles.timeLabel}>End</Text>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => setOpenDropdown(openDropdown === "end" ? null : "end")}
                >
                  <Text style={styles.dropdownTriggerText}>{endTime}</Text>
                  <Ionicons name={openDropdown === "end" ? "chevron-up" : "chevron-down"} size={16} color="#111" />
                </Pressable>

                {openDropdown === "end" && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {HOURS.map((h) => (
                        <Pressable
                          key={h}
                          style={({ pressed }) => [
                            styles.dropdownItem,
                            h === endTime && styles.dropdownItemActive,
                            pressed && { opacity: 0.9 },
                          ]}
                          onPress={() => {
                            setEndTime(h);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{h}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {canManage ? (
              <View style={styles.buttonRow}>
                {selected?.shiftId ? (
                  <Pressable style={[styles.removeBtn, busy && { opacity: 0.6 }]} disabled={busy} onPress={handleRemoveShift}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </Pressable>
                ) : null}

                <Pressable style={[styles.addBtn, busy && { opacity: 0.6 }]} disabled={busy} onPress={handleAddShift}>
                  <Text style={styles.addBtnText}>Add shift</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={{ marginTop: 10, color: "#777" }}>View only — ask a manager to edit shifts.</Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#fff", flex: 1, padding: 24 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionText: { color: "#111", fontSize: 18, fontWeight: "600" },

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
    padding: 18,
  },

  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },

  popupTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 4 },
  popupText: { fontSize: 14, color: "#333" },
  popupSubText: { marginTop: 6, fontSize: 13, color: "#555", marginBottom: 12 },

  dropdownLabel: { fontSize: 12, color: "#777", marginBottom: 6 },

  timeRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  timeCol: { flex: 1 },
  timeLabel: { fontSize: 12, color: "#777", marginBottom: 4 },

  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  dropdownTriggerText: { fontSize: 14, color: "#111", fontWeight: "600" },

  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemActive: { backgroundColor: "#F5F6FF" },
  dropdownItemText: { fontSize: 14, color: "#111" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },

  removeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#fff",
  },
  removeBtnText: { color: "#EF4444", fontWeight: "800" },

  addBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  addBtnText: { color: "#fff", fontWeight: "800" },
});
