import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL;

export default function EventList({ visible, onClose, type = 'history' }) {
    const [historyEvents, setHistoryEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible && type === 'history') {
            fetchEventHistory();
        }
    }, [visible, type]);

    const fetchEventHistory = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                return;
            }

            // Extract userId dari token
            let userId = null;
            try {
                const payload = token.split(".")[1];
                const decoded = JSON.parse(atob(payload));
                userId = decoded.id || decoded.userId;
            } catch (error) {
                console.error('Error decoding token:', error);
                return;
            }

            if (!userId) {
                console.error('userId tidak ditemukan dari token');
                return;
            }

            // Fetch all events terlebih dahulu
            const eventsResponse = await fetch(`${API_URL}/events`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!eventsResponse.ok) {
                console.error('Fetch events error:', eventsResponse.status);
                return;
            }

            const eventsResult = await eventsResponse.json();
            if (!eventsResult.success || !Array.isArray(eventsResult.data)) {
                return;
            }

            // Fetch history untuk setiap event
            const allHistory = [];
            for (const event of eventsResult.data) {
                try {
                    const historyResponse = await fetch(
                        `${API_URL}/event-participants/${event.id}/${userId}/history`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (historyResponse.ok) {
                        const historyResult = await historyResponse.json();
                        if (historyResult.success && Array.isArray(historyResult.data)) {
                            allHistory.push(...historyResult.data);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching history for event ${event.id}:`, error);
                    // Continue ke event berikutnya
                }
            }

            setHistoryEvents(allHistory);
        } catch (error) {
            console.error('Error fetching event history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const title = 'Riwayat Event';

    const getStatusColor = (status) => {
        switch (status) {
            case 'Berlangsung': return '#34C759';
            case 'Akan Datang': return '#FF9500';
            case 'Selesai': return '#8E8E93';
            default: return '#8E8E93';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const renderEvent = ({ item }) => (
        <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons 
                        name="time" 
                        size={24} 
                        color="#007AFF" 
                    />
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{item.event?.name || 'Event'}</Text>
                    <Text style={styles.eventDate}>
                        {formatDate(item.event?.startTime || item.createdAt)}
                    </Text>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#8E8E9320' }]}>
                <Text style={[styles.statusText, { color: '#8E8E93' }]}>
                    Selesai
                </Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={{ width: 24 }} />
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : (
                    <FlatList
                        data={historyEvents}
                        renderItem={renderEvent}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={64} color="#E5E5EA" />
                                <Text style={styles.emptyText}>Belum ada history event</Text>
                            </View>
                        }
                    />
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
    listContent: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#007AFF15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    eventInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 16,
    },
});