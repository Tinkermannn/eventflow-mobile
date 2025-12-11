import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions,
    TouchableWithoutFeedback, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import ProfileEdit from './profileEdit';
import EventList from './eventList';
import Help from './help';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.8;

const API_URL = process.env.API_URL;
const DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public';

export default function ProfileMenu({ visible, onClose }) {
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(width)).current;
    const [activeScreen, setActiveScreen] = useState(null);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [avatarUri, setAvatarUri] = useState(DEFAULT_AVATAR);
    const [isUploading, setIsUploading] = useState(false);
    const [userData, setUserData] = useState({
        name: 'Memuat...',
        email: '...',
    });

    useEffect(() => {
        if (visible) {
            loadUserData();
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        }
    }, [visible]);

    const loadUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error("Token tidak ditemukan.");

            const response = await axios.get(`${API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const serverUser = response.data.data;

            setUserData({
                name: serverUser.name || 'Nama Pengguna',
                email: serverUser.email || 'email@pengguna.com',
            });

            setAvatarUri(serverUser.avatarUrl || DEFAULT_AVATAR);

            const userForStorage = {
                name: serverUser.name,
                email: serverUser.email,
                avatar: serverUser.avatarUrl,
            };
            await AsyncStorage.setItem('user', JSON.stringify(userForStorage));

        } catch (error) {
            console.warn('Gagal mengambil profil dari server (axios):', error.response?.data?.message || error.message);

            try {
                const cachedUser = await AsyncStorage.getItem('user');
                if (cachedUser) {
                    const parsedUser = JSON.parse(cachedUser);
                    setUserData({
                        name: parsedUser.name || 'Nama Pengguna',
                        email: parsedUser.email || 'email@pengguna.com',
                    });
                    setAvatarUri(parsedUser.avatar || DEFAULT_AVATAR);
                }
            } catch (cacheError) {
                console.error('Gagal memuat data dari cache:', cacheError);
            }
        }
    };

    const uploadAvatarToBackend = async (imageUri) => {
        try {
            setIsUploading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Sesi Anda telah berakhir. Silakan login kembali.');
                return false;
            }

            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('avatar', { uri: imageUri, name: filename, type });

            const response = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.data) {
                const updatedUser = data.data;
                if (updatedUser.avatarUrl) {
                    setAvatarUri(updatedUser.avatarUrl);
                    
                    const currentUser = await AsyncStorage.getItem('user');
                    if (currentUser) {
                        const parsedUser = JSON.parse(currentUser);
                        parsedUser.avatar = updatedUser.avatarUrl;
                        parsedUser.name = updatedUser.name || parsedUser.name;
                        await AsyncStorage.setItem('user', JSON.stringify(parsedUser));
                    }
                }
                Alert.alert('Sukses', 'Foto profil berhasil diperbarui');
                return true;
            } else {
                Alert.alert('Error', data.message || 'Gagal mengupload foto');
                return false;
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Terjadi kesalahan saat mengupload foto');
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const handleLogout = () => {
        Alert.alert(
            "Keluar",
            "Apakah Anda yakin ingin keluar dari akun?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Hapus semua data lokal
                            await AsyncStorage.clear();
                            
                            // Close profile menu
                            handleClose();
                            
                            // Tunggu animasi selesai
                            setTimeout(() => {
                                // Reset navigation stack dan pergi ke Login
                                navigation?.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                });
                            }, 300);

                            Alert.alert('Logout Berhasil', 'Anda telah keluar dari akun');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Terjadi kesalahan saat logout');
                        }
                    }
                }
            ]
        );
    };

    const handleAvatarChange = () => {
        setAvatarModalVisible(true);
    };

    const pickImageFromCamera = async () => {
        setAvatarModalVisible(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Kami memerlukan izin kamera untuk mengambil foto.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            await uploadAvatarToBackend(result.assets[0].uri);
        }
    };

    const pickImageFromGallery = async () => {
        setAvatarModalVisible(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Kami memerlukan izin galeri untuk memilih foto.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            await uploadAvatarToBackend(result.assets[0].uri);
        }
    };

    const MenuItem = ({ icon, title, subtitle, onPress, color = "#333", showBadge, badgeCount }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.menuRight}>
                {showBadge && badgeCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badgeCount}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

    if (activeScreen === 'profile') return <ProfileEdit visible={true} onClose={() => setActiveScreen(null)} />;
    if (activeScreen === 'activeEvents') return <EventList visible={true} onClose={() => setActiveScreen(null)} type="active" />;
    if (activeScreen === 'historyEvents') return <EventList visible={true} onClose={() => setActiveScreen(null)} type="history" />;
    if (activeScreen === 'help') return <Help visible={true} onClose={() => setActiveScreen(null)} />;

    return (
        <>
            <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={handleClose}><View style={styles.closeArea} /></TouchableWithoutFeedback>
                    <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideAnim }] }]}>
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                            <View style={styles.profileSection}>
                                <View style={styles.avatarContainer}>
                                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                                    <TouchableOpacity style={styles.editAvatarButton} onPress={handleAvatarChange} disabled={isUploading}>
                                        {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={16} color="#fff" />}
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.userName}>{userData.name}</Text>
                                <Text style={styles.userEmail}>{userData.email}</Text>
                            </View>
                        </View>
                        <View style={styles.menuContainer}>
                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>AKUN</Text>
                                <MenuItem icon="person-outline" title="Edit Profile" subtitle="Ubah informasi pribadi" onPress={() => setActiveScreen('profile')} color="#007AFF" />
                            </View>
                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>EVENT</Text>
                                <MenuItem icon="calendar-outline" title="Event Aktif" subtitle="Event yang sedang berlangsung" onPress={() => setActiveScreen('activeEvents')} color="#FF9500" showBadge badgeCount={2} />
                                <MenuItem icon="time-outline" title="Riwayat Event" subtitle="Event yang pernah diikuti" onPress={() => setActiveScreen('historyEvents')} color="#5856D6" />
                            </View>
                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>LAINNYA</Text>
                                <MenuItem icon="help-circle-outline" title="Bantuan" subtitle="Pusat bantuan & FAQ" onPress={() => setActiveScreen('help')} color="#8E8E93" />
                            </View>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                                <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                                <Text style={styles.logoutText}>Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
            <Modal transparent visible={avatarModalVisible} animationType="fade" onRequestClose={() => setAvatarModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setAvatarModalVisible(false)}>
                    <View style={styles.avatarModalOverlay}>
                        <View style={styles.avatarModalContent}>
                            <Text style={styles.avatarModalTitle}>Ubah Foto Profile</Text>
                            <TouchableOpacity style={styles.avatarOption} onPress={pickImageFromCamera} disabled={isUploading}>
                                <Ionicons name="camera-outline" size={24} color="#007AFF" /><Text style={styles.avatarOptionText}>Ambil Foto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.avatarOption} onPress={pickImageFromGallery} disabled={isUploading}>
                                <Ionicons name="images-outline" size={24} color="#007AFF" /><Text style={styles.avatarOptionText}>Pilih dari Galeri</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.avatarOption, styles.cancelOption]} onPress={() => setAvatarModalVisible(false)}>
                                <Text style={styles.cancelText}>Batal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'row',
    },
    closeArea: {
        flex: 1,
    },
    modalContainer: {
        width: MODAL_WIDTH,
        backgroundColor: '#fff',
        height: height,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    menuContainer: {
        flex: 1,
        paddingTop: 10,
    },
    menuSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
        paddingHorizontal: 20,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#999',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginRight: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 30,
        marginBottom: 30,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    avatarModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    avatarModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    avatarModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    avatarOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 10,
    },
    avatarOptionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        fontWeight: '500',
    },
    cancelOption: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginTop: 5,
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});