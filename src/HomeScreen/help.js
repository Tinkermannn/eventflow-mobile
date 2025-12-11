import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Help({ visible, onClose }) {
    const [expandedId, setExpandedId] = useState(null);

    const faqs = [
        {
            id: '1',
            question: 'Bagaimana cara mendaftar event?',
            answer: 'Anda dapat mendaftar event dengan membuka halaman detail event dan menekan tombol "Daftar". Pastikan Anda sudah login terlebih dahulu.'
        },
        {
            id: '2',
            question: 'Bagaimana cara membatalkan pendaftaran?',
            answer: 'Buka menu Event Aktif, pilih event yang ingin dibatalkan, lalu tekan tombol "Batalkan Pendaftaran". Pembatalan dapat dilakukan maksimal H-3 sebelum event.'
        },
        {
            id: '3',
            question: 'Apakah ada biaya untuk mendaftar?',
            answer: 'Sebagian besar event gratis, namun ada beberapa event premium yang berbayar. Informasi biaya akan tertera jelas di halaman detail event.'
        },
        {
            id: '4',
            question: 'Bagaimana cara menghubungi support?',
            answer: 'Anda dapat menghubungi kami melalui email di support@eventapp.com atau melalui WhatsApp di nomor +62 812-3456-7890.'
        },
    ];

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

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
                    <Text style={styles.headerTitle}>Bantuan</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>FAQ</Text>
                        
                        {faqs.map((faq) => (
                            <View key={faq.id} style={styles.faqCard}>
                                <TouchableOpacity
                                    style={styles.faqHeader}
                                    onPress={() => toggleExpand(faq.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.question}>{faq.question}</Text>
                                    <Ionicons
                                        name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#8E8E93"
                                    />
                                </TouchableOpacity>
                                
                                {expandedId === faq.id && (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answer}>{faq.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hubungi Kami</Text>
                        
                        <TouchableOpacity style={styles.contactCard}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="mail" size={24} color="#007AFF" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue}>support@eventapp.com</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>WhatsApp</Text>
                                <Text style={styles.contactValue}>+62 812-3456-7890</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    question: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 12,
    },
    answerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#F8F9FA',
    },
    answer: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});