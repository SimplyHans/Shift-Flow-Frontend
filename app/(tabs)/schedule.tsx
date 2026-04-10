import api from "@/app/config/axios";
import ScheduleRow, { Shift } from "@/components/scheduleRow";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HOURS = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM",
];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

type MeResponse = {
  id: number;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE" | string;
};

type UserApi = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
};

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  return d;
}

function weekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function buildDayHeaders(monday: Date): string[] {
  return DAYS.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${day.slice(0, 3)} ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  });
}

function buildWeekOptions(
  currentMonday: Date,
  pastWeeks: number,
  futureWeeks: number
): { label: string; monday: Date; isFuture: boolean }[] {
  const future = Array.from({ length: futureWeeks }, (_, i) => {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() + (i + 1) * 7);
    return { label: weekLabel(monday), monday, isFuture: true };
  });

  const past = Array.from({ length: pastWeeks }, (_, i) => {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - (i + 1) * 7);
    return { label: weekLabel(monday), monday, isFuture: false };
  });

  return [...future, ...past];
}

function dayIndexMon0FromISO(iso: string) {
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
  const [hStr, ampm] = label.split(" ");
  let h = parseInt(hStr, 10);
  const upper = (ampm ?? "").toUpperCase();
  if (upper === "AM") { if (h === 12) h = 0; }
  else if (upper === "PM") { if (h !== 12) h += 12; }
  return h;
}

