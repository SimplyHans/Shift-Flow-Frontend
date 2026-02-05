import Header from '@/components/storePage/top-bar';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TeamScreen() {
  const [showActions, setShowActions] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  const buttonRefs = React.useRef<Record<string, any>>({});

  type Employee = {
    id: string;
    name: string;
    role: string;
    department: string;
    jobType: string;
    hireDate: string;
  };

  const employees: Employee[] = [
    { id: '1', name: 'Alice', role: 'Manager', department: 'HR', jobType: 'Full-Time', hireDate: '2022-01-10' },
    { id: '2', name: 'Bob', role: 'Developer', department: 'IT', jobType: 'Full-Time', hireDate: '2021-06-15' },
    { id: '3', name: 'Charlie', role: 'Intern', department: 'Marketing', jobType: 'Intern', hireDate: '2023-03-01' },
  ];

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.row}>
      <View style={{ flex: 2, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>{item.name}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>{item.role}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>{item.department}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>{item.jobType}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.cell}>{item.hireDate}</Text>
      </View>
      <View>
      <TouchableOpacity
        ref={(ref: any) => (buttonRefs.current[item.id] = ref)}
        style={styles.actionButton}
        onPress={() => {
          const btn = buttonRefs.current[item.id];
          if (btn) {
            btn.measureInWindow((px: number, py: any, width: any, height: any) => {
              setMenuPosition({
                x: px - 345, 
                y: py, 
              });
              setSelectedEmployee(item);
              setShowActions(true);
            });
          }
        }}>
          <Text style={styles.actionText}>⋮</Text>
        </TouchableOpacity>
      </View>

 

    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Header />
      </View>

      <View style={styles.tableHeader}>
        <View style={{ flex: 2, paddingHorizontal: 12 }}>
          <Text style={styles.headerCell}>Name</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.headerCell}>Role</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.headerCell}>Department</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.headerCell}>Job Type</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.headerCell}>Hire Date</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.table}
      />

      {/* Popover menu */}
      {showActions && (
        <TouchableWithoutFeedback onPress={() => setShowActions(false)}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.actionMenu,
                {
                  position: 'absolute',
                  top: menuPosition.y,
                  left: menuPosition.x,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowActions(false);
                  console.log('Edit', selectedEmployee);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#000" />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowActions(false);
                  console.log('Delete', selectedEmployee);
                }}
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
