import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import CustomAlert from "../components/CustomAlert";

export default function Index() {
  const [alertVisible, setAlertVisible] = useState(false);

  // Reanimated Shared Values
  const fadeAnim = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scaleLogo = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      // Reset values for mount/focus
      fadeAnim.value = 0;
      translateY.value = 30;
      opacity.value = 0;
      translateX.value = 30;
      scaleLogo.value = 0.9;

      // Premium Entry Animations
      scaleLogo.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      translateX.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

      // Staggered features entrance
      fadeAnim.value = withDelay(100, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
      translateY.value = withDelay(100, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    }, []),
  );

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleLogo.value }],
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: translateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    width: "100%", // Ensures full width if layout demands
    alignItems: "center"
  }));

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Animated.Image
            source={{
              uri: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            }}
            style={[styles.image, logoStyle]}
          />
          <Text style={styles.title}>Welcome to GitHub Explorer</Text>
          <Text style={styles.subtitle}>
            Explore random repositories of any GitHub user instantly.
          </Text>

          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              style={styles.button}
              onPressIn={() => (buttonScale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.quad) }))}
              onPressOut={() => (buttonScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }))}
              onPress={() => setAlertVisible(true)}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View style={[styles.features, featuresStyle]}>
          <Text style={styles.featuresTitle}>What You Can Do</Text>

          <View style={styles.featureRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.icon}>🎲</Text>
            </View>
            <Text style={styles.featureText}>
              Discover a random public repository instantly
            </Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.icon}>⭐</Text>
            </View>
            <Text style={styles.featureText}>
              View stars and fork statistics
            </Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.icon}>📄</Text>
            </View>
            <Text style={styles.featureText}>
              Read repository description and details
            </Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.icon}>🔗</Text>
            </View>
            <Text style={styles.featureText}>
              Open repository directly on GitHub
            </Text>
          </View>
        </Animated.View>

        <CustomAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 14,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  features: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },

  featuresTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 15,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 18,
  },

  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
});