function buildISOForWeek(monday: Date, dayIndexMon0: number, hourLabel: string): string {
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndexMon0);
  d.setHours(hourLabelTo24Hour(hourLabel), 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function getToken() {
  return localStorage.getItem("token");
}

export default function ScheduleScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const canManage = role === "ADMIN" || role === "MANAGER";

  const currentMonday = useMemo(() => getMondayOf(new Date()), []);
  const pastWeeks = 8;
  const futureWeeks = canManage ? 4 : 1;
  const weekOptions = useMemo(
    () => buildWeekOptions(currentMonday, pastWeeks, futureWeeks),
    [currentMonday, pastWeeks, futureWeeks]
  );
  const [selectedWeekMonday, setSelectedWeekMonday] = useState<Date | null>(null);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);

  const activeMonday = selectedWeekMonday ?? currentMonday;
  const activeDayHeaders = useMemo(() => buildDayHeaders(activeMonday), [activeMonday]);
  const activeWeekLabel = selectedWeekMonday
    ? weekLabel(selectedWeekMonday)
    : `${weekLabel(currentMonday)} (Current)`;

  const [allUsers, setAllUsers] = useState<UserApi[]>([]);
  const [allShifts, setAllShifts] = useState<ShiftApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySelectedShiftId, setMySelectedShiftId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const { data } = await api.get<MeResponse>("/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setRole(data?.role ?? null);
        setMyUserId(data?.id ?? null);
      } catch {
        setRole(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (!canManage) return;
    (async () => {
      try {
        const token = await getToken();
        const { data } = await api.get<UserApi[]>("/admin/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setAllUsers(Array.isArray(data) ? data : []);
      } catch {
        setAllUsers([]);
      }
    })();
  }, [canManage]);

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
      setError(backendMsg ?? (status ? `Failed to load shifts (HTTP ${status}).` : "Failed to load shifts."));
      setAllShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllShifts();
  }, [fetchAllShifts]);

  const { rows, idByCell } = useMemo(() => {
    const weekStart = activeMonday.getTime();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

    const weekShifts = allShifts.filter((s) => {
      const t = new Date(s.startTime).getTime();
      return t >= weekStart && t < weekEnd;
    });

    const map = new Map<string, (Shift | null)[]>();
    const idMap = new Map<string, (number | null)[]>();

    for (const s of weekShifts) {
      const name =
        `${s.assignedEmployee?.firstName ?? ""} ${s.assignedEmployee?.lastName ?? ""}`.trim() || "Unknown";
      const dayIndex = dayIndexMon0FromISO(s.startTime);

      if (!map.has(name)) map.set(name, Array(7).fill(null));
      if (!idMap.has(name)) idMap.set(name, Array(7).fill(null));

      map.get(name)![dayIndex] = {
        time: formatTimeRange(s.startTime, s.endTime),
        role: s.position ?? "Shift",
      };
      idMap.get(name)![dayIndex] = s.id;
    }

    if (canManage && allUsers.length > 0) {
      for (const u of allUsers) {
        const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unknown";
        if (!map.has(name)) {
          map.set(name, Array(7).fill(null));
          idMap.set(name, Array(7).fill(null));
        }
      }
    }

    return {
      rows: Array.from(map.entries()).map(([name, shiftsByDay]) => ({ name, shiftsByDay })),
      idByCell: idMap,
    };
  }, [allShifts, activeMonday, allUsers, canManage]);

  const [modalVisible, setModalVisible] = useState(false);
  const [isSwapModal, setIsSwapModal] = useState(false);
  const [selected, setSelected] = useState<{
    employee: string;
    dayIndex: number;
    shift: Shift | null;
    shiftId: number | null;
    employeeId: number | null;
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState(HOURS[0]);
  const [endTime, setEndTime] = useState(HOURS[1]);

  const openPopup = (employee: string, dayIndex: number, shift: Shift | null) => {
    const shiftId = idByCell.get(employee)?.[dayIndex] ?? null;
    const matchShift = allShifts.find((s) => s.id === shiftId);
    const isMyShift = matchShift?.assignedEmployee?.id === myUserId;

    if (!canManage) {
      if (!shiftId || isMyShift) return;
      setIsSwapModal(true);
      setSelected({ employee, dayIndex, shift, shiftId, employeeId: null });
      setModalVisible(true);
      return;
    }

    setIsSwapModal(false);
    let employeeId: number | null = null;
    if (matchShift) {
      employeeId = matchShift.assignedEmployee?.id ?? null;
    } else {
      const matchUser = allUsers.find((u) => {
        const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
        return name === employee;
      });
      employeeId = matchUser?.id ?? null;
    }

    setSelected({ employee, dayIndex, shift, shiftId, employeeId });

    if (shift?.time && matchShift) {
      const toLabel = (d: Date) => {
        const h = d.getHours();
        const ampm = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour} ${ampm}`;
      };
      const sLabel = toLabel(new Date(matchShift.startTime));
      const eLabel = toLabel(new Date(matchShift.endTime));
      setStartTime(HOURS.includes(sLabel) ? sLabel : HOURS[0]);
      setEndTime(HOURS.includes(eLabel) ? eLabel : HOURS[1]);
    } else {
      setStartTime(HOURS[0]);
      setEndTime(HOURS[1]);
    }

    setOpenDropdown(null);
    setModalVisible(true);
  };

  const closePopup = () => {
    setIsSwapModal(false);
    setModalVisible(false);
    setSelected(null);
    setOpenDropdown(null);
    setMySelectedShiftId(null);
  };

  const handleSwapRequest = useCallback(async () => {
    if (!selected?.shiftId) return;
    if (!mySelectedShiftId) {
      Alert.alert("Select a shift", "Please select one of your shifts to offer for the swap.");
      return;
    }
    try {
      setBusy(true);
      const token = await getToken();
      await api.post("/swap-requests", {
        myShiftId: mySelectedShiftId,
        targetShiftId: selected.shiftId,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      Alert.alert("Success", "Swap request sent!");
      closePopup();
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      Alert.alert("Error", backendMsg ?? "Failed to send swap request.");
    } finally {
      setBusy(false);
    }
  }, [selected, mySelectedShiftId]);

  const handleRemoveShift = useCallback(async () => {
    if (!canManage || !selected?.shiftId) return;
    console.log("Removing shift:", selected.shiftId);
    try {
      setBusy(true);
      const token = await getToken();
      await api.delete(`/shifts/${selected.shiftId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      closePopup();
      await fetchAllShifts();
    } catch (err: any) {
      console.log("Remove error status:", err?.response?.status);
      console.log("Remove error data:", err?.response?.data);
      const backendMsg = err?.response?.data?.message;
      Alert.alert("Error", backendMsg ?? "Failed to remove shift.");
    } finally {
      setBusy(false);
    }
  }, [canManage, selected, fetchAllShifts]);

  const handleAddShift = useCallback(async () => {
    if (!canManage || !selected) return;
    if (!selected.employeeId) {
      Alert.alert("Can't add shift", "Could not resolve employee ID.");
      return;
    }
    try {
      setBusy(true);
      const token = await getToken();
      const startISO = buildISOForWeek(activeMonday, selected.dayIndex, startTime);
      const endISO = buildISOForWeek(activeMonday, selected.dayIndex, endTime);
      await api.post("/shifts", {
        assignedEmployeeId: selected.employeeId,
        startTime: startISO,
        endTime: endISO,
        position: selected.shift?.role ?? "Shift",
        location: "Store A",
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      closePopup();
      await fetchAllShifts();
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      Alert.alert("Error", backendMsg ?? "Failed to add shift.");
    } finally {
      setBusy(false);
    }
  }, [canManage, selected, startTime, endTime, activeMonday, fetchAllShifts]);

  const handleUpdateShift = useCallback(async () => {
    if (!canManage || !selected?.shiftId) return;
    try {
      setBusy(true);
      const token = await getToken();
      const startISO = buildISOForWeek(activeMonday, selected.dayIndex, startTime);
      const endISO = buildISOForWeek(activeMonday, selected.dayIndex, endTime);
      await api.put(`/shifts/${selected.shiftId}`, {
        assignedEmployeeId: selected.employeeId,
        startTime: startISO,
        endTime: endISO,
        position: selected.shift?.role ?? "Shift",
        location: "Store A",
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      closePopup();
      await fetchAllShifts();
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      Alert.alert("Error", backendMsg ?? "Failed to update shift.");
    } finally {
      setBusy(false);
    }
  }, [canManage, selected, startTime, endTime, activeMonday, fetchAllShifts]);

  const hasExistingShift = !!selected?.shiftId;

  return (
    <View style={styles.screen}>
      <View style={styles.weekDropdownWrapper}>
        <Pressable
          style={styles.weekDropdownTrigger}
          onPress={() => setWeekDropdownOpen((prev) => !prev)}
        >
          <Text style={styles.weekDropdownTriggerText} numberOfLines={1}>
            {activeWeekLabel}
          </Text>
          <Ionicons
            name={weekDropdownOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color="#111"
          />
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

      <ScheduleRow isHeader name="" shiftsByDay={activeDayHeaders} canEdit={false} />

      <View style={styles.sectionHeader}>
        <Ionicons name="chevron-down" size={18} color="#111" />
        <ThemedText type="title" style={styles.sectionText}>Department</ThemedText>
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
        <Text style={{ marginTop: 12, color: "#444" }}>No employees found.</Text>
      ) : (
        rows.map((r) => (
          <ScheduleRow
            key={r.name}
            name={r.name}
            shiftsByDay={r.shiftsByDay}
            canEdit={canManage}
            activeMonday={activeMonday}
            onCellPress={(dayIndex, shift) => openPopup(r.name, dayIndex, shift)}
          />
        ))
      )}

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closePopup}>
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropClose} onPress={closePopup} />
          <View style={styles.popup}>
            <Pressable style={styles.closeBtn} onPress={closePopup}>
              <Ionicons name="close" size={22} color="#111" />
            </Pressable>

            <Text style={styles.popupTitle}>{selected?.employee ?? ""}</Text>
            <Text style={styles.popupText}>{selected ? DAYS[selected.dayIndex] : ""}</Text>

            {hasExistingShift ? (
              <Text style={styles.popupSubText}>
                {selected?.shift?.time} • {selected?.shift?.role}
              </Text>
            ) : (
              <Text style={styles.popupSubText}>No shift assigned</Text>
            )}

            {isSwapModal ? (
              <>
                <Text style={styles.dropdownLabel}>Your shift to offer:</Text>
                {(() => {
                  const myShifts = allShifts.filter(
                    (s) => s.assignedEmployee?.id === myUserId
                  );
                  if (myShifts.length === 0) {
                    return (
                      <Text style={{ color: "#999", fontSize: 13, marginBottom: 12 }}>
                        You have no shifts to offer.
                      </Text>
                    );
                  }
                  return (
                    <View style={{ marginBottom: 16 }}>
                      {myShifts.map((s) => {
                        const isSelected = mySelectedShiftId === s.id;
                        return (
                          <Pressable
                            key={s.id}
                            onPress={() => setMySelectedShiftId(s.id)}
                            style={{
                              padding: 10,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? "#7C83FF" : "#E5E7EB",
                              backgroundColor: isSelected ? "#F0F1FF" : "#fff",
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ fontWeight: "600", color: "#111", fontSize: 13 }}>
                              {formatTimeRange(s.startTime, s.endTime)}
                            </Text>
                            <Text style={{ color: "#777", fontSize: 12 }}>
                              {new Date(s.startTime).toLocaleDateString()} • {s.position ?? "Shift"}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  );
                })()}

                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.removeBtn, busy && { opacity: 0.6 }]}
                    disabled={busy}
                    onPress={closePopup}
                  >
                    <Text style={styles.removeBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.addBtn, (!mySelectedShiftId || busy) && { opacity: 0.5 }]}
                    disabled={!mySelectedShiftId || busy}
                    onPress={handleSwapRequest}
                  >
                    <Text style={styles.addBtnText}>Request</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
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
                              onPress={() => { setEndTime(h); setOpenDropdown(null); }}
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
                    {hasExistingShift ? (
                      <>
                        <Pressable
                          style={[styles.removeBtn, busy && { opacity: 0.6 }]}
                          disabled={busy}
                          onPress={handleRemoveShift}
                        >
                          <Text style={styles.removeBtnText}>Remove</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.addBtn, busy && { opacity: 0.6 }]}
                          disabled={busy}
                          onPress={handleUpdateShift}
                        >
                          <Text style={styles.addBtnText}>Save</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        style={[styles.addBtn, busy && { opacity: 0.6 }]}
                        disabled={busy}
                        onPress={handleAddShift}
                      >
                        <Text style={styles.addBtnText}>Add shift</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#fff", flex: 1, padding: 24 },

  weekDropdownWrapper: {
    marginBottom: 16,
    zIndex: 100,
    alignSelf: "flex-start",
    width: 180,
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
    width: 180,
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
  backdropClose: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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