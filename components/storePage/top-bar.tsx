import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function TopBar({ search, setSearch }: Props) {
  const [department, setDepartment] = React.useState('all');
  const [jobType, setJobType] = React.useState('all');

  return (
    <View style={styles.container}>
      {/* Left section */}
      <View style={styles.leftSection}>
        {/* Search box with icon */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search user"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.dropdown}>
          <Picker
            selectedValue={department}
            onValueChange={setDepartment}
          >
            <Picker.Item label="All Departments" value="all" />
            <Picker.Item label="IT" value="it" />
            <Picker.Item label="HR" value="hr" />
          </Picker>
        </View>

        <View style={styles.dropdown}>
          <Picker
            selectedValue={jobType}
            onValueChange={setJobType}
          >
            <Picker.Item label="All Job Types" value="all" />
            <Picker.Item label="Full-Time" value="fulltime" />
            <Picker.Item label="Part-Time" value="parttime" />
          </Picker>
        </View>
      </View>

      {/* Right section */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Create User</Text>
      </TouchableOpacity>
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
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#6579FF'
  },
  buttonText: {
    color: '#6579FF',
    fontWeight: '600',
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
  marginLeft: 6,
},

});
