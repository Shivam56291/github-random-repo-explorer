import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Repo = {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
};

export default function Settings() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [repo, setRepo] = useState<Repo | null>(null);
  const [error, setError] = useState("");

  const fetchRepo = async () => {
    if (!username.trim()) {
      setRepo(null);
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setRepo(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`,
      );
      const data = await response.json();

      if (!Array.isArray(data)) {
        setError("User not found");
        return;
      }

      if (data.length === 0) {
        setError("This user has no public repositories");
        return;
      }

      const randomIndex = Math.floor(Math.random() * data.length);
      setRepo(data[randomIndex]);
    } catch {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={styles.title}>GitHub Repo Explorer</Text>

        <View style={styles.card}>
          <Text style={styles.label}>GitHub Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username (e.g. torvalds)"
            value={username}
            onChangeText={setUsername}
          />
          <Pressable
            onPress={fetchRepo}
            disabled={loading}
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.6 },
            ]}
          >
            <LinearGradient
              colors={["#0A84FF", "#0066CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : "Get Random Repo"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Loading Animation */}
        {loading && (
          <LottieView
            source={require("../assets/github-spinner.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        )}

        {/* Error Animation */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <View style={styles.errorBadge}>
              <Text style={styles.errorIcon}>⚠</Text>
            </View>

            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>

            <LottieView
              source={require("../assets/error-animation.json")}
              autoPlay
              loop={false}
              style={styles.errorLottie}
            />
          </View>
        )}

        {/* Repo Result */}
        {repo && !loading && (
          <View style={styles.repoCard}>
            <Text style={styles.repoName}>{repo.name}</Text>
            <Text style={styles.repoDescription}>
              {repo.description || "No description available"}
            </Text>
            <Text style={styles.repoStats}>
              ⭐ Stars: {repo.stargazers_count}
            </Text>
            <Text style={styles.repoStats}>🍴 Forks: {repo.forks_count}</Text>
            <Text
              style={styles.repoLink}
              onPress={() => Linking.openURL(repo.html_url)}
            >
              🔗 Visit Repo
            </Text>
            <LottieView
              source={require("../assets/success-animation.json")}
              autoPlay
              loop={false}
              style={{
                width: 120,
                height: 120,
                alignSelf: "center",
                marginTop: 10,
              }}
            />
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: { color: "black", marginBottom: 5, fontWeight: "600" },
  input: {
    height: 50,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    color: "black",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
    fontSize: 16,
  },
  repoCard: {
    backgroundColor: "white",
    marginTop: 25,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  repoName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  buttonWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 5,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  repoDescription: { color: "#555", marginBottom: 15 },
  repoStats: { fontSize: 16, fontWeight: "600", color: "black", marginTop: 5 },
  repoLink: { fontSize: 14, color: "#007AFF", marginTop: 10 },
  lottie: { width: 150, height: 150, alignSelf: "center", marginTop: 20 },
  errorCard: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  errorBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  errorIcon: {
    fontSize: 22,
    color: "#FF3B30",
    fontWeight: "bold",
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B00020",
    marginBottom: 3,
  },

  errorMessage: {
    fontSize: 14,
    color: "#7A1C1C",
    textAlign: "center",
    marginBottom: 10,
  },

  errorLottie: {
    width: 100,
    height: 100,
  },
});
