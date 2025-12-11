import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SettingsMenu from "./settingsMenu";
import ReportMenu from "./reportMenu";
import NotifMenu from "./notifMenu";
import ProfileMenu from "./profileMenu";
import JoinEventMenu from "./joinEventMenu";
import LeaveEventButton from "./leaveButton";

const API_URL = process.env.API_URL;
const LAST_JOINED_EVENT_KEY = "lastJoinedEvent";

// KONFIGURASI INTERVAL
const GET_LOCATION_INTERVAL = 5000; // Ambil lokasi setiap 5 detik
const SEND_LOCATION_INTERVAL = 10000; // Kirim ke server setiap 10 detik

export default function HomeScreen() {
  const mapRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const locationIntervalRef = useRef(null);
  
  // Ref untuk melacak kapan terakhir kali kirim data ke server
  const lastSentTimestampRef = useRef(0);

  const [userLocation, setUserLocation] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setshowReport] = useState(false);
  const [showNotification, setshowNotification] = useState(false);
  const [showProfile, setshowProfile] = useState(false);
  const [showJoinEvent, setShowJoinEvent] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  const [virtualAreas, setVirtualAreas] = useState([]);
  const [importantSpots, setImportantSpots] = useState([]);

  const getDestination = () => {
    if (currentEvent) {
      return {
        latitude: currentEvent.latitude,
        longitude: currentEvent.longitude,
        name: currentEvent.locationName,
      };
    }
    return {
      latitude: -6.1754,
      longitude: 106.8272,
      name: "Belum ada event yang diikuti",
    };
  };

  const destination = getDestination();

  // --- FUNGSI API & STORAGE ---

  const fetchVirtualAreas = async (eventId) => {
    if (!eventId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      
      // Cache busting (fix sebelumnya)
      const timestamp = new Date().getTime(); 
      const url = `${API_URL}/virtual-area/${eventId}/get-all?t=${timestamp}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            // Uncomment log ini jika ingin debugging update area
            // console.log(`[Area Update] Diterima: ${result.data.length} area.`);
            setVirtualAreas(result.data);
        }
      }
    } catch (error) {
      console.log("Virtual area fetch skipped:", error.message);
    }
  };

  const hexToRGBA = (hex, alpha = 0.3) => {
    let r = 0, g = 0, b = 0;
    if (hex && hex.length === 4) {
      r = "0x" + hex[1] + hex[1];
      g = "0x" + hex[2] + hex[2];
      b = "0x" + hex[3] + hex[3];
    } else if (hex && hex.length === 7) {
      r = "0x" + hex[1] + hex[2];
      g = "0x" + hex[3] + hex[4];
      b = "0x" + hex[5] + hex[6];
    }
    return `rgba(${+r},${+g},${+b},${alpha})`;
  };

  const saveEventToStorage = async (event) => {
    try {
      if (event && event.id) {
        const eventData = {
          ...event,
          timestamp: new Date().getTime(),
        };
        await AsyncStorage.setItem(
          LAST_JOINED_EVENT_KEY,
          JSON.stringify(eventData)
        );
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const getEventFromStorage = async () => {
    try {
      const storedEvent = await AsyncStorage.getItem(LAST_JOINED_EVENT_KEY);
      if (storedEvent) {
        const parsed = JSON.parse(storedEvent);
        const now = new Date().getTime();
        if (now - parsed.timestamp > 30 * 24 * 60 * 60 * 1000) {
          await clearEventFromStorage();
          return null;
        }
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const clearEventFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(LAST_JOINED_EVENT_KEY);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserIdFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded.userId;
    } catch (error) {
      return null;
    }
  };

  const sendLocationToServer = async (latitude, longitude, eventId) => {
    try {
      if (!latitude || !longitude || !eventId) return;

      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/locations/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      if (!response.ok) {
        // Handle error silent
      } else {
        // console.log("Location sent successfully"); // Debug
      }
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  const fetchParticipantsLocations = async (eventId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !eventId) return;

      const response = await fetch(`${API_URL}/locations/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setParticipants(result.data);
        }
      }
    } catch (error) {
       // Silent
    }
  };

  // --- CORE TRACKING LOGIC ---
  const startLocationTracking = async (eventId) => {
    if (!eventId || isTrackingLocation) return;
    
    try {
      setIsTrackingLocation(true);
      console.log("Starting tracking for event:", eventId);

      // --- 1. Eksekusi Pertama Kali (Immediate) ---
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Gunakan High untuk hasil lebih akurat
        timeInterval: 1000, 
      });

      if (loc) {
        // Update UI (Get)
        setUserLocation(loc.coords);
        
        // Kirim ke Server (Send) - Langsung kirim saat tracking mulai
        await sendLocationToServer(loc.coords.latitude, loc.coords.longitude, eventId);
        lastSentTimestampRef.current = Date.now();
      }
      
      // Fetch data pendukung
      await fetchParticipantsLocations(eventId);
      await fetchVirtualAreas(eventId); 

      // --- 2. Setup Interval (Berjalan Setiap 5 Detik) ---
      locationIntervalRef.current = setInterval(async () => {
        try {
          const now = Date.now();

          // A. GET LOKASI (Setiap 5 Detik - Sesuai Interval)
          // Mengambil lokasi real-time untuk update peta user sendiri
          const currentLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, 
            maxAge: 3000 // Jangan terima data yang lebih tua dari 3 detik
          });
          
          if (currentLoc) {
            setUserLocation(currentLoc.coords);
            // console.log("Location updated locally (UI)");

            // B. SEND LOKASI & FETCH DATA (Setiap 10 Detik)
            // Cek apakah sudah waktunya mengirim ke server?
            if (now - lastSentTimestampRef.current >= SEND_LOCATION_INTERVAL) {
                // console.log("Sending location to server & fetching updates...");
                
                await sendLocationToServer(
                  currentLoc.coords.latitude,
                  currentLoc.coords.longitude,
                  eventId
                );
                
                // Fetch update teman & area
                await fetchParticipantsLocations(eventId);
                await fetchVirtualAreas(eventId);

                // Update timestamp terakhir kirim
                lastSentTimestampRef.current = now;
            }
          }

        } catch (error) {
          console.error("Error in tracking interval:", error);
        }
      }, GET_LOCATION_INTERVAL); // Interval berjalan setiap 5000ms

    } catch (error) {
      console.error("Error starting location tracking:", error);
      setIsTrackingLocation(false);
    }
  };

  const stopLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    setIsTrackingLocation(false);
  };

  const checkIfUserJoinedEvent = async (eventId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;
      const userId = await getUserIdFromToken();
      if (!userId) return null;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const [participantRes, eventRes] = await Promise.all([
          fetch(`${API_URL}/event-participants/${eventId}/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }),
          fetch(`${API_URL}/events/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }),
        ]);
        clearTimeout(timeoutId);

        if (participantRes.ok) {
          const participantResult = await participantRes.json();
          if (participantResult.success && participantResult.data) {
            if (eventRes.ok) {
              const eventResult = await eventRes.json();
              if (eventResult.success && eventResult.data) {
                return eventResult.data;
              }
            }
            return participantResult.data;
          }
        }
        return null;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") return null;
        throw error;
      }
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          setIsJoined(false);
          return;
        }

        const permissionPromise = Location.requestForegroundPermissionsAsync();
        const storedEvent = await getEventFromStorage();

        if (storedEvent) {
          setCurrentEvent(storedEvent);
          setIsJoined(true);
          setIsLoading(false);
          fetchVirtualAreas(storedEvent.id);
        } else {
          setIsLoading(false);
        }

        if (storedEvent) {
          checkIfUserJoinedEvent(storedEvent.id)
            .then((eventDetail) => {
              if (eventDetail) {
                setCurrentEvent(eventDetail);
                saveEventToStorage(eventDetail);
                startLocationTracking(eventDetail.id);
              } else {
                clearEventFromStorage();
                setCurrentEvent(null);
                setIsJoined(false);
                stopLocationTracking();
                setVirtualAreas([]);
              }
            })
            .catch((error) => {
              console.error("Verification error:", error);
              stopLocationTracking();
            });
        } else {
          setIsJoined(false);
          stopLocationTracking();
        }

        const { status } = await permissionPromise;
        if (status === "granted") {
          try {
            await Location.enableNetworkProviderAsync();
          } catch (locError) {
            console.error(locError);
          }
        }
      } catch (error) {
        console.error("Init error:", error);
        setIsLoading(false);
      }
    })();

    return () => {
      stopLocationTracking();
    };
  }, []);

  useEffect(() => {
    const fetchImportantSpots = async () => {
      try {
        const eventId = currentEvent?.id;
        if (eventId) {
          const response = await fetch(`${API_URL}/important-spots/event/${eventId}`);
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setImportantSpots(result.data);
          } else {
            console.error("Failed to fetch important spots: Invalid response format");
          }
        }
      } catch (error) {
        console.error("Error fetching important spots:", error);
      }
    };

    fetchImportantSpots();
  }, [currentEvent]);

  const handleEventJoined = async (eventData) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/events/${eventData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCurrentEvent(result.data);
          await saveEventToStorage(result.data);
          setIsJoined(true);
          await startLocationTracking(result.data.id);
          return;
        }
      }

      // Fallback
      setCurrentEvent(eventData);
      await saveEventToStorage(eventData);
      setIsJoined(true);
      await startLocationTracking(eventData.id);
    } catch (error) {
      console.error(error);
      setCurrentEvent(eventData);
      await saveEventToStorage(eventData);
      setIsJoined(true);
      await startLocationTracking(eventData.id);
    }
  };

  const handleLeaveSuccess = async () => {
    setIsJoined(false);
    setCurrentEvent(null);
    setParticipants([]);
    setVirtualAreas([]);
    await clearEventFromStorage();
    stopLocationTracking();
  };

  const goToUserLocation = async () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      1000
    );
  };

  const getRoute = async () => {
    if (!userLocation) {
      Alert.alert("Error", "Lokasi pengguna belum tersedia");
      return;
    }
    try {
      const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        const points = data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRouteCoordinates(points);
        setShowRoute(true);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              destination,
            ],
            {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true,
            }
          );
        }
      }
    } catch (error) {
      setRouteCoordinates([
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        destination,
      ]);
      setShowRoute(true);
      Alert.alert("Info", "Menggunakan rute garis lurus.");
    }
  };

  const toggleRoute = () => {
    if (showRoute) {
      setShowRoute(false);
      setRouteCoordinates([]);
    } else {
      getRoute();
    }
  };

  const openInGoogleMaps = () => {
    if (!userLocation) {
      Alert.alert("Error", "Lokasi pengguna belum tersedia");
      return;
    }
    
    const dest = `${destination.latitude},${destination.longitude}`;
    
    // URL untuk langsung memulai navigasi dengan voice guide
    const url = Platform.select({
      ios: `comgooglemaps://?daddr=${dest}&directionsmode=driving&navigate=yes`,
      android: `google.navigation:q=${dest}&mode=d`
    });
    
    // Fallback ke web jika app tidak terinstal
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Jika Google Maps app tidak terinstal, buka di browser
        Linking.openURL(webUrl);
      }
    }).catch(() => {
      Alert.alert("Error", "Tidak dapat membuka Google Maps");
    });
  };

  // Fungsi untuk mendapatkan konfigurasi icon dan warna berdasarkan tipe spot
  const getSpotIconConfig = (type) => {
    switch (type) {
      case "food":
        return { name: "restaurant", color: "#FF6B6B" };
      case "medical":
        return { name: "medical", color: "#4ECDC4" };
      case "info":
        return { name: "information-circle", color: "#4A90E2" };
      case "parking":
        return { name: "car", color: "#FFA07A" };
      case "toilet":
        return { name: "person", color: "#9B59B6" };
      case "stage":
        return { name: "musical-notes", color: "#E74C3C" };
      case "entrance":
        return { name: "enter", color: "#2ECC71" };
      case "exit":
        return { name: "exit", color: "#E67E22" };
      case "merchandise":
        return { name: "cart", color: "#3498DB" };
      case "security":
        return { name: "shield-checkmark", color: "#34495E" };
      default:
        return { name: "location", color: "#95A5A6" };
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "gray" }}>Memuat event...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Render Virtual Areas */}
        {isJoined &&
          virtualAreas.length > 0 &&
          virtualAreas.map((area, index) => {
            if (
              !area.area ||
              !area.area.coordinates ||
              area.area.coordinates.length === 0
            )
              return null;

            const coords = area.area.coordinates[0].map((coord) => ({
              latitude: coord[1],
              longitude: coord[0],
            }));

            return (
              <Polygon
                key={area.id || `area-${index}-${Date.now()}`}
                coordinates={coords}
                strokeColor={area.color}
                fillColor={hexToRGBA(area.color, 0.25)}
                strokeWidth={2}
                tappable={true}
                onPress={() => Alert.alert("Virtual Area", area.name)}
              />
            );
          })}

        <Marker
          coordinate={destination}
          title={destination.name}
          description="Lokasi Event"
          pinColor="red"
        />

        {isJoined &&
          showParticipants &&
          participants &&
          participants.length > 0 &&
          participants.map((participant, index) => {
            const uniqueKey = participant.id
              ? `${participant.id}-${index}`
              : `participant-${index}`;
            
            if (!participant.latitude || !participant.longitude) return null;

            return (
              <Marker
                key={uniqueKey}
                coordinate={{
                  latitude: parseFloat(participant.latitude),
                  longitude: parseFloat(participant.longitude),
                }}
                title={participant.name || `Peserta ${index + 1}`}
                description="Peserta Event"
              >
                <View
                  style={[
                    styles.participantMarker,
                    { backgroundColor: participant.color || "#FF6B6B" },
                  ]}
                >
                  <View style={styles.markerInner} />
                </View>
              </Marker>
            );
          })}

        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}

        {/* Render Important Spots dengan Ionicons */}
        {isJoined &&
          importantSpots.length > 0 &&
          importantSpots.map((spot, index) => {
            const iconConfig = getSpotIconConfig(spot.type);
            return (
              <Marker
                key={`spot-${spot.id || index}`}
                coordinate={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
                title={spot.name}
                description={spot.description}
              >
                <Ionicons
                  name={iconConfig.name}
                  size={24}
                  color={iconConfig.color}
                />
              </Marker>
            );
          })}
      </MapView>

      {isJoined && (
        <View style={styles.event}>
          <Text style={styles.title}>
            {currentEvent?.name || "Tech Conference"}
          </Text>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="gray" />
            <Text style={styles.text}>
              {currentEvent?.locationName || "Jakarta Convention Center"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color="gray" />
            <Text style={styles.text}>
              {currentEvent?.startTime
                ? new Date(currentEvent.startTime).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "28 Oktober 2025"}
            </Text>
            <View style={{ width: 20 }} />
            <Ionicons name="people-outline" size={20} color="gray" />
            <Text style={styles.text}>
              {currentEvent?.totalParticipants || 110} peserta
            </Text>
          </View>

          {isJoined && (
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.joinedText}>Sudah bergabung</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.topBubble}>
        <TouchableOpacity onPress={() => setshowNotification(true)}>
          <Ionicons
            name="notifications-outline"
            size={25}
            color="black"
            style={styles.bubble}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setshowProfile(true)}>
          <Ionicons
            name="person-outline"
            size={25}
            color="black"
            style={styles.bubble}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sideBubble}>
        {isJoined && (
          <TouchableOpacity
            onPress={() => setShowParticipants(!showParticipants)}
          >
            <Ionicons
              name="people"
              size={25}
              color={showParticipants ? "#007AFF" : "black"}
              style={[styles.bubble, showParticipants && styles.bubbleActive]}
            />
          </TouchableOpacity>
        )}
        {isJoined && (
          <TouchableOpacity onPress={toggleRoute}>
            <Ionicons
              name="trail-sign-outline"
              size={25}
              color={showRoute ? "#007AFF" : "black"}
              style={[styles.bubble, showRoute && styles.bubbleActive]}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={goToUserLocation}>
          <Ionicons
            name="navigate-outline"
            size={25}
            color="black"
            style={styles.bubble}
          />
        </TouchableOpacity>
        {isJoined && (
          <TouchableOpacity onPress={openInGoogleMaps}>
            <Ionicons
              name="expand-outline"
              size={25}
              color="black"
              style={styles.bubble}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomBar}>
        {!isJoined ? (
          <TouchableOpacity
            style={styles.box}
            onPress={() => setShowJoinEvent(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="black"
              style={styles.icon}
            />
            <Text style={styles.label}>Join</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.box, styles.reportBox]}
            onPress={() => setshowReport(true)}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color="black"
              style={styles.icon}
            />
            <Text style={styles.label}>Report</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.box}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.label}>Settings</Text>
        </TouchableOpacity>

        {isJoined && (
          <LeaveEventButton
            currentEvent={currentEvent}
            onLeaveSuccess={handleLeaveSuccess}
          />
        )}
      </View>

      <SettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <ReportMenu
        visible={showReport}
        onClose={() => setshowReport(false)}
        eventId={currentEvent?.id}
      />
      <NotifMenu
        visible={showNotification}
        onClose={() => setshowNotification(false)}
        eventId={isJoined ? currentEvent?.id : null}
      />
      <ProfileMenu
        visible={showProfile}
        onClose={() => setshowProfile(false)}
      />
      <JoinEventMenu
        visible={showJoinEvent}
        onClose={() => setShowJoinEvent(false)}
        onEventJoined={handleEventJoined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  event: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 100,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#000" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  text: { color: "gray", fontSize: 14, marginLeft: 8 },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  joinedText: {
    marginLeft: 8,
    color: "#34C759",
    fontWeight: "600",
    fontSize: 14,
  },
  topBubble: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    top: 40,
  },
  sideBubble: {
    right: 20,
    marginVertical: "auto",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
  },
  bubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 100,
    padding: 10,
  },
  bubbleActive: { backgroundColor: "rgba(0, 122, 255, 0.2)" },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowRadius: 4,
    elevation: 5,
  },
  box: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.6,
    borderColor: "#ccc",
    borderRadius: 15,
    marginHorizontal: 5,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  reportBox: { backgroundColor: "#f0f0f0" },
  icon: { marginRight: 6 },
  label: { fontSize: 14, color: "black", fontWeight: "600" },
  participantMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
});