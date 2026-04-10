import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator, Platform } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from "@/app/config/axios";

const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
];
const TIME_OPTIONS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

type Slot = { id: number | null; start: string; end: string };
type User = { id: number; firstName: string; lastName: string; role: string };

function toBackendTime(display: string): string {
  const [time, meridiem] = display.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function toDisplayTime(backend: string): string {
  const [h, m] = backend.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export default function AvailabilityScreen() {
  const [slots, setSlots] = useState<Slot[]>(DAYS.map(() => ({ id: null, start: "", end: "" })));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manager/Admin Specific States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const fetchAvailability = useCallback(async (employeeId?: number | null) => {
    try {
      setLoading(true);
      setError(null);
      
      // If employeeId is provided, fetch specific. Otherwise, fetch /me.
      const endpoint = employeeId 
        ? `/availability/employee/${employeeId}` 
        : "/availability/me";

      const { data } = await api.get<{ id: number; dayOfWeek: string; startTime: string; endTime: string }[]>(endpoint);
      
      const updated = DAYS.map(() => ({ id: null as number | null, start: "", end: "" }));
      data.forEach((slot) => {
        const idx = DAYS.indexOf(slot.dayOfWeek);
        if (idx !== -1) {
          updated[idx] = {
            id: slot.id,
            start: toDisplayTime(slot.startTime),
            end: toDisplayTime(slot.endTime),
          };
        }
      });
      setSlots(updated);
    } catch {
      setError("Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeData = useCallback(async () => {
    try {
      // 1. Get current user role
      const userRes = await api.get<User>("/auth/me");
      setCurrentUser(userRes.data);

      // 2. If Manager/Admin, get user list
      if (userRes.data.role === "MANAGER" || userRes.data.role === "ADMIN") {
        const listRes = await api.get<User[]>("/admin/users");
        setUserList(listRes.data);
      }

      // 3. Initial fetch for self
      await fetchAvailability();
    } catch (err) {
      setError("Initialization failed.");
    } finally {
      setLoading(false);
    }
  }, [fetchAvailability]);

  useEffect(() => { initializeData(); }, [initializeData]);

  const handleUserSelect = (val: string) => {
    const id = val === "me" ? null : parseInt(val);
    setSelectedEmployeeId(id);
    fetchAvailability(id);
  };

  const openModal = (dayIdx: number) => {
    // Prevent editing if viewing someone else
    if (selectedEmployeeId !== null) return;
    
    setSelectedDay(dayIdx);
    setStart(slots[dayIdx].start);
    setEnd(slots[dayIdx].end);
    setModalVisible(true);
  };

  // Rest of functions (saveSlot, removeSlot) remain the same but use fetchAvailability(selectedEmployeeId)
  const saveSlot = async () => {
    if (selectedDay === null || !start || !end) return;
    setSaving(true);
    try {
      const body = { dayOfWeek: DAYS[selectedDay], startTime: toBackendTime(start), endTime: toBackendTime(end) };
      const existing = slots[selectedDay];
      if (existing.id) await api.put(`/availability/${existing.id}`, body);
      else await api.post("/availability", body);
      await fetchAvailability(selectedEmployeeId);
      setModalVisible(false);
    } catch { setError("Failed to save."); } finally { setSaving(false); }
  };

  const removeSlot = async () => {
    if (selectedDay === null) return;
    const existing = slots[selectedDay];
    if (!existing.id) {
        const updated = [...slots];
        updated[selectedDay] = { id: null, start: "", end: "" };
        setSlots(updated);
        setModalVisible(false);
        return;
    }
    setSaving(true);
    try {
      await api.delete(`/availability/${existing.id}`);
      await fetchAvailability(selectedEmployeeId);
      setModalVisible(false);
    } catch { setError("Failed to remove."); } finally { setSaving(false); }
  };

  if (loading && !userList.length) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6579FF" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
            <Text style={styles.title}>Availability</Text>
            {/* Action buttons only visible if editing own profile */}
            {!selectedEmployeeId && (
                <View style={{flexDirection: 'row'}}>
                    <Pressable style={styles.cancelBtn} onPress={() => fetchAvailability()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.saveBtn} onPress={() => fetchAvailability()}>
                        <Text style={styles.saveText}>Save Availability</Text>
                    </Pressable>
                </View>
            )}
        </View>

        {/* Manager Dropdown */}
        {(currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN") && (
            <View style={styles.managerDropdownContainer}>
                <Text style={styles.dropdownLabel}>Viewing Profile:</Text>
                <View style={styles.dropdownWrap}>
                    <select
                        style={styles.dropdown}
                        value={selectedEmployeeId ?? "me"}
                        onChange={(e) => handleUserSelect(e.target.value)}
                    >
                        <option value="me">My Profile (Self)</option>
                        {userList.filter(u => u.id !== currentUser?.id).map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.role})
                            </option>
                        ))}
                    </select>
                    <MaterialIcons name="arrow-drop-down" size={22} color="#262626" style={styles.dropdownIcon} />
                </View>
            </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {DAYS.map((day, idx) => (
        <View key={day} style={styles.dayRow}>
          <Text style={styles.dayLabel}>{day}</Text>
          {slots[idx].start && slots[idx].end ? (
            <View style={styles.timeBlock}>
              <MaterialIcons name="check" size={18} color="#4CAF50" />
              <Text style={styles.timeText}>{slots[idx].start} - {slots[idx].end}</Text>
            </View>
          ) : (
            <Text style={styles.noTime}>No time set</Text>
          )}
          
          {/* Edit button only visible when viewing self */}
          {!selectedEmployeeId && (
            <Pressable style={styles.editBtn} onPress={() => openModal(idx)}>
                <MaterialIcons name="edit" size={22} color="#262626" />
            </Pressable>
          )}
        </View>
      ))}

      {/* MODAL remains exactly as your original code */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Availability &gt; <Text style={styles.modalDay}>{selectedDay !== null ? DAYS[selectedDay] : ""}</Text>
              </Text>
              <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#262626" />
              </Pressable>
            </View>
            <View style={styles.modalRow}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>Availability Start</Text>
                <View style={styles.dropdownWrap}>
                  <select value={start} onChange={e => setStart(e.target.value)} style={styles.dropdown}>
                    <option value="">Select Time</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </View>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>Availability End</Text>
                <View style={styles.dropdownWrap}>
                  <select value={end} onChange={e => setEnd(e.target.value)} style={styles.dropdown}>
                    <option value="">Select Time</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </View>
              </View>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.removeBtn} onPress={removeSlot} disabled={saving}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={saveSlot} disabled={saving || !start || !end}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#FAFAFA' },
  headerContainer: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', flex: 1 },
  managerDropdownContainer: { marginTop: 8 },
  dropdownLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 6 },
  cancelBtn: { backgroundColor: '#FFF', borderRadius: 6, padding: 8, marginRight: 8, borderWidth: 1, borderColor: '#6579FF' },
  cancelText: { color: '#6579FF', fontWeight: '600' },
  saveBtn: { backgroundColor: '#6579FF', borderRadius: 6, padding: 8 },
  saveText: { color: '#FFF', fontWeight: '600' },
  errorBox: { backgroundColor: '#ffebee', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: '#c62828', fontSize: 14, textAlign: 'center' },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12 },
  dayLabel: { flex: 1, fontSize: 18, fontWeight: '500' },
  timeBlock: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C8F7C5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 },
  timeText: { color: '#4CAF50', fontWeight: '600', marginLeft: 6 },
  noTime: { color: '#AAA', fontStyle: 'italic', marginRight: 8 },
  editBtn: { backgroundColor: '#FFF', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: '#CCC' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: 380, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#262626' },
  modalDay: { fontWeight: '700', color: '#262626' },
  closeBtn: { padding: 4, borderRadius: 16 },
  modalRow: { flexDirection: 'row', marginBottom: 24, gap: 16 },
  modalCol: { flex: 1 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#262626' },
  dropdownWrap: { position: 'relative', marginBottom: 8 },
  dropdown: { width: '100%', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#F7F8FA', fontSize: 16, appearance: 'none', outline: 'none' },
  dropdownIcon: { position: 'absolute', right: 12, top: 16, pointerEvents: 'none' },
  modalActions: { flexDirection: 'row', marginTop: 8, gap: 16, justifyContent: 'center' },
  removeBtn: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, borderWidth: 1, borderColor: '#6579FF', alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#6579FF', fontWeight: '600', fontSize: 16 },
  addBtn: { backgroundColor: '#6579FF', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});