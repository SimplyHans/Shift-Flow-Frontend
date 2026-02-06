import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from "@/app/config/axios";
import TopBar from '@/components/storePage/top-bar';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
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

  /** ---------------- FILTER EMPLOYEES ---------------- */
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  /** ---------------- RENDER ROW ---------------- */
  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.row}>
      <View style={{ flex: 2, paddingHorizontal: 12 }}>
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
            setMenuPosition({ x: px - 345, y: py + 20 }); // adjust so menu appears correctly
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
          {/* Background that closes the menu */}
          <TouchableWithoutFeedback onPress={() => setShowActions(false)}>
            <View style={styles.overlayBackground} />
          </TouchableWithoutFeedback>

          {/* Menu itself */}
          <View style={[styles.actionMenu, { top: menuPosition.y, left: menuPosition.x }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowActions(false);
                console.log('Edit', selectedEmployee);
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

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
{showDeleteConfirm && selectedEmployee && (
  <TouchableWithoutFeedback onPress={() => setShowDeleteConfirm(false)}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalTitleContainer}>
          <MaterialIcons name="warning" size={24} color="#262626" />
          <Text style={styles.modalTitle}>Are you sure you want to delete '{selectedEmployee.firstName} {selectedEmployee.lastName}'?</Text>
        </View>

        <View style={styles.divider} />

        {/* Message */}
        <Text style={styles.modalMessage}>
          You cannot undo this change after submitting.
        </Text>

        {/* Buttons */}
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
  </TouchableWithoutFeedback>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 15,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  actionMenu: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    marginLeft: 8,
  },
  
  modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},

divider: {
  height: 1,
  backgroundColor: '#EBEBEB',
  marginVertical: 10,
},


modalContainer: {
  width: 500,
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
},

iconContainer: {
  backgroundColor: '#E6F0FA',
  borderRadius: 50,
  padding: 10,
  marginBottom: 15,
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'left',
  color: '#262626',
  marginBottom: 2,
},

modalMessage: {
  fontSize: 14,
  textAlign: 'left',
  color: '#555',
  marginBottom: 20,
},

modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  gap: 10,
},

modalButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
},

cancelButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  backgroundColor: '#fff',
},

deleteButton: {
  backgroundColor: 'red',
},

cancelButtonText: {
  color: '#333',
  fontWeight: '500',
},

deleteButtonText: {
  color: '#fff',
  fontWeight: '500',
},
modalTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8, // spacing between icon and text
  marginBottom: 2,
},


});
