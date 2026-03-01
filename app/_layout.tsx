import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        animation: 'fade',
        headerBackground: () => (
          <LinearGradient
            colors={["#007AFF", "#005BBB"]}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
          letterSpacing: 0.5,
        },
        headerShadowVisible: false,

        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.headerText}> Home</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="github"
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="logo-github" size={20} color="#fff" />
              <Text style={styles.headerText}> GitHub</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="logo-github" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});