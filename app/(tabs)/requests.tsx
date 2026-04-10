import api from "@/app/config/axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7" },
  ACCEPTED_BY_TARGET: { label: "Pending Approval", color: "#6366F1", bg: "#EEF2FF" },
  APPROVED: { label: "Approved", color: "#10B981", bg: "#D1FAE5" },
  DECLINED_BY_TARGET: { label: "Declined", color: "#EF4444", bg: "#FEE2E2" },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "#FEE2E2" },
  CANCELLED: { label: "Cancelled", color: "#6B7280", bg: "#F3F4F6" },
};

export default function RequestsScreen() {
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [managerRequests, setManagerRequests] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me").then(res => {
      setRole(res.data.role);
      setMyUserId(res.data.id);
    }).catch(() => setRole(null));

    // Load both inbox and sent, merge them
    Promise.all([
      api.get("/swap-requests/inbox").then(r => r.data).catch(() => []),
      api.get("/swap-requests/sent").then(r => r.data).catch(() => []),
    ]).then(([inbox, sent]) => {
      // Merge and deduplicate by id
      const merged = [...inbox, ...sent];
      const unique = Array.from(new Map(merged.map((r: any) => [r.id, r])).values());
      // Sort by createdAt desc
      unique.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllRequests(unique);
    }).finally(() => setLoading(false));

    api.get("/swap-requests/all")
      .then(res => setManagerRequests(res.data.filter((r: any) => r.status === "ACCEPTED_BY_TARGET")))
      .catch(() => setManagerRequests([]));
  }, []);

  const handleAccept = (id: number) => {
    api.put(`/swap-requests/${id}/accept`)
      .then(res => {
        setAllRequests(prev => prev.map((r: any) => r.id === id ? res.data : r));
      })
      .catch(err => console.error("Accept failed:", err?.response?.status, err?.response?.data));
  };

  const handleDecline = (id: number) => {
    api.put(`/swap-requests/${id}/decline`)
      .then(res => {
        setAllRequests(prev => prev.map((r: any) => r.id === id ? res.data : r));
      })
      .catch(err => console.error("Decline failed", err));
  };

  const handleApprove = (id: number) => {
    api.put(`/swap-requests/${id}/approve`)
      .then(() => setManagerRequests(prev => prev.filter((r: any) => r.id !== id)))
      .catch(err => console.error("Approve failed", err));
  };

  const handleReject = (id: number) => {
    api.put(`/swap-requests/${id}/reject`)
      .then(() => setManagerRequests(prev => prev.filter((r: any) => r.id !== id)))
      .catch(err => console.error("Reject failed", err));
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString();

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const isManager = role === "MANAGER" || role === "ADMIN";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Requests</Text>

      {/* ===== Manager approval section ===== */}
      {isManager && managerRequests.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel}>Pending Approval</Text>
          {managerRequests.map((r: any) => (
            <View key={r.id} style={styles.managerCard}>
              <View style={styles.managerCardInfo}>
                <Text style={styles.managerCardTitle}>
                  {r.requester.firstName} {r.requester.lastName} ↔ {r.targetUser.firstName} {r.targetUser.lastName}
                </Text>
                <Text style={styles.managerCardSub}>
                  {formatDate(r.requesterShift.startTime)} {formatTime(r.requesterShift.startTime)}–{formatTime(r.requesterShift.endTime)}
                </Text>
                <Text style={styles.managerCardSub}>
                  ↔ {formatDate(r.targetShift.startTime)} {formatTime(r.targetShift.startTime)}–{formatTime(r.targetShift.endTime)}
                </Text>
              </View>
              <View style={styles.managerCardActions}>
                <Pressable style={styles.rejectBtn} onPress={() => handleReject(r.id)}>
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
                <Pressable style={styles.approveBtn} onPress={() => handleApprove(r.id)}>
                  <Text style={styles.approveText}>Approve</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ===== Employee requests section ===== */}
      {!isManager && (
        <>
          <Text style={styles.sectionLabel}>My Requests</Text>
          {allRequests.length === 0 && (
            <View style={styles.emptyWrap}>
              <View style={styles.subtitleRow}>
                <MaterialIcons name="swap-horiz" size={28} color="black" />
                <Text style={styles.subtitle}>Shift requests will appear here.</Text>
              </View>
            </View>
          )}
          {allRequests.map((r: any) => {
            const statusConfig = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
            const isTarget = r.targetUser?.id === myUserId;
            const canRespond = isTarget && r.status === "PENDING";

            return (
              <View key={r.id} style={styles.requestCard}>
                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>

                {/* Shift info */}
                <View style={styles.shiftRow}>
                  <View style={styles.shiftBlock}>
                    <View style={[styles.accent, { backgroundColor: "#FFB74D" }]} />
                    <View>
                      <Text style={styles.shiftLabel}>
                        {r.requester.firstName} {r.requester.lastName}
                      </Text>
                      <Text style={styles.shiftDate}>{formatDate(r.requesterShift.startTime)}</Text>
                      <Text style={styles.shiftTime}>
                        {formatTime(r.requesterShift.startTime)} - {formatTime(r.requesterShift.endTime)}
                      </Text>
                    </View>
                  </View>

                  <MaterialIcons name="swap-horiz" size={24} color="#111" />

                  <View style={styles.shiftBlock}>
                    <View style={[styles.accent, { backgroundColor: "#7986CB" }]} />
                    <View>
                      <Text style={styles.shiftLabel}>
                        {r.targetUser.firstName} {r.targetUser.lastName}
                      </Text>
                      <Text style={styles.shiftDate}>{formatDate(r.targetShift.startTime)}</Text>
                      <Text style={styles.shiftTime}>
                        {formatTime(r.targetShift.startTime)} - {formatTime(r.targetShift.endTime)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Accept/Decline only if target and pending */}
                {canRespond && (
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.declineBtn}
                      onPress={() => handleDecline(r.id)}
                    >
                      <Text style={styles.declineText}>Decline</Text>
                    </Pressable>
                    <Pressable
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(r.id)}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </>
      )}

      {/* ===== Manager with no pending ===== */}
      {isManager && managerRequests.length === 0 && (
        <View style={styles.emptyWrap}>
          <View style={styles.subtitleRow}>
            <MaterialIcons name="swap-horiz" size={28} color="black" />
            <Text style={styles.subtitle}>No swap requests pending approval.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFAFA", paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#555", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  emptyWrap: { flex: 1, justifyContent: "center", paddingTop: 60 },
  subtitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  subtitle: { fontSize: 18, opacity: 0.75 },

  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftBlock: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  accent: {
    width: 4,
    borderRadius: 2,
    minHeight: 40,
  },
  shiftLabel: { fontSize: 13, fontWeight: "600", color: "#111" },
  shiftDate: { fontSize: 12, color: "#777" },
  shiftTime: { fontSize: 12, color: "#555" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  declineBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7C83FF",
  },
  declineText: { color: "#7C83FF", fontWeight: "500" },
  acceptBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#7C83FF",
  },
  acceptText: { color: "#fff", fontWeight: "600" },

  managerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  managerCardInfo: { flex: 1, marginRight: 12 },
  managerCardTitle: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 4 },
  managerCardSub: { fontSize: 12, color: "#777" },
  managerCardActions: { gap: 8 },
  rejectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e57373",
  },
  rejectText: { color: "#e57373", fontWeight: "500" },
  approveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#7C83FF",
  },
  approveText: { color: "#fff", fontWeight: "600" },
});