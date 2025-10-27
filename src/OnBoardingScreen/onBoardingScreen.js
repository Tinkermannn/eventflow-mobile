import React, { useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    TouchableOpacity,
    Dimensions,
    FlatList, // DIUBAH: Menggunakan FlatList
} from "react-native";

const { width: screenWidth } = Dimensions.get('window');

// Data bisa dipindahkan ke luar komponen agar tidak dibuat ulang setiap render
const onboardingData = [
    {
        id: "1", // Gunakan string untuk keyExtractor
        title: "Smart Events",
        subtitle: "Organize and manage your events with intelligent automation",
        image: require("../../assets/single-logo.png"),
    },
    {
        id: "2",
        title: "Discover Opportunities",
        subtitle: "Connect with events and people that match your interests",
        image: require("../../assets/single-logo.png"),
    },
    {
        id: "3",
        title: "Get Started Now",
        subtitle: "Join a community of innovators and start creating today",
        image: require("../../assets/single-logo.png"),
    },
];

// Komponen untuk satu halaman, agar lebih rapi
const OnboardingItem = ({ item }) => (
    <View style={[styles.page, { width: screenWidth }]}>
        <View style={styles.contentContainer}>
            <Image source={item.image} style={styles.illustration} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
    </View>
);

export default function OnboardingScreen({ navigation }) {
    const [currentPage, setCurrentPage] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null); // BARU: Ref untuk mengontrol FlatList

    // BARU: Callback yang dioptimalkan untuk mendeteksi halaman aktif
    const viewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentPage(viewableItems[0].index);
        }
    }, []);

    // BARU: Konfigurasi untuk callback di atas
    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    // FUNGSI DIUBAH: Menggunakan ref untuk navigasi
    const goToNextPage = () => {
        if (currentPage < onboardingData.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentPage + 1 });
        } else {
            navigation.replace("Permission");
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            slidesRef.current.scrollToIndex({ index: currentPage - 1 });
        }
    };

    const skipOnboarding = () => {
        navigation.replace("Home");
    };

    // Render dots indicator (dibuat lebih dinamis)
    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {onboardingData.map((_, index) => {
                const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth];
                
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 20, 8], // Lebar dot akan membesar saat aktif
                    extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3], // Opasitas juga berubah
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index.toString()}
                        style={[
                            styles.dot,
                            { 
                                width: dotWidth, 
                                opacity,
                                backgroundColor: '#3ab8f3'
                            }
                        ]}
                    />
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            {currentPage < onboardingData.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* FlatList untuk halaman */}
            <View style={{ flex: 3 }}>
                <FlatList
                    ref={slidesRef}
                    data={onboardingData}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false } 
                    )}
                    scrollEventThrottle={16}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                />
            </View>

            <View style={{ flex: 1, justifyContent: 'space-around' }}>
                {renderDots()}

                <View style={styles.navigationContainer}>
                    {currentPage > 0 && (
                        <TouchableOpacity style={styles.backButton} onPress={goToPrevPage}>
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    
                    <View style={{ flex: 1 }} />
                    
                    <TouchableOpacity style={styles.nextButton} onPress={goToNextPage}>
                        <Text style={styles.nextButtonText}>
                            {currentPage === onboardingData.length - 1 ? "Get Started" : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    page: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    illustration: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        bottom: 10
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    nextButton: {
        backgroundColor: '#3ab8f3',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    nextButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
});