import React, { useMemo, useState } from "react";
import { View, StyleSheet, Modal, Pressable, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import ScheduleRow, { Shift } from "@/components/scheduleRow";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HOURS = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM",
];

function toHourLabel(shiftTime: string) {
  const raw = shiftTime.split("–")[0]?.trim() ?? "";
  const m = raw.match(/^(\d{1,2})(?::\d{2})?\s*(am|pm)$/i);
  if (!m) return null;
  const hour = m[1];
  const ampm = m[2].toUpperCase();
  return `${hour} ${ampm}`;
}

export default function ScheduleScreen() {
  const rows = useMemo(
    () => [
      {
        name: "name1",
        shiftsByDay: [
          { time: "9:00am – 5:00pm", role: "Position" },
          null, null, null, null, null, null,
        ] as (Shift | null)[],
      },
      { name: "name2", shiftsByDay: [null, null, null, null, null, null, null] as (Shift | null)[] },
      { name: "name3", shiftsByDay: [null, null, null, null, null, null, null] as (Shift | null)[] },
    ],
    []
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<{
    employee: string;
    dayIndex: number;
    shift: Shift | null;
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState(HOURS[0]);
  const [endTime, setEndTime] = useState(HOURS[1]);

  const openPopup = (employee: string, dayIndex: number, shift: Shift | null) => {
    setSelected({ employee, dayIndex, shift });

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

  const handleAddShift = () => {
    if (!selected) return;

    console.log("ADD SHIFT", {
      employee: selected.employee,
      day: DAYS[selected.dayIndex],
      startTime,
      endTime,
      existingShift: selected.shift,
    });

    closePopup();
  };

  const handleRemoveShift = () => {
    if (!selected?.shift) return;

    console.log("REMOVE SHIFT", {
      employee: selected.employee,
      day: DAYS[selected.dayIndex],
      shift: selected.shift,
    });

    closePopup();
  };

  return (
    <View style={styles.screen}>
      <ScheduleRow isHeader name="" shiftsByDay={DAYS} />

      <View style={styles.sectionHeader}>
        <Ionicons name="chevron-down" size={18} color="#111" />
        <ThemedText type="title" style={styles.sectionText}>
          Department
        </ThemedText>
      </View>

      {rows.map((r) => (
        <ScheduleRow
          key={r.name}
          name={r.name}
          shiftsByDay={r.shiftsByDay}
          onCellPress={(dayIndex, shift) => openPopup(r.name, dayIndex, shift)}
        />
      ))}

      {/* Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <Pressable style={styles.backdrop} onPress={closePopup}>
          <Pressable style={styles.popup} onPress={() => {}}>
                          <Pressable style={styles.closeBtn} onPress={closePopup}>
                <Ionicons name="close" size={22} color="#111" />
              </Pressable>
            <Text style={styles.popupTitle}>{selected?.employee ?? ""}</Text>

            <Text style={styles.popupText}>
              {selected ? DAYS[selected.dayIndex] : ""}
            </Text>

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
                  <Ionicons
                    name={openDropdown === "start" ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#111"
                  />
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
                            // auto set end to next slot
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
                  <Ionicons
                    name={openDropdown === "end" ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#111"
                  />
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

            {/* Buttons: Remove shows only if there was a shift */}
            <View style={styles.buttonRow}>
              {selected?.shift ? (
                <Pressable style={styles.removeBtn} onPress={handleRemoveShift}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </Pressable>
              ) : null}

              <Pressable style={styles.addBtn} onPress={handleAddShift}>
                <Text style={styles.addBtnText}>Add shift</Text>
              </Pressable>
            </View>
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
  addBtnText: { color: "#fff", fontWeight: "800" },closeBtn: {
  position: "absolute",
  top: 12,
  right: 12,
  padding: 4,
  zIndex: 10,
},

});
