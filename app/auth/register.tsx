import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import api from "@/app/config/axios";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE"); 
  const [loading, setLoading] = useState(false);
const handleRegister = async () => {
  if (!firstName || !lastName || !email || !password) {
    Alert.alert("Error", "Please fill in all required fields.");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "You must be logged in as admin to create users.");
      setLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const { data } = await api.post("/admin/users", {
      firstName,
      lastName,
      email,
      password,
      role,
    });

    Alert.alert("Success", `Employee ${data.firstName} created!`);
    router.replace("/(tabs)/team");
  } catch (err: any) {
    console.error(err);
    const message =
      err?.response?.data?.message || "Failed to create user. Try again.";
    Alert.alert("Error", message);
  } finally {
    setLoading(false);
  }
};



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.logo}>SHIFT FLOW</Text>
        <View style={styles.sidebarContent}>
          <Text style={styles.sidebarTitle}>Manage Staff</Text>
          <Text style={styles.sidebarText}>
            See all staff in one place with quick access to their roles,
            details, and shift information.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)/team")}
          >
            <Text style={styles.backButtonText}>← Management</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Create User</Text>
        <Text style={styles.subtitle}>Enter information for your employee</Text>

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              style={styles.picker}
              selectedValue={role}
              onValueChange={setRole}
            >
              <Picker.Item label="Admin" value="ADMIN" />
              <Picker.Item label="Manager" value="MANAGER" />
              <Picker.Item label="Employee" value="EMPLOYEE" />
            </Picker>
          </View>
        </View>


        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading ? "Creating..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  /* Sidebar */
  sidebar: {
    width: '35%',
    backgroundColor: '#6F7CF7',
    padding: 30,
  },
  logo: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
    letterSpacing: 1,
  },
  sidebarContent: {
    marginTop: 120,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 35,
    fontWeight: '700',
    marginBottom: 12,
  },
  sidebarText: {
    color: '#E5E7FF',
    lineHeight: 20,
    marginBottom: 30,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
  },

  /* Content */
  content: {
    paddingVertical: 70,
    flex: 1,
    paddingHorizontal: 200,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginBottom: 40,
  },

  row: {
    flexDirection: 'row',
    gap: 20,
  },

  inputWrapper: {
    marginBottom: 20,
    flex: 1,
  },
  label: {
    marginBottom: 6,
    fontSize: 12,
    color: '#444',
  },
input: {
  borderWidth: 1,
  borderColor: '#9FA2BB',
  backgroundColor: '#FAFBFF',
  borderRadius: 8,
  padding: 12,
  height: 48,
},

pickerWrapper: {
  borderWidth: 1,
  borderColor: '#9FA2BB',
  backgroundColor: '#FAFBFF',
  borderRadius: 8,
  height: 48,
  justifyContent: 'center'  
},

picker: {
  height: 48,
  borderRadius: 8,
  paddingHorizontal: 8,
},


 

  registerButton: {
    backgroundColor: '#6F7CF7',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
    width: 180,
    alignSelf: 'center',
  },
  registerText: {
    color: '#fff',
    fontWeight: '600',
  },
});
