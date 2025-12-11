import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function SettingsMenu({ visible, onClose }) {
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 70,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
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
                            ]
                        }
                        >
                            <View style={styles.handleBar} />

                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Settings</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={28} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuContainer}>


                                {/* <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuLeft}>
                                        <Ionicons name="lock-closed-outline" size={24} color="#333" />
                                        <Text style={styles.menuText}>Privacy</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity> */}

                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuLeft}>
                                        <Ionicons name="language-outline" size={24} color="#333" />
                                        <Text style={styles.menuText}>Language</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuLeft}>
                                        <Ionicons name="help-circle-outline" size={24} color="#333" />
                                        <Text style={styles.menuText}>Help & Support</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuLeft}>
                                        <Ionicons name="information-circle-outline" size={24} color="#333" />
                                        <Text style={styles.menuText}>About</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>

                                {/* Logout Button */}
                                <TouchableOpacity style={styles.logoutButton}>
                                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                                    <Text style={styles.logoutText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: 40,
        maxHeight: height * 0.85,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#DDD',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF0EF',
        borderRadius: 12,
    },
    logoutText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
});