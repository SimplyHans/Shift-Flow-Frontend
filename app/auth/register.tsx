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
      const message = err?.response?.data?.message || "Failed to create user. Try again.";
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
      {/* Sidebar - Matching Login Background */}
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
            <Text style={styles.backButtonText}>← Back to Management</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content - Matching Login Form Style */}
      <View style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.title}>Create User</Text>
          <Text style={styles.subtitle}>Enter information for your employee</Text>

          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor="#94A3B8"
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
              placeholder="(555) 000-0000"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@company.com"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Access Role</Text>
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
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerText}>
              {loading ? "Creating Account..." : "Create User"}
            </Text>
          </TouchableOpacity>
        </View>
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
    width: '30%',
    backgroundColor: '#6579FF', 
    padding: 40,
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    top: 40,
    left: 40,
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sidebarContent: {
    marginTop: 0,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sidebarText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  /* Content Area */
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  formCard: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
 
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B', // Slate-800
    textAlign: 'left',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 15,
    color: '#64748B', // Slate-500
    marginBottom: 32,
  },

  row: {
    flexDirection: 'row',
    gap: 16,
  },

  inputWrapper: {
    marginBottom: 20,
    flex: 1,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#475569', // Slate-600
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
  },

  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  picker: {
    height: 52,
    backgroundColor: 'transparent',
    color: '#1E293B',
  },

  registerButton: {
    backgroundColor: '#6579FF', // Dark contrast button like login
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});