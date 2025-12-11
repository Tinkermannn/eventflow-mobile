import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL;

export default function JoinEventMenu({ visible, onClose, onEventJoined }) {
    const [eventCode, setEventCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fungsi untuk mencari event berdasarkan joinCode
    const findEventByJoinCode = async (joinCode) => {
        try {
            const token = await AsyncStorage.getItem('token'); 
            if (!token) return null;

            // Get all events dan cari yang cocok dengan joinCode
            const response = await fetch(`${API_URL}/events`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) return null;

            const result = await response.json();
            if (result.success && result.data) {
                // Cari event dengan joinCode yang sesuai
                const event = result.data.find(e => e.joinCode === joinCode);
                return event || null;
            }
            return null;
        } catch (error) {
            console.error('Find Event Error:', error);
            return null;
        }
    };

    // Fungsi untuk join event ke API
    const joinEventAPI = async (joinCode) => {
        try {
            setLoading(true);
            
            // Ambil token dari AsyncStorage
            const token = await AsyncStorage.getItem('token'); // ✅ Ganti dari 'authToken' ke 'token'
            if (!token) {
                Alert.alert('Error', 'Anda belum login. Silakan login terlebih dahulu.');
                return false;
            }

            // Cari event berdasarkan joinCode terlebih dahulu
            const event = await findEventByJoinCode(joinCode);
            if (!event) {
                Alert.alert('Event Tidak Ditemukan', 'Kode event yang Anda masukkan tidak valid.');
                return false;
            }

            const response = await fetch(`${API_URL}/events/${event.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ joinCode }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle berbagai error responses
                if (response.status === 400) {
                    if (result.message?.includes('sudah penuh')) {
                        Alert.alert('Event Penuh', 'Maaf, event ini sudah mencapai kapasitas maksimal.');
                    } else if (result.message?.includes('Invalid join code')) {
                        Alert.alert('Kode Salah', 'Kode event yang Anda masukkan tidak valid.');
                    } else {
                        Alert.alert('Error', result.message || 'Gagal bergabung dengan event');
                    }
                } else if (response.status === 401) {
                    Alert.alert('Unauthorized', 'Sesi Anda telah berakhir. Silakan login kembali.');
                } else if (response.status === 404) {
                    Alert.alert('Event Tidak Ditemukan', 'Event dengan kode tersebut tidak ditemukan.');
                } else {
                    Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
                }
                return false;
            }

            // Success
            if (result.success && result.data) {
                Alert.alert(
                    'Berhasil!',
                    `Anda telah bergabung dengan event: ${result.data.name}`,
                    [{ 
                        text: 'OK', 
                        onPress: () => {
                            // Callback untuk refresh data event di parent component
                            if (onEventJoined) {
                                onEventJoined(result.data);
                            }
                            resetAndClose();
                        }
                    }]
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error('Join Event Error:', error);
            Alert.alert('Error', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleJoinWithCode = async () => {
        if (!eventCode.trim()) {
            Alert.alert('Error', 'Masukkan kode event terlebih dahulu');
            return;
        }

        await joinEventAPI(eventCode.trim());
    };

    const openScanner = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert('Permission Denied', 'Kami memerlukan izin kamera untuk scan QR code');
                return;
            }
        }
        setScanned(false);
        setShowScanner(true);
    };

    const handleBarCodeScanned = ({ data }) => {
        if (scanned) return;
        setScanned(true);
        setShowScanner(false);
        
        const joinCode = data.trim();

        Alert.alert(
            'QR Code Terdeteksi!',
            `Kode Event: ${joinCode}`,
            [
                { 
                    text: 'Batal', 
                    style: 'cancel',
                    onPress: () => setScanned(false)
                },
                {
                    text: 'Join',
                    onPress: async () => {
                        await joinEventAPI(joinCode);
                        setScanned(false);
                    }
                }
            ]
        );
    };

    const resetAndClose = () => {
        setEventCode('');
        setScanned(false);
        onClose();
    };

    if (showScanner) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.scannerContainer}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    />
                    <View style={styles.scannerOverlay}>
                        <View style={styles.scannerHeader}>
                            <TouchableOpacity 
                                style={styles.closeScanner}
                                onPress={() => {
                                    setShowScanner(false);
                                    setScanned(false);
                                }}
                            >
                                <Ionicons name="close" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.scannerFrame} />
                        <Text style={styles.scannerText}>Arahkan kamera ke QR Code</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={resetAndClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Join Event</Text>
                        <TouchableOpacity onPress={resetAndClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Kode Event</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan kode event"
                            value={eventCode}
                            onChangeText={setEventCode}
                            autoCapitalize="characters"
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[styles.button, styles.joinButton, loading && styles.buttonDisabled]}
                            onPress={handleJoinWithCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="enter-outline" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Join dengan Kode</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.scanButton, loading && styles.buttonDisabled]}
                            onPress={openScanner}
                            disabled={loading}
                        >
                            <Ionicons name="qr-code-outline" size={20} color="#6366f1" />
                            <Text style={[styles.buttonText, { color: '#6366f1' }]}>
                                Scan QR Code
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        gap: 8,
    },
    joinButton: {
        backgroundColor: '#6366f1',
    },
    scanButton: {
        backgroundColor: '#f0f0ff',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#999',
        fontSize: 14,
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    scannerOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scannerHeader: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    closeScanner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scannerFrame: {
        position: 'absolute',
        top: '35%',
        left: '15%',
        right: '15%',
        height: 250,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
    },
    scannerText: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});