// LeaveEventButton.jsx - PERBAIKAN FINAL
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL;

export default function LeaveEventButton({ currentEvent, onLeaveSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const getUserIdFromToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return null;

            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            console.log('Decoded token:', decoded);
            return decoded.id || decoded.userId;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const handleLeaveEvent = async () => {
        Alert.alert(
            'Konfirmasi',
            'Apakah Anda yakin ingin keluar dari event ini?',
            [
                {
                    text: 'Batal',
                    style: 'cancel'
                },
                {
                    text: 'Keluar',
                    style: 'destructive',
                    onPress: async () => {
                        if (isLoading) return;

                        setIsLoading(true);
                        try {
                            const token = await AsyncStorage.getItem('token');
                            if (!token) {
                                Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
                                setIsLoading(false);
                                return;
                            }

                            const userId = await getUserIdFromToken();
                            if (!userId) {
                                Alert.alert('Error', 'User ID tidak ditemukan');
                                setIsLoading(false);
                                return;
                            }

                            console.log('Leaving event:', {
                                eventId: currentEvent.id,
                                userId: userId,
                                url: `${API_URL}/event-participants/${currentEvent.id}/${userId}/unjoin`
                            });

                            // ✅ GUNAKAN ENDPOINT YANG BENAR
                            const response = await fetch(
                                `${API_URL}/event-participants/${currentEvent.id}/${userId}/unjoin`,
                                {
                                    method: 'PATCH', // Sesuai dengan backend route
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            );

                            console.log('Response status:', response.status);

                            const result = await response.json();
                            console.log('Response data:', result);

                            if (response.ok && result.success) {
                                Alert.alert(
                                    'Berhasil', 
                                    'Anda telah keluar dari event',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => {
                                                if (onLeaveSuccess) {
                                                    onLeaveSuccess();
                                                }
                                            }
                                        }
                                    ]
                                );
                            } else {
                                Alert.alert(
                                    'Error',
                                    result.message || 'Gagal keluar dari event'
                                );
                            }
                        } catch (error) {
                            console.error('Leave Event Error:', error);
                            Alert.alert(
                                'Error',
                                'Gagal keluar dari event. Periksa koneksi internet Anda.'
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <TouchableOpacity 
            style={styles.leaveBox} 
            onPress={handleLeaveEvent}
            disabled={isLoading}
            activeOpacity={isLoading ? 1 : 0.7}
        >
            <Ionicons 
                name="log-out-outline" 
                size={20} 
                color={isLoading ? "#ccc" : "#FF3B30"} 
                style={styles.icon} 
            />
            <Text style={[styles.label, isLoading && styles.labelDisabled]}>
                {isLoading ? 'Keluar...' : 'Leave'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    leaveBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.6,
        borderColor: "#ccc",
        borderRadius: 15,
        marginHorizontal: 5,
        paddingVertical: 15,
        backgroundColor: "#fff5f5",
    },
    icon: {
        marginRight: 6,
        textShadowRadius: 3,
    },
    label: {
        fontSize: 14,
        color: "#FF3B30",
        fontWeight: "600",
    },
    labelDisabled: {
        color: "#ccc",
    },
});