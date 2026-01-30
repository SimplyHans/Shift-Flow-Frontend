import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [rememberMe, setRememberMe] = useState(false);

  
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Fill in your credentials.</Text>

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
        <View style={styles.rememberRow}>
  <Pressable
    onPress={() => setRememberMe(!rememberMe)}
    style={({ pressed }) => [
      styles.fakeCheckbox,
      rememberMe && styles.fakeCheckboxChecked,
      pressed && { opacity: 0.8 },
    ]}
  >
    {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
  </Pressable>

  <Pressable onPress={() => setRememberMe(!rememberMe)}>
    <Text style={styles.rememberText}>Save for future login</Text>
  </Pressable>
</View>


        
        <Pressable
    
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </Pressable>
      </View>
    </View>
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
    height:695,
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
    marginBottom: 6,
    marginTop: 80
  },
  subtitle: {
    textAlign:"center",
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 80,
    marginTop:15
  },
  field: {
    paddingHorizontal:50,
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginHorizontal:20,
    marginTop:10
  },
  input: {
    width:450,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 50,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginHorizontal:20
  },
button: {
  width: 350,
  marginTop: 40,
  alignSelf: "center",   // 👈 THIS centers it
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  backgroundColor: "#6579FF",
},

  buttonPressed: {
    opacity: 0.85,
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
