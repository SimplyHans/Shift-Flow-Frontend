import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from "expo-router"; 

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function TopBar({ search, setSearch }: Props) {
  const [department, setDepartment] = React.useState('all');
  const [jobType, setJobType] = React.useState('all');
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    setIsAdmin(user.role === "ADMIN");
  }, []);

  return (
    <View style={styles.container}>
      {/* Left section */}
      <View style={styles.leftSection}>
        {/* Search box with icon */}
      <View style={[styles.searchContainer, { flex: 3 }]}>
        <MaterialIcons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search User"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>


        {/* Department Dropdown */}
        <Picker
          selectedValue={department}
          onValueChange={setDepartment}
          style={styles.picker}
        >
          <Picker.Item label="All Departments" value="all" />
          <Picker.Item label="IT" value="it" />
          <Picker.Item label="HR" value="hr" />
        </Picker>

        {/* Job Type Dropdown */}
        <Picker
          selectedValue={jobType}
          onValueChange={setJobType}
          style={styles.picker}
        >
          <Picker.Item label="All Job Types" value="all" />
          <Picker.Item label="Full-Time" value="fulltime" />
          <Picker.Item label="Part-Time" value="parttime" />
        </Picker>
      </View>

      {/* Right section */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/auth/register")}
        >
          <Text style={styles.buttonText}>+ Create User</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    gap: "30%",
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    marginLeft: 6,
  },
  picker: {
    flex: 1.5,
    height: 40,
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    marginRight: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderColor: '#ECECEC',
    borderWidth: 2,
    color: '#545454', // text color
  },
  button: {
    height: 40,
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#6579FF',
  },
  buttonText: {
    color: '#6579FF',
    fontWeight: '600',
  },
});
