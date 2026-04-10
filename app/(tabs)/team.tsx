import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from "@/app/config/axios";
import TopBar from '@/components/storePage/top-bar';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  createdAt: string;
};

export default function TeamScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', role: '' });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const buttonRefs = useRef<Record<number, any>>({});

  /** ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setEmployees(res.data);
    } catch (err) {
      console.log('Failed to load users', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /** ---------------- HELPER: GET INITIALS ---------------- */
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  /** ---------------- DELETE USER ---------------- */
  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setEmployees((prev) => prev.filter((u) => u.id !== id));
      setShowActions(false);
    } catch (err) {
      console.log('Failed to delete user', err);
    }
  };

  /** ---------------- EDIT USER ---------------- */
  const updateUser = async () => {
    if (!selectedEmployee) return;
    try {
      await api.put(`/admin/users/${selectedEmployee.id}`, editData);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, ...editData } : emp
        )
      );
      setShowEditModal(false);
    } catch (err) {
      console.log('Failed to update user', err);
    }
  };

  /** ---------------- FILTER EMPLOYEES ---------------- */
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  /** ---------------- RENDER ROW ---------------- */
  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.row}>
      <View style={{ flex: 2, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }}>
        {/* INITIALS LOGO */}
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{getInitials(item.firstName, item.lastName)}</Text>
        </View>
        
        <Text style={styles.cell}>
          {item.firstName} {item.lastName}
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>{item.role}</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>—</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>
          {item.role === 'EMPLOYEE' ? 'Hourly' : 'Salary'}
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        ref={(ref) => (buttonRefs.current[item.id] = ref)}
        style={styles.actionButton}
        onPress={() => {
          const btn = buttonRefs.current[item.id];
          btn?.measureInWindow((px: number, py: number) => {
            setMenuPosition({ x: px - 345, y: py + 20 });
            setSelectedEmployee(item);
            setShowActions(true);
          });
        }}
      >
        <Text style={styles.actionText}>⋮</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TopBar search={search} setSearch={setSearch} />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
        <Text style={styles.headerCell}>Role</Text>
        <Text style={styles.headerCell}>Department</Text>
        <Text style={styles.headerCell}>Job Type</Text>
        <Text style={styles.headerCell}>Hire Date</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {/* ---------------- ACTION MENU ---------------- */}
      {showActions && selectedEmployee && (
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setShowActions(false)}>
            <View style={styles.overlayBackground} />
          </TouchableWithoutFeedback>

          <View style={[styles.actionMenu, { top: menuPosition.y, left: menuPosition.x }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setEditData({
                  firstName: selectedEmployee.firstName,
                  lastName: selectedEmployee.lastName,
                  role: selectedEmployee.role,
                });
                setShowActions(false);
                setShowEditModal(true);
              }}
            >
              <MaterialIcons name="edit" size={20} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowActions(false);
                setShowDeleteConfirm(true);
              }}
            >
              <MaterialIcons name="delete" size={20} color="red" />
              <Text style={[styles.menuText, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {showEditModal && selectedEmployee && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <View style={styles.divider} />
            
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.readOnlyEmail}>{selectedEmployee.email || 'No email provided'}</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.firstName}
                  onChangeText={(t) => setEditData({ ...editData, firstName: t })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.lastName}
                  onChangeText={(t) => setEditData({ ...editData, lastName: t })}
                />
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 15 }]}>Role</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger} 
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              <Text>{editData.role}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} />
            </TouchableOpacity>

            {showRoleDropdown && (
              <View style={styles.dropdownMenu}>
                {['ADMIN', 'MANAGER', 'EMPLOYEE'].map((r) => (
                  <TouchableOpacity 
                    key={r} 
                    style={styles.dropdownItem}
                    onPress={() => {
                      setEditData({ ...editData, role: r as any });
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.modalButtons, { marginTop: 30 }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateUser}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
      {showDeleteConfirm && selectedEmployee && (
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowDeleteConfirm(false)}>
            <View style={styles.overlayBackground} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContainer}>
            <View style={styles.modalTitleContainer}>
              <MaterialIcons name="warning" size={24} color="#262626" />
              <Text style={styles.modalTitle}>
                Are you sure you want to delete '{selectedEmployee.firstName} {selectedEmployee.lastName}'?
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.modalMessage}>
              You cannot undo this change after submitting.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => {
                  deleteUser(selectedEmployee.id);
                  setShowDeleteConfirm(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ 
  screen: { flex: 1, paddingTop: 80, paddingHorizontal: 10, backgroundColor: '#FAFAFA' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, padding: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  headerCell: { flex: 1, fontWeight: 'bold', textAlign: 'left', paddingHorizontal: 12, color: '#4b4f64' },
  row: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 12, alignItems: 'center' },
  cell: { flex: 1, textAlign: 'left', paddingHorizontal: 12 },
  
  // INITIALS LOGO STYLES
  initialsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4b4f64',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  actionButton: { width: 40, height: 40, backgroundColor: '#ECECEC', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 15 },
  actionText: { fontSize: 18, fontWeight: 'bold' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlayBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  actionMenu: { width: 160, backgroundColor: '#FFF', borderRadius: 8, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, paddingVertical: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  menuText: { fontSize: 15, marginLeft: 8 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  divider: { height: 1, backgroundColor: '#EBEBEB', marginVertical: 10 },
  modalContainer: { width: 500, backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#262626', marginBottom: 2 },
  modalMessage: { fontSize: 14, textAlign: 'left', color: '#555', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cancelButton: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  deleteButton: { backgroundColor: 'red' },
  cancelButtonText: { color: '#333', fontWeight: '500' },
  deleteButtonText: { color: '#fff', fontWeight: '500' },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },

  // Edit Modal Styles
  label: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 5 },
  readOnlyEmail: { fontSize: 15, color: '#999', backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 15 },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 },
  dropdownMenu: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, marginTop: 5, backgroundColor: '#FFF' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  saveButton: { backgroundColor: '#787AFF' },
  saveButtonText: { color: '#FFF', fontWeight: '500' },
});