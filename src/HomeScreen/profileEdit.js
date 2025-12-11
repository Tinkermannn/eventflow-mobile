import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ProfileEdit({ visible, onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [originalData, setOriginalData] = useState({});

    const API_URL = process.env.API_URL;

    // Fetch profile data saat modal dibuka
    useEffect(() => {
        if (visible) {
            fetchProfileData();
        }
    }, [visible]);

    // Fetch data dari API
    const fetchProfileData = async () => {
        try {
            setFetching(true);
            
            // Ambil token dari AsyncStorage
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            console.log('Fetching profile...');
            const response = await axios.get(`${API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.status === 200) {
                const userData = response.data.data;
                console.log('Profile data fetched:', userData);
                setOriginalData(userData);
                setName('');
                setEmail('');
                setPhoneNumber('');
            }
        } catch (error) {
            console.error('Error fetching profile:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Gagal memuat data profil');
        } finally {
            setFetching(false);
        }
    };

    // Validasi input
    const validateInput = () => {
        // Jika semua kosong, tidak ada yang diubah
        if (!name.trim() && !email.trim() && !phoneNumber.trim()) {
            Alert.alert('Validasi', 'Minimal ada satu field yang harus diubah');
            return false;
        }

        // Validasi email jika diisi
        if (email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Alert.alert('Validasi', 'Format email tidak valid');
                return false;
            }
        }

        return true;
    };

    // Simpan profile ke API
    const handleSave = async () => {
        if (!validateInput()) {
            return;
        }

        try {
            setLoading(true);

            // Ambil token dari AsyncStorage
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const payload = {};
            
            // Hanya kirim field yang diubah
            if (name.trim()) {
                payload.name = name.trim();
            }

            if (phoneNumber.trim()) {
                payload.phoneNumber = phoneNumber.trim();
            }

            console.log('Saving profile with payload:', payload);
            const response = await axios.patch(
                `${API_URL}/users/me`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                console.log('Profile updated successfully');
                Alert.alert('Berhasil', 'Profile berhasil diperbarui', [
                    { text: 'OK', onPress: onClose }
                ]);
            }
        } catch (error) {
            console.error('Error saving profile:', error.response?.data || error.message);
            console.log('Error status:', error.response?.status);
            console.log('Error config:', error.config);
            
            if (error.response) {
                Alert.alert(
                    'Error',
                    error.response.data?.message || `Gagal menyimpan profil (${error.response.status})`
                );
            } else if (error.request) {
                Alert.alert('Error', 'Tidak ada respons dari server');
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} disabled={loading}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity 
                        onPress={handleSave} 
                        disabled={loading || fetching}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Text style={styles.saveButton}>Simpan</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Loading State */}
                {fetching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Memuat data profil...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Lengkap</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder={originalData.name || 'Masukkan nama lengkap'}
                                editable={!loading}
                            />
                        </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.input}>
                                    {originalData.email}
                                </Text>
                            </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>No. Telepon</Text>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder={originalData.phoneNumber || 'Masukkan nomor telepon'}
                                keyboardType="phone-pad"
                                editable={!loading}
                            />
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
});