import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ShiftStatus = 'pending' | 'claimed' | 'approved' | 'declined';

type OpenShift = {
  id: number;
  date: string;
  time: string;
  assignee: string;
  status: ShiftStatus;
};

export default function OpenShiftsScreen() {
  const [shifts, setShifts] = useState<OpenShift[]>([
    { id: 1, date: 'Fri 10-11-17', time: '3 p.m. - 11 p.m.', assignee: 'YOU', status: 'pending' },
    { id: 2, date: 'Fri 10-11-17', time: '3 p.m. - 11 p.m.', assignee: 'YOU', status: 'claimed' },
    { id: 3, date: 'Other Shift', time: '3 p.m. - 11 p.m.', assignee: 'YOU', status: 'approved' },
    { id: 4, date: 'Other Shift', time: '3 p.m. - 11 p.m.', assignee: 'YOU', status: 'pending' },
    { id: 5, date: 'Fri 10-12-03', time: '3 p.m. - 11 p.m.', assignee: 'YOU', status: 'declined' },
  ]);

  const handleAccept = (id: number) => {
    setShifts(shifts.map(shift => 
      shift.id === id ? { ...shift, status: 'claimed' as ShiftStatus } : shift
    ));
  };

  const handleDecline = (id: number) => {
    setShifts(shifts.map(shift => 
      shift.id === id ? { ...shift, status: 'declined' as ShiftStatus } : shift
    ));
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="auto-stories" size={64} color="#999" />
      <Text style={styles.emptyTitle}>Looks like no one has offered a shift yet.</Text>
      <Text style={styles.emptySubtitle}>Come back later.</Text>
    </View>
  );

  const renderShiftCard = (shift: OpenShift) => (
    <View key={shift.id} style={styles.shiftCard}>
      <View style={styles.shiftInfo}>
        <View style={styles.dateTimeRow}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.dateText}>{shift.date}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.timeText}>{shift.time}</Text>
        </View>
      </View>
      <Text style={styles.assigneeText}>{shift.assignee}</Text>
      <View style={styles.actionButtons}>
        {shift.status === 'pending' && (
          <>
            <Pressable 
              style={styles.declineBtn} 
              onPress={() => handleDecline(shift.id)}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </Pressable>
            <Pressable 
              style={styles.acceptBtn} 
              onPress={() => handleAccept(shift.id)}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </Pressable>
          </>
        )}
        {shift.status === 'claimed' && (
          <View style={[styles.statusBtn, styles.claimedBtn]}>
            <Text style={styles.statusBtnText}>Claimed</Text>
          </View>
        )}
        {shift.status === 'approved' && (
          <View style={[styles.statusBtn, styles.approvedBtn]}>
            <Text style={styles.statusBtnText}>Approved</Text>
          </View>
        )}
        {shift.status === 'declined' && (
          <View style={[styles.statusBtn, styles.declinedBtn]}>
            <Text style={styles.statusBtnText}>Declined</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Open Shifts</Text>
      <ScrollView style={styles.scrollView}>
        {shifts.length === 0 ? renderEmptyState() : shifts.map(renderShiftCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  shiftCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  assigneeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  declineBtn: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6579FF',
  },
  declineBtnText: {
    color: '#6579FF',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptBtn: {
    backgroundColor: '#6579FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  acceptBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  claimedBtn: {
    backgroundColor: '#C8F7C5',
  },
  approvedBtn: {
    backgroundColor: '#C8F7C5',
  },
  declinedBtn: {
    backgroundColor: '#FFE0E0',
  },
  statusBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
});
