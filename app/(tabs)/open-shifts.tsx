import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import api from "../config/axios";

type OpenShift = {
  id: number;
  status: string;
  shiftId: number;
  startTime: string;
  endTime: string;
  position: string;
  location: string;
  createdBy: { id: number; firstName: string; lastName: string };
  claimedBy: { id: number; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
};

type MyShift = {
  id: number;
  startTime: string;
  endTime: string;
  position: string;
  location: string;
};

export default function OpenShiftsScreen() {
  const [shifts, setShifts] = useState<OpenShift[]>([]);
  const [myShifts, setMyShifts] = useState<MyShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then((res) => setMyUserId(res.data.id));
    fetchShifts();
    fetchMyShifts();
  }, []);

  const fetchShifts = () => {
    api
      .get("/open-shifts")
      .then((res) => setShifts(res.data))
      .catch((err) => console.error("Failed to load open shifts", err))
      .finally(() => setLoading(false));
  };

  const fetchMyShifts = () => {
    api
      .get("/shifts/me")
      .then((res) => setMyShifts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load my shifts", err));
  };

  const handleClaim = (id: number) => {
    api
      .put(`/open-shifts/${id}/claim`)
      .then(() => fetchShifts())
      .catch((err) => console.error("Claim failed", err));
  };

  const handleCancel = (id: number) => {
    api
      .put(`/open-shifts/${id}/cancel`)
      .then(() => fetchShifts())
      .catch((err) => console.error("Cancel failed", err));
  };

  const handlePostOpen = () => {
    if (!selectedShiftId) return;
    setPosting(true);
    api
      .post("/open-shifts", { shiftId: selectedShiftId })
      .then(() => {
        setModalVisible(false);
        setSelectedShiftId(null);
        fetchShifts();
      })
      .catch((err) => console.error("Post open shift failed", err?.response?.data))
      .finally(() => setPosting(false));
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString();

  // Filter out shifts that are already posted as open
  const postedShiftIds = new Set(shifts.map((s) => s.shiftId));
  const availableToPost = myShifts.filter(
    (s) => !postedShiftIds.has(s.id) && new Date(s.startTime) > new Date()
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Open Shifts</Text>
        <Pressable
          style={({ pressed }) => [styles.postBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={18} color="#fff" />
          <Text style={styles.postBtnText}>Post Shift</Text>
        </Pressable>
      </View>

      {shifts.length === 0 && (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="event-available" size={28} color="black" />
          <Text style={styles.subtitle}>No open shifts available.</Text>
        </View>
      )}

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const isOwner = item.createdBy.id === myUserId;
          return (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.position}>{formatDate(item.startTime)}</Text>
                  <Text style={styles.location}>{item.location ?? "No location"}</Text>
                  <View style={styles.metaRow}>
                    <MaterialIcons name="event" size={13} color="#555" />
                    <Text style={styles.metaText}>{formatDate(item.startTime)}</Text>
                    <MaterialIcons name="schedule" size={13} color="#555" style={{ marginLeft: 8 }} />
                    <Text style={styles.metaText}>
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Text>
                  </View>
                  <Text style={styles.postedBy}>
                    Posted by {item.createdBy.firstName} {item.createdBy.lastName}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                {isOwner ? (
                  <Pressable
                    style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => handleCancel(item.id)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.claimBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => handleClaim(item.id)}
                  >
                    <Text style={styles.claimText}>Claim</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* ===== Post Open Shift Modal ===== */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.popup} onStartShouldSetResponder={() => true}>
            <Text style={styles.popupTitle}>Post a Shift as Open</Text>
            <Text style={styles.popupSubtitle}>Select one of your upcoming shifts:</Text>

            {availableToPost.length === 0 ? (
              <Text style={styles.noShiftsText}>
                You have no upcoming shifts available to post.
              </Text>
            ) : (
              availableToPost.map((s) => {
                const isSelected = selectedShiftId === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSelectedShiftId(s.id)}
                    style={[
  styles.shiftOption,
  isSelected && styles.shiftOptionSelected,
]}
>
  <Text style={styles.shiftOptionTitle}>{formatDate(s.startTime)}</Text>
  <Text style={styles.shiftOptionSub}>
    {formatTime(s.startTime)} - {formatTime(s.endTime)}
  </Text>
                    {s.location ? (
                      <Text style={styles.shiftOptionSub}>{s.location}</Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}

            <View style={styles.popupActions}>
              <Pressable
                style={styles.cancelPopupBtn}
                onPress={() => { setModalVisible(false); setSelectedShiftId(null); }}
              >
                <Text style={styles.cancelPopupText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.postConfirmBtn, (!selectedShiftId || posting) && { opacity: 0.5 }]}
                disabled={!selectedShiftId || posting}
                onPress={handlePostOpen}
              >
                <Text style={styles.postConfirmText}>Post</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: "#FAFAFA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "700" },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C83FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  postBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  subtitle: { fontSize: 16, opacity: 0.7 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: { flexDirection: "row", gap: 12, flex: 1 },
  accent: { width: 4, borderRadius: 2, backgroundColor: "#7C83FF" },
  position: { fontSize: 15, fontWeight: "600", color: "#111", marginBottom: 2 },
  location: { fontSize: 13, color: "#777", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#555" },
  postedBy: { fontSize: 12, color: "#999", marginTop: 6 },
  actions: { marginLeft: 12 },
  claimBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#7C83FF" },
  claimText: { color: "#fff", fontWeight: "600" },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: "#e57373" },
  cancelText: { color: "#e57373", fontWeight: "500" },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popup: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  popupTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  popupSubtitle: { fontSize: 13, color: "#777" },
  noShiftsText: { fontSize: 13, color: "#999", textAlign: "center", paddingVertical: 12 },
  shiftOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  shiftOptionSelected: {
    borderColor: "#7C83FF",
    backgroundColor: "#F0F1FF",
  },
  shiftOptionTitle: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 2 },
  shiftOptionSub: { fontSize: 12, color: "#777" },
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
});