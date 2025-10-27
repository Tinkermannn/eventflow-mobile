import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";


export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "dummy-client", // kalau SSO UI perlu client id
      redirectUri: AuthSession.makeRedirectUri({ scheme: "myapp" }),
      responseType: "token", // atau "code" sesuai kebutuhan SSO UI
    },
    
  );

  // === Tangani response ===
  useEffect(() => {
    if (response?.type === "success") {
      const code = response.params.code;
      console.log("Authorization Code:", code);
    }
  }, [response]);

  const handleRegister = () => {
    console.log("Register:", { name, email, password });
    navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/single-logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Fullname"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: "#f4f4f4" }]}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={styles.socialText}>Login dengan SSO UI</Text>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.login}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center", 
    alignItems: "center",  
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  
  logo: { width: 150, height: 150, marginBottom: 10 },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1E38DD",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  socialButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  socialText: { fontSize: 16, fontWeight: "500" },
  login: {
    paddingVertical: 10,
  }
});
