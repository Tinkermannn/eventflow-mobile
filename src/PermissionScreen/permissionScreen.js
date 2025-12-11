import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Image, BackHandler } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import Check from '../../assets/checkmark.png'

export default function PermissionsScreen({ navigation }) {
    const [locationStatus, setLocationStatus] = useState(null);
    const [cameraStatus, setCameraStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);
    const isMounted = useRef(true);
    const navigationAttempted = useRef(false);

    // Fungsi untuk memeriksa status izin
    const checkPermissions = async () => {
        try {
            const { status: location } = await Location.getForegroundPermissionsAsync();
            const { status: camera } = await Camera.getCameraPermissionsAsync();
            
            if (!isMounted.current) return;
            
            setLocationStatus(location);
            setCameraStatus(camera);
            setLoading(false);
            
            // Jika sudah granted semua, navigasi dengan delay
            if (location === 'granted' && camera === 'granted' && !navigationAttempted.current) {
                navigationAttempted.current = true;
                setTimeout(() => {
                    if (isMounted.current && navigation?.replace) {
                        navigation.replace('Login');
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Check permissions error:', error);
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;
        navigationAttempted.current = false;
        checkPermissions();
        
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Disable back button di Android - FIXED API
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true; // Prevent back
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                backHandler.remove(); // FIXED: Gunakan .remove() bukan removeEventListener
            };
        }, [])
    );

    // Fungsi untuk meminta izin
    const handleRequestPermissions = async () => {
        try {
            setLoading(true);
            setHasRequestedPermissions(true);
            
            // Minta izin lokasi terlebih dahulu
            const { status: location } = await Location.requestForegroundPermissionsAsync();
            if (isMounted.current) {
                setLocationStatus(location);
            }
            
            // Delay sebentar sebelum minta permission kedua
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Kemudian minta izin kamera
            const { status: camera } = await Camera.requestCameraPermissionsAsync();
            if (isMounted.current) {
                setCameraStatus(camera);
                setLoading(false);
            }

            // Jika kedua izin diberikan, navigasi dengan delay lebih lama
            if (location === 'granted' && camera === 'granted' && !navigationAttempted.current) {
                navigationAttempted.current = true;
                setTimeout(() => {
                    if (isMounted.current && navigation?.replace) {
                        navigation.replace('Login');
                    }
                }, 800);
            }
        } catch (error) {
            console.error('Request permissions error:', error);
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    if (loading && !hasRequestedPermissions) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3ab8f3" />
            </View>
        );
    }

    const allPermissionsGranted = locationStatus === 'granted' && cameraStatus === 'granted';
    
    const renderPermissionItem = (label, status) => (
        <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>{label}</Text>
            {status === 'granted' ? (
                <Image source={Check} style={styles.icon} />
            ) : (
                <TouchableOpacity onPress={() => Linking.openSettings()}>
                    <Text style={styles.settingsText}>Enable in Settings</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>One Last Step!</Text>
            <Text style={styles.subtitle}>
                Our app needs the following permissions to provide you with the best experience.
            </Text>

            <View style={styles.permissionsContainer}>
                {renderPermissionItem('Location Access', locationStatus)}
                {renderPermissionItem('Camera Access', cameraStatus)}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={allPermissionsGranted ? () => {
                    if (!navigationAttempted.current) {
                        navigationAttempted.current = true;
                        navigation.replace('Login');
                    }
                } : handleRequestPermissions}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {allPermissionsGranted ? 'Continue' : 'Grant Permissions'}
                    </Text>
                )}
            </TouchableOpacity>
            
            {hasRequestedPermissions && !allPermissionsGranted && (
                <Text style={styles.helperText}>
                    If permissions were denied, please enable them in Settings above.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    permissionsContainer: {
        width: '100%',
        marginBottom: 40,
    },
    permissionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    permissionText: {
        fontSize: 18,
        color: '#444',
    },
    icon: {
        height: 20,
        width: 20,
    },
    settingsText: {
        fontSize: 14,
        color: '#3ab8f3',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#3ab8f3',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '80%',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#a9a9a9',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    helperText: {
        marginTop: 20,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    }
});