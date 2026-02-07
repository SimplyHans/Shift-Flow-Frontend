
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
];
const TIME_OPTIONS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export default function AvailabilityScreen() {
  const [availability, setAvailability] = useState(
    DAYS.map(() => ({ start: "", end: "" }))
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const openModal = (dayIdx: number) => {
    setSelectedDay(dayIdx);
    setStart(availability[dayIdx].start);
    setEnd(availability[dayIdx].end);
    setModalVisible(true);
  };

  const saveAvailability = () => {
    if (selectedDay !== null) {
      const updated = [...availability];
      updated[selectedDay] = { start, end };
      setAvailability(updated);
      setModalVisible(false);
    }
  };

  const removeAvailability = () => {
    if (selectedDay !== null) {
      const updated = [...availability];
      updated[selectedDay] = { start: "", end: "" };
      setAvailability(updated);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Availability</Text>
        <Pressable style={styles.cancelBtn} onPress={() => {
          setAvailability(DAYS.map(() => ({ start: "", end: "" }))); // Reset all
        }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => {/* Save logic here */}}>
          <Text style={styles.saveText}>Save Availability</Text>
        </Pressable>
      </View>
      {DAYS.map((day, idx) => (
        <View key={day} style={styles.dayRow}>
          <Text style={styles.dayLabel}>{day}</Text>
          {availability[idx].start && availability[idx].end ? (
            <View style={styles.timeBlock}>
              <MaterialIcons name="check" size={18} color="#4CAF50" />
              <Text style={styles.timeText}>{availability[idx].start} - {availability[idx].end}</Text>
            </View>
          ) : (
            <Text style={styles.noTime}>No time set</Text>
          )}
          <Pressable style={styles.editBtn} onPress={() => openModal(idx)}>
            <MaterialIcons name="edit" size={22} color="#262626" />
          </Pressable>
        </View>
      ))}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Store 1 &gt; Availability &gt; <Text style={styles.modalDay}>{selectedDay !== null ? DAYS[selectedDay] : ""}</Text></Text>
              <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#262626" />
              </Pressable>
            </View>
            <View style={styles.modalRow}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>Availability Start</Text>
                <View style={styles.dropdownWrap}>
                  <select
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    style={styles.dropdown}
                  >
                    <option value="">Select Time</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <MaterialIcons name="arrow-drop-down" size={22} color="#262626" style={styles.dropdownIcon} />
                </View>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>Availability End</Text>
                <View style={styles.dropdownWrap}>
                  <select
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    style={styles.dropdown}
                  >
                    <option value="">Select Time</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <MaterialIcons name="arrow-drop-down" size={22} color="#262626" style={styles.dropdownIcon} />
                </View>
              </View>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.removeBtn} onPress={removeAvailability}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={saveAvailability}>
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6579FF',
  },
  cancelText: {
    color: '#6579FF',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6579FF',
    borderRadius: 6,
    padding: 8,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  dayLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C8F7C5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  timeText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
  noTime: {
    color: '#AAA',
    fontStyle: 'italic',
    marginRight: 8,
  },
  editBtn: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: 380,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  modalDay: {
    fontWeight: '700',
    color: '#262626',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 16,
  },
  modalRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  modalCol: {
    flex: 1,
    marginHorizontal: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#262626',
  },
  dropdownWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  dropdown: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F7F8FA',
    fontSize: 16,
    appearance: 'none',
    outline: 'none',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    pointerEvents: 'none',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
    justifyContent: 'center',
  },
  removeBtn: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#6579FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#6579FF',
    fontWeight: '600',
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: '#6579FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
