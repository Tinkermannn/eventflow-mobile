import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from "./src/SplashScreen/splashScreen";
import OnboardingScreen from "./src/OnBoardingScreen/onBoardingScreen";
import PermissionsScreen from "./src/PermissionScreen/permissionScreen";
import RegisterScreen from "./src/RegisterScreen/registerScreen";
import LoginScreen from "./src/LoginScreen/LoginScreen";
import HomeScreen from "./src/HomeScreen/homeScreen";

const Stack = createNativeStackNavigator();
const API_URL = process.env.API_URL;

// Loading screen saat checking auth
function LoadingScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#3ab8f3" />
        </View>
    );
}

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);
    const navigationRef = React.useRef();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Fungsi untuk navigate ke Login (bisa dipanggil dari mana saja)
    const navigateToLogin = () => {
        navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

            // Jika tidak ada token
            if (!token) {
                // Jika belum lihat onboarding, tampilkan onboarding
                if (!hasSeenOnboarding) {
                    setInitialRoute('Splash');
                } else {
                    // Jika sudah lihat onboarding tapi tidak login, ke login
                    setInitialRoute('Login');
                }
                return;
            }

            // Jika ada token, cek apakah user sudah join event
            const eventStatus = await checkJoinedEvent(token);
            
            if (eventStatus.hasJoinedEvent) {
                // Jika sudah join event, langsung ke home
                setInitialRoute('Home');
            } else {
                // Jika belum join event, juga ke home (user bisa join dari sini)
                setInitialRoute('Home');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Jika error, amankan dengan redirect ke login
            setInitialRoute('Login');
        }
    };

    const checkJoinedEvent = async (token) => {
        try {
            const response = await fetch(`${API_URL}/events?status=JOINED`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                return { hasJoinedEvent: true, event: result.data[0] };
            }
            
            return { hasJoinedEvent: false, event: null };
        } catch (error) {
            console.error('Check joined event error:', error);
            return { hasJoinedEvent: false, event: null };
        }
    };

    // Jika initialRoute masih null, tampilkan loading screen
    if (initialRoute === null) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="OnBoard" component={OnboardingScreen} />
                <Stack.Screen name="Permission" component={PermissionsScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen}
                    options={{
                        // Prevent back navigation from Home ke login
                        gestureEnabled: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}