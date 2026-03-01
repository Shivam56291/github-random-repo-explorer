import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import CustomAlert from "../components/CustomAlert";

export default function Index() {
  const [alertVisible, setAlertVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(80)).current;
  const scaleLogo = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleLogo, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    translateY.setValue(60);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      translateY.setValue(60);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }, []),
  );

  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    React.useCallback(() => {
      opacity.setValue(0);
      translateX.setValue(50);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, []),
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ translateX }],
      }}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Animated.Image
            source={{
              uri: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            }}
            style={[styles.image, { transform: [{ scale: scaleLogo }] }]}
          />
          <Text style={styles.title}>Welcome to GitHub Explorer</Text>
          <Text style={styles.subtitle}>
            Explore random repositories of any GitHub user instantly.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setAlertVisible(true)}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.features,
            { opacity: fadeAnim, transform: [{ translateY }] },
          ]}
        >
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
