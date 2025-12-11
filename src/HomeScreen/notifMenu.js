import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const API_BASE_URL = process.env.API_URL;

export default function NotificationMenu({ visible, onClose, eventId }) {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [expandedId, setExpandedId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(0);
            if (eventId) {
                fetchEventNotifications(eventId);
            } else {
                fetchAllNotifications();
            }
        }
    }, [visible, eventId]);

    const fetchEventNotifications = async (id) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const notifRes = await fetch(`${API_BASE_URL}/notifications/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const notifData = await notifRes.json();
            
            if (notifData.success && Array.isArray(notifData.data)) {
                const sortedNotifs = notifData.data
                    .map(n => ({
                        id: n.id,
                        title: n.title,
                        message: n.message,
                        type: n.type || 'GENERAL',
                        timestamp: n.createdAt,
                        isRead: n.userNotifications?.[0]?.isRead ?? false,
                        category: n.category || 'general',
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                setNotifications(sortedNotifs);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching event notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAllNotifications = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            // Step 1: Fetch all joined events
            const eventsRes = await fetch(`${API_BASE_URL}/events`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const eventsData = await eventsRes.json();
            if (!eventsData.success || !Array.isArray(eventsData.data)) {
                setNotifications([]);
                return;
            }

            // Filter to get only active events (startTime <= now <= endTime)
            const now = new Date();
            const activeEvents = eventsData.data.filter(e => {
                const startTime = new Date(e.startTime);
                const endTime = new Date(e.endTime);
                return startTime <= now && now <= endTime;
            });

            const activeEventIds = activeEvents.map(e => e.id);
            console.log('Active Event IDs:', activeEventIds);

            // Step 2: Fetch all user notifications
            const notifRes = await fetch(`${API_BASE_URL}/user-notifications/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const notifData = await notifRes.json();

            if (notifData.success && Array.isArray(notifData.data)) {
                // Filter: only show notifications from active events OR broadcast type
                const filteredNotifs = notifData.data.filter(n => {
                    const isBroadcast = n.type === 'BROADCAST' || n.category === 'broadcast';
                    const isFromActiveEvent = activeEventIds.includes(n.event?.id);
                    return isBroadcast || isFromActiveEvent;
                });

                console.log('Filtered Notifications:', filteredNotifs.length);

                // Map notifications
                const allNotifs = filteredNotifs.map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type || 'GENERAL',
                    timestamp: n.createdAt,
                    isRead: n.isRead ?? false,
                    category: n.category || 'general',
                    eventName: n.event?.name || (n.type === 'BROADCAST' ? 'Broadcast' : 'Event'),
                    eventId: n.event?.id,
                }));

                allNotifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(allNotifs);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };





    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
        }).start(onClose);
    };

    const getIcon = (type) => {
        const icons = {
            'SECURITY_ALERT': 'shield-checkmark',
            'EVENT_UPDATE': 'calendar',
            'BROADCAST': 'megaphone',
            'GENERAL': 'notifications',
        };
        return icons[type] || 'notifications';
    };

    const getTypeColor = (type) => {
        const colors = {
            'SECURITY_ALERT': '#FF6B6B',
            'EVENT_UPDATE': '#4ECDC4',
            'BROADCAST': '#FFD93D',
            'GENERAL': '#95E1D3',
        };
        return colors[type] || '#95E1D3';
    };

    const getTime = (timestamp) => {
        const diff = Date.now() - new Date(timestamp);
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (mins < 1) return 'Baru saja';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}j`;
        return `${days}h`;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Modal transparent visible={visible} onRequestClose={handleClose}>
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.handle} />
                            
                            <View style={styles.header}>
                                <Text style={styles.title}>Notifikasi</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); eventId ? fetchEventNotifications(eventId) : fetchAllNotifications(); }} />}
                            >
                                {loading && !notifications.length ? (
                                    <View style={styles.center}>
                                        <ActivityIndicator />
                                    </View>
                                ) : !notifications.length ? (
                                    <View style={styles.center}>
                                        <Ionicons name="notifications-off" size={48} color="#ccc" />
                                        <Text style={styles.empty}>Tidak ada notifikasi</Text>
                                    </View>
                                ) : (
                                    notifications.map((n) => (
                                        <TouchableOpacity
                                            key={n.id}
                                            style={[styles.item, { borderLeftWidth: 4, borderLeftColor: getTypeColor(n.type) }]}
                                            onPress={() => {
                                                setExpandedId(expandedId === n.id ? null : n.id);
                                            }}
                                        >
                                            <Ionicons name={getIcon(n.type)} size={20} color={getTypeColor(n.type)} style={styles.icon} />
                                            <View style={styles.content}>
                                                <Text style={[styles.itemTitle, n.isRead ? {} : styles.unreadText]}>{n.title}</Text>
                                                {n.eventName && <Text style={styles.event}>{n.eventName}</Text>}
                                                <Text 
                                                    style={[styles.message, n.isRead ? {} : styles.unreadMessage]}
                                                    numberOfLines={expandedId === n.id ? undefined : 2}
                                                >
                                                    {n.message}
                                                </Text>
                                                <Text style={styles.time}>{getTime(n.timestamp)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>


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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.85,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        alignSelf: 'center',
        marginVertical: 10,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        color: '#007AFF',
        marginTop: 2,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    empty: {
        marginTop: 10,
        color: '#999',
    },
    item: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        backgroundColor: '#fff',
    },
    unreadText: {
        fontWeight: '700',
        color: '#1a1a1a',
    },
    unreadMessage: {
        fontWeight: '600',
        color: '#333',
    },
    icon: {
        marginRight: 12,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '600',
        marginBottom: 4,
    },
    event: {
        fontSize: 11,
        color: '#007AFF',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 4,
    },
    time: {
        fontSize: 11,
        color: '#999',
    },

});