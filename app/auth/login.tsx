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

      if (data.token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        if (Platform.OS === 'web') {
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("token", data.token);
        }
      }

      router.replace("/(tabs)/myschedule");
    } catch (err: any) {
      const message = err.response?.data?.message ?? "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') localStorage.removeItem("token");
  }, []);

  return (
    <View style={styles.screen}>
      {/* Brand Logo Top Left */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>SHIFT FLOW</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.headerArea}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Enter your details to access your account.</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor="#94A3B8"
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
                placeholderTextColor="#94A3B8"
                editable={!loading}
              />
            </View>

            <View style={styles.optionsRow}>
              <Pressable
                onPress={() => !loading && setRememberMe(!rememberMe)}
                style={styles.rememberMeContainer}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Keep me logged in</Text>
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
                <ActivityIndicator color="#6579FF" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>
          </View>
        </View>

        <Text style={styles.footerText}>
          Don't have an account? <Text style={styles.footerLink}>Contact Admin</Text>
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#6579FF",
  },
  brandContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 40,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  headerArea: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  form: {
    width: "100%",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#6579FF",
    borderColor: "#6579FF",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
  },
  rememberText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#6579FF", // Dark contrast button for professional look
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 30,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerLink: {
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});