import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Platform, Image} from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import Check from '../../assets/checkmark.png'

export default function PermissionsScreen({ navigation }) {
    const [locationStatus, setLocationStatus] = useState(null);
    const [cameraStatus, setCameraStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fungsi untuk memeriksa status izin
    const checkPermissions = async () => {
        const { status: location } = await Location.getForegroundPermissionsAsync();
        const { status: camera } = await Camera.getCameraPermissionsAsync();
        setLocationStatus(location);
        setCameraStatus(camera);
        setLoading(false);
    };

    useEffect(() => {
        checkPermissions();
    }, []);

    // Fungsi untuk meminta izin
    const handleRequestPermissions = async () => {
        setLoading(true);
        const { status: location } = await Location.requestForegroundPermissionsAsync();
        const { status: camera } = await Camera.requestCameraPermissionsAsync();
        setLocationStatus(location);
        setCameraStatus(camera);
        setLoading(false);

        if (location === 'granted' && camera === 'granted') {
            navigation.replace('Home');
        }
    };

    if (loading) {
        return <View style={styles.container}><ActivityIndicator size="large" /></View>;
    }

    const allPermissionsGranted = locationStatus === 'granted' && cameraStatus === 'granted';
    const renderPermissionItem = (label, status) => (
        <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>{label}</Text>
            {status === 'granted' ? (
                // <Text style={styles.icon}>{Check}</Text>
                 <Image source={Check} style={styles.icon} />
            ) : (
                <TouchableOpacity onPress={() => Linking.openSettings()}>
                    <Text style={styles.settingsText}>Enable</Text>
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
                style={[styles.button, (allPermissionsGranted || loading) && styles.buttonDisabled]}
                onPress={allPermissionsGranted ? () => navigation.replace('Home') : handleRequestPermissions}
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
        fontSize: 20,
        color: 'green',
    },
    settingsText: {
        fontSize: 14,
        color: '#3ab8f3',
        fontWeight: 'bold',
        marginLeft: 10,
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
    icon: {
        height: '40%',
        width: '10%',
    }
});