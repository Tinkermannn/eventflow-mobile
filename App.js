import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/SplashScreen/splashScreen";
import OnboardingScreen from "./src/OnBoardingScreen/onBoardingScreen";
import PermissionsScreen from "./src/PermissionScreen/permissionScreen";
import RegisterScreen from "./src/RegisterScreen/registerScreen";

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {/* <Stack.Navigator initialRouteName="onBoard" screenOptions={{ headerShown: false }}> */}

        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="OnBoard" component={OnboardingScreen} />
        <Stack.Screen name="Permission" component={PermissionsScreen} />
      
        
        <Stack.Screen name="Home" component={RegisterScreen} />
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
