import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [store, setStore] = useState("Store 1");
  const [showStores, setShowStores] = useState(false);

  const stores = ["Store 1", "Store 2", "Store 3"];

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleRegister() {
    if (!firstName.trim() || !lastName.trim()) {
      return Alert.alert("Validation", "Please enter first and last name.");
    }
    if (!/^[0-9()+\-\s]{7,}$/.test(phone)) {
      return Alert.alert("Validation", "Please enter a valid phone number.");
    }
    if (!validateEmail(email)) {
      return Alert.alert("Validation", "Please enter a valid email address.");
    }
    if (password.length < 6) {
      return Alert.alert("Validation", "Password must be at least 6 characters.");
    }

    // Simulate success
    Alert.alert("Registered", "User created successfully.", [
      { text: "OK", onPress: () => router.push("/login") },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <Text style={styles.brand}>SHIFT FLOW</Text>
        <View style={styles.leftContent}>
          <Text style={styles.leftTitle}>Manage Staff</Text>
          <Text style={styles.leftDesc}>
            See all staff in one place with quick access to their roles, details, and shift information.
          </Text>

          <Pressable style={styles.manageButton} onPress={() => router.back ? router.back() : router.push('/') }>
            <Text style={styles.manageButtonText}>←  Management</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.rightPane}>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Create User</Text>
            <Text style={styles.subtitle}>Enter information for your employee</Text>

            <View style={styles.row}>
<View style={[styles.field, styles.halfField, { marginRight: 12 }]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  placeholder=""
                />
              </View>

              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  placeholder=""
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Your Store</Text>
              <Pressable
                onPress={() => setShowStores(!showStores)}
                style={[styles.input, styles.storeSelect]}
              >
                <Text>{store}</Text>
              </Pressable>
              {showStores ? (
                <View style={styles.storeList}>
                  {stores.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => {
                        setStore(s);
                        setShowStores(false);
                      }}
                      style={({ pressed }) => [
                        styles.storeOption,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </Pressable>

            <Pressable
              style={{ marginTop: 16, alignSelf: "center" }}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.linkText}>Back to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f7f7f9',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  leftPane: {
    width: '36%',
    backgroundColor: '#6579FF',
    paddingHorizontal: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brand: {
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 24,
  },
  leftContent: {
    marginTop: 0,
  },
  leftTitle: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 18,
  },
  leftDesc: {
    color: 'rgba(255,255,255,0.9)',
    width: '70%',
    marginBottom: 32,
    lineHeight: 22,
  },
  manageButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  rightPane: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 60,
  },
  card: {
    width: 520,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 48,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#8b8b8b",
    marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  field: {
    marginBottom: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e6e6ee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  storeSelect: {
    justifyContent: "center",
  },
  storeList: {
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 6,
    borderRadius: 6,
    overflow: "hidden",
  },
  storeOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  button: {
    width: 200,
    marginTop: 24,
    marginBottom: 6,
    alignSelf: "center",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#6579FF",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  linkText: {
    color: "#6579FF",
    textDecorationLine: "underline",
  },
});
