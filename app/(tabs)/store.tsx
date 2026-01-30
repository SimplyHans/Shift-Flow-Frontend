import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import Header from "../../components/storePage/top-bar"
import React from 'react'

export default function StoreScreen() {
    type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  jobType: string;
  hireDate: string;
};

  // Sample data
const employees: Employee[] = [
  { id: '1', name: 'Alice', role: 'Manager', department: 'HR', jobType: 'Full-Time', hireDate: '2022-01-10' },
  { id: '2', name: 'Bob', role: 'Developer', department: 'IT', jobType: 'Full-Time', hireDate: '2021-06-15' },
  { id: '3', name: 'Charlie', role: 'Intern', department: 'Marketing', jobType: 'Intern', hireDate: '2023-03-01' },
];


const renderItem = ({ item }: { item: Employee }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.role}</Text>
      <Text style={styles.cell}>{item.department}</Text>
      <Text style={styles.cell}>{item.jobType}</Text>
      <Text style={styles.cell}>{item.hireDate}</Text>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}>⋮</Text>
      </TouchableOpacity>
    </View>
  )
}


  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Header/>
      </View>
 

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Role</Text>
        <Text style={styles.headerCell}>Department</Text>
        <Text style={styles.headerCell}>Job Type</Text>
        <Text style={styles.headerCell}>Hire Date</Text>
        <Text style={styles.headerCell}></Text> {/* Empty for action column */}
      </View>

      {/* Table Rows */}
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.table}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 80, // leave space for header
    paddingHorizontal: 10,
    backgroundColor: "#FAFAFA",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ECECEC",
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  table: {
    marginTop: 0,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  actionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
