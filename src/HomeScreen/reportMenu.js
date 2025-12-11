import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const API_URL = process.env.API_URL;
const { height } = Dimensions.get("window");

export default function ReportMenu({ visible, onClose, eventId }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportText, setReportText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const categories = [
    {
      id: "SECURITY",
      label: "Keamanan",
      icon: "shield-outline",
      color: "#FF3B30",
    },
    {
      id: "CROWD",
      label: "Kerumunan",
      icon: "people-outline",
      color: "#FF9500",
    },
    {
      id: "FACILITY",
      label: "Fasilitas",
      icon: "business-outline",
      color: "#007AFF",
    },
    {
      id: "OTHER",
      label: "Lainnya",
      icon: "ellipsis-horizontal-outline",
      color: "#8E8E93",
    },
  ];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      getLocation();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Izin lokasi diperlukan untuk membuat laporan");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert("Error", "Gagal mendapatkan lokasi. Pastikan GPS aktif.");
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCategory(null);
      setReportText("");
      setLocation(null);
      onClose();
    });
  };

  const handleSubmit = async () => {
    // Validasi form
    if (!selectedCategory) {
      Alert.alert("Error", "Silakan pilih kategori laporan");
      return;
    }

    if (!reportText.trim()) {
      Alert.alert("Error", "Silakan isi deskripsi laporan");
      return;
    }

    if (reportText.length > 500) {
      Alert.alert("Error", "Deskripsi maksimal 500 karakter");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Lokasi belum tersedia. Pastikan GPS aktif");
      return;
    }

    if (!eventId) {
      Alert.alert("Error", "Event ID tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      let token = await AsyncStorage.getItem("token");
      if (!token) {
        token = await AsyncStorage.getItem("userToken");
      }
      if (!token) {
        token = await AsyncStorage.getItem("authToken");
      }

      if (!token) {
        Alert.alert("Error", "Silakan login terlebih dahulu");
        setIsLoading(false);
        return;
      }

      console.log("API_URL:", API_URL);
      console.log("Event ID:", eventId);
      console.log("Token exists:", !!token);

      const formData = new FormData();
      formData.append("category", selectedCategory);
      formData.append("description", reportText.trim());
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());

      const url = `${API_URL}/reports/${eventId}`;
      console.log("Request URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Jangan set Content-Type, biarkan FormData handle
        },
        body: formData,
      });

      console.log("Response status:", response.status);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log("Non-JSON response:", text);
        throw new Error("Server tidak mengembalikan response JSON");
      }

      console.log("Response data:", data);

      if (response.ok && data.success) {
        const categoryLabel = categories.find(
          (cat) => cat.id === selectedCategory
        )?.label;

        Alert.alert(
          "Laporan Terkirim",
          `Terima kasih! Laporan Anda tentang "${categoryLabel}" telah kami terima dan akan segera ditindaklanjuti.`,
          [
            {
              text: "OK",
              onPress: handleClose,
            },
          ]
        );
      } else {
        // Handle error response
        const errorMessage = data.message || data.error || "Terjadi kesalahan saat mengirim laporan";
        console.log("Error message:", errorMessage);
        Alert.alert("Gagal Mengirim Laporan", errorMessage);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      let errorMessage = "Tidak dapat terhubung ke server.";
      
      if (error.message.includes("Network request failed")) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message.includes("JSON")) {
        errorMessage = "Server mengembalikan response yang tidak valid.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View
                  style={styles.handleContainer}
                  {...panResponder.panHandlers}
                >
                  <View style={styles.handleBar} />
                </View>

                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Laporkan Masalah</Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kategori Laporan</Text>
                    <View style={styles.categoryGrid}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryCard,
                            selectedCategory === category.id && {
                              ...styles.categoryCardSelected,
                              borderColor: category.color,
                            },
                          ]}
                          onPress={() => setSelectedCategory(category.id)}
                          disabled={isLoading}
                        >
                          <Ionicons
                            name={category.icon}
                            size={32}
                            color={
                              selectedCategory === category.id
                                ? category.color
                                : "#8E8E93"
                            }
                          />
                          <Text
                            style={[
                              styles.categoryLabel,
                              selectedCategory === category.id && {
                                color: category.color,
                                fontWeight: "600",
                              },
                            ]}
                          >
                            {category.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Deskripsi Laporan</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Jelaskan masalah yang Anda temukan..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={6}
                      value={reportText}
                      onChangeText={setReportText}
                      textAlignVertical="top"
                      maxLength={500}
                      editable={!isLoading}
                    />
                    <Text style={styles.characterCount}>
                      {reportText.length}/500 karakter
                    </Text>
                  </View>

                  {location && (
                    <View style={styles.locationInfo}>
                      <Ionicons name="location" size={16} color="#007AFF" />
                      <Text style={styles.locationText}>
                        Lokasi terdeteksi ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!selectedCategory ||
                        !reportText.trim() ||
                        !location ||
                        isLoading) &&
                        styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={
                      !selectedCategory ||
                      !reportText.trim() ||
                      !location ||
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>
                          Kirim Laporan
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 20,
    maxHeight: height * 0.9,
  },
  handleContainer: { paddingVertical: 12, alignItems: "center" },
  handleBar: { width: 40, height: 4, backgroundColor: "#DDD", borderRadius: 2 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#333" },
  scrollView: { paddingHorizontal: 20 },
  section: { marginTop: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    aspectRatio: 1.5,
    backgroundColor: "#F8F8F8",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  categoryCardSelected: { backgroundColor: "#F0F8FF", borderWidth: 2 },
  categoryLabel: { fontSize: 14, color: "#8E8E93", fontWeight: "500" },
  textInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: "#333",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    marginTop: 15,
  },
  locationText: { fontSize: 13, color: "#007AFF", fontWeight: "500", flex: 1 },
  submitButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 10,
  },
  submitButtonDisabled: { backgroundColor: "#C7C7CC" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});