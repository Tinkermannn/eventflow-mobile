import React, { useState, useEffect } from "react";
import {
  useColorScheme,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.API_URL;

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadSavedEmail();
  }, []);

  const loadSavedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (error) {
      // Gagal load email
    }
  };

  const saveEmailToStorage = async (emailToSave) => {
    try {
      await AsyncStorage.setItem("savedEmail", emailToSave);
    } catch (error) {
      // Gagal simpan email
    }
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "629225618455-h2nrti883f3bdilbt2qos6cto5t41srr.apps.googleusercontent.com",
    iosClientId: "629225618455-h2nrti883f3bdilbt2qos6cto5t41srr.apps.googleusercontent.com",
    androidClientId: "629225618455-h2nrti883f3bdilbt2qos6cto5t41srr.apps.googleusercontent.com",
    useProxy: true,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleLoginBackend(authentication.accessToken);
    }
  }, [response]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email dan password tidak boleh kosong");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Format email tidak valid");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auths/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.data?.token) {
          Alert.alert("Error", "Token tidak ditemukan dalam response");
          return;
        }

        await saveEmailToStorage(email.toLowerCase().trim());
        await AsyncStorage.setItem("token", data.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user || {}));

        setEmail("");
        setPassword("");

        navigation.replace("Home");
      } else {
        Alert.alert(
          "Login Gagal",
          data.message || "Email atau password salah"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginBackend = async (accessToken) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auths/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: accessToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.data?.token) {
          Alert.alert("Error", "Token tidak ditemukan dalam response");
          return;
        }

        await AsyncStorage.setItem("token", data.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user || {}));

        navigation.replace("Home");
      } else {
        Alert.alert("Login Gagal", data.message || "Gagal login dengan Google");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal login dengan Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await promptAsync();
  };

  const handleSSOLogin = async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: "eventflow" });
      const authUrl = `https://sso.ui.ac.id/cas/login?service=${encodeURIComponent(
        redirectUrl
      )}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === "success" && result.url) {
        const params = new URL(result.url).searchParams;
        const ticket = params.get("ticket");
        
        await handleSSOLoginBackend(ticket);
      }
    } catch (error) {
      console.error('SSO Login error:', error);
      Alert.alert('Error', 'Gagal membuka SSO login. Coba lagi.');
    }
  };

  const handleSSOLoginBackend = async (ticket) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auths/sso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket: ticket,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.data?.token) {
          Alert.alert("Error", "Token tidak ditemukan dalam response");
          return;
        }

        await AsyncStorage.setItem("token", data.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user || {}));

        navigation.replace("Home");
      } else {
        Alert.alert("Login Gagal", data.message || "Gagal login dengan SSO UI");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal login dengan SSO UI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image
          source={require("../../assets/single-logo.png")}
          style={styles.logo}
        />

        <Text
          style={[
            styles.title,
            { color: colorScheme === "dark" ? "#fff" : "#000" },
          ]}
        >
          Login
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          editable={!isLoading}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          editable={!isLoading}
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={[
            styles.socialButton,
            { backgroundColor: "#f4f4f4" },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleSSOLogin}
          disabled={isLoading}
        >
          <Text style={styles.socialText}>Login dengan SSO UI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={!request || isLoading}
          style={[styles.googleButton, (!request || isLoading) && styles.buttonDisabled]}
        >
          <Image
            source={{
              uri: "https://developers.google.com/identity/images/g-logo.png",
            }}
            style={styles.googleLogo}
          />
          <Text style={styles.googleText}>Login dengan Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate("Register")}
          disabled={isLoading}
        >
          <Text style={styles.registerText}>
            Don't have an account? Create account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
    minHeight: "100%",
  },
  logo: { 
    width: 150, 
    height: 150, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 20 
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
  buttonDisabled: {
    opacity: 0.5,
  },
  socialButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  socialText: { 
    fontSize: 16, 
    fontWeight: "500" 
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
  },
  googleLogo: { 
    width: 20, 
    height: 20, 
    marginRight: 10 
  },
  googleText: { 
    fontSize: 16, 
    fontWeight: "500" 
  },
  registerLink: { 
    paddingVertical: 10,
    marginTop: 10,
  },
  registerText: { 
    fontSize: 15, 
    color: "#1E38DD" 
  },
});