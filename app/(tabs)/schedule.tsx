import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import ScheduleRow from "@/components/scheduleRow";

type Shift = { time: string; role: string };

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function ScheduleScreen() {
  const [modalVisible, setModalVisible] = useState(false);
const [selected, setSelected] = useState<{
  employee: string;
  day: string;
  shift: Shift | null;
} | null>(null);


  const rows = [
    {
      name: "name1",
      shiftsByDay: [
        { time: "9:00am – 5:00pm", role: "Position" },
        null, null, null, null, null, null,
      ],
    },
    { name: "name2", shiftsByDay: [null, null, null, null, null, null, null] },
    { name: "name3", shiftsByDay: [null, null, null, null, null, null, null] },
  ];

const openPopup = (employee: string, dayIndex: number, shift: Shift | null) => {
  setSelected({
    employee,
    day: DAYS[dayIndex],
    shift,
  });
  setModalVisible(true);
};

  const closePopup = () => {
    setModalVisible(false);
    setSelected(null);
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
            onCellPress={(dayIndex, shift) =>
              openPopup(r.name, dayIndex, shift)
            }
          />
        ))}


      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <Pressable style={styles.backdrop} onPress={closePopup}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Shift</Text>
            <Text style={styles.popupText}>
              {selected?.shift
                ? `${selected.employee} • ${selected.day}
            ${selected.shift.time} • ${selected.shift.role}`
                : `${selected?.employee} • ${selected?.day}
            No shift assigned`}
            </Text>


            <Pressable style={styles.popupBtn} onPress={closePopup}>
              <Text style={styles.popupBtnText}>Close</Text>
            </Pressable>
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
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },

  popupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },

  popupText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 14,
    lineHeight: 20,
  },

  popupBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#111",
  },

  popupBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
