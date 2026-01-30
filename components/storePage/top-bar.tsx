import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { Picker } from '@react-native-picker/picker';

export default function TopBar() {
  const [search, setSearch] = React.useState('');
  const [department, setDepartment] = React.useState('all');
  const [jobType, setJobType] = React.useState('all');

  return (
    <View style={styles.container}>
      {/* Left section with search and dropdowns */}
      <View style={styles.leftSection}>
        <TextInput
          style={styles.input}
          placeholder="Search User"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.dropdown}>
          <Picker
            style={styles.picker}
            selectedValue={department}
            onValueChange={(itemValue) => setDepartment(itemValue)}
          >
            <Picker.Item label="All Departments" value="all" />
            <Picker.Item label="IT" value="it" />
            <Picker.Item label="HR" value="hr" />
            <Picker.Item label="Finance" value="finance" />
            <Picker.Item label="Marketing" value="marketing" />
          </Picker>
        </View>

        <View style={styles.dropdown}>
          <Picker
            style={styles.picker}
            selectedValue={jobType}
            onValueChange={(itemValue) => setJobType(itemValue)}
          >
            <Picker.Item label="All Job Types" value="all" />
            <Picker.Item label="Full-Time" value="fulltime" />
            <Picker.Item label="Part-Time" value="parttime" />
            <Picker.Item label="Contract" value="contract" />
            <Picker.Item label="Intern" value="intern" />
          </Picker>
        </View>
      </View>

      {/* Right section with Create User button */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ Create User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
 
    width: '100%',
    gap: "45%",
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    marginLeft: 10,
  },
  input: {
    height: 40,
    backgroundColor: '#ECECEC',
    paddingHorizontal: 10,
    borderRadius: 15,
    flex: 1,
    marginRight: 10,
  },
  dropdown: {
    height: 40,
    width: 160,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 15,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 25,
    height: 40,
    width: '100%',
  },
  button: {
    height: 40, // same as input
    backgroundColor: '#6579FF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
