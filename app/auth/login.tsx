import api from "@/app/config/axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<{ token?: string; user?: unknown }>(
        "/auth/login",
        { email: email.trim(), password }
      );

      // Store token for authenticated requests
      if (data.token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);
        // TODO: persist token with expo-secure-store when rememberMe is true
      }

      

      router.replace("/(tabs)/myschedule");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message ?? "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    localStorage.removeItem("token")

  },[])

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Fill in your credentials.</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            secureTextEntry
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        <View style={styles.rememberRow}>
          <Pressable
            onPress={() => !loading && setRememberMe(!rememberMe)}
            style={({ pressed }) => [
              styles.fakeCheckbox,
              rememberMe && styles.fakeCheckboxChecked,
              pressed && { opacity: 0.8 },
            ]}
          >
            {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
          </Pressable>
          <Pressable onPress={() => !loading && setRememberMe(!rememberMe)}>
            <Text style={styles.rememberText}>Save for future login</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#6579FF",
  },
  card: {
    height: 695,
    width: 590,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    textAlign: "center",
    fontSize: 45,
    fontWeight: "700",
    marginTop: 80,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 80,
    marginTop: 15,
  },
  errorBox: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 50,
    marginBottom: 12,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
  field: {
    paddingHorizontal: 50,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginHorizontal: 20,
    marginTop: 10,
  },
  input: {
    width: 450,
    borderWidth: 1,
    borderColor: "#9FA2BB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#FAFBFF",
    marginHorizontal: 20,
  },
  button: {
    width: 230,
    marginTop: 40,
    alignSelf: "center",
    borderRadius: 25,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#6579FF",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  rememberText: {
    fontSize: 14,
    opacity: 0.8,
  },
  fakeCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fakeCheckboxChecked: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 12,
  },
});
