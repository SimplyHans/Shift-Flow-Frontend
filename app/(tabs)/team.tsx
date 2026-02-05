import Header from '@/components/storePage/top-bar';
import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from "@/app/config/axios";

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

  const buttonRefs = useRef<Record<number, any>>({});

  /** ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setEmployees(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load users');
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
      Alert.alert('Error', 'Failed to delete user');
    }
  };

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
            setMenuPosition({ x: px - 160, y: py });
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
        <Header />
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
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {showActions && selectedEmployee && (
        <TouchableWithoutFeedback onPress={() => setShowActions(false)}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.actionMenu,
                { top: menuPosition.y, left: menuPosition.x },
              ]}
            >
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
                onPress={() =>
                  Alert.alert(
                    'Delete User',
                    'Are you sure?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteUser(selectedEmployee.id),
                      },
                    ]
                  )
                }
              >
                <MaterialIcons name="delete" size={20} color="red" />
                <Text style={[styles.menuText, { color: 'red' }]}>Delete</Text>
              </TouchableOpacity>
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
    backgroundColor: '#ECECEC',
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
  table: {
    marginTop: 0, 
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ECECEC',
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
    borderRadius: 5,
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
});
