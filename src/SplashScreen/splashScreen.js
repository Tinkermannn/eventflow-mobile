import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    Easing
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
    const animationValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animasi naik ke layar
        Animated.timing(animationValue, {
            toValue: 1,
            duration: 1500, // 1.5 detik
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        // Timer untuk pindah ke OnBoard
        const timer = setTimeout(async () => {
            // Tandai bahwa user sudah melihat onboarding
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            navigation.replace("OnBoard");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Interpolasi untuk opacity (fade in)
    const opacity = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    // Interpolasi untuk translateY (naik dari bawah)
    const translateY = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
    });

    // Interpolasi untuk scale (sedikit membesar)
    const scale = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
    });

    return (
        <View style={styles.container}>
            {/* Bagian tengah */}
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: opacity,
                        transform: [
                            { translateY: translateY },
                            { scale: scale }
                        ],
                    },
                ]}
            >
                <Image
                    source={require("../../assets/single-logo.png")}
                    style={styles.logo}
                />
                <Text style={styles.subtitle}>Smart Events. Safer Crowds.</Text>
            </Animated.View>

            {/* Bagian bawah */}
            <View style={styles.footer}>
                <Text style={styles.footerTextfrom}>from</Text>
                <Text style={styles.footerText}>EventFlow</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#ffffff',
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    footer: {
        position: "absolute",
        bottom: 60,
        alignSelf: "center",
        alignItems: "center"
    },
    footerText: {
        fontSize: 20,
        color: "#1E38DD",
        fontWeight: "700",
        letterSpacing: 2,
    },
    footerTextfrom: {
        fontSize: 20,
        color: "rgba(159, 161, 165, 0.7)",
        fontStyle: "normal",
        fontWeight: "600"
    },
    logo: {
        width: 160,
        height: 160,
        resizeMode: "contain",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "black",
        textAlign: 'center',
    },
});