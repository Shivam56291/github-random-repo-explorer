import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
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
  const [errorTitle, setErrorTitle] = useState("");
  const [inputError, setInputError] = useState(false);

  const fetchRepo = async () => {
    
    Keyboard.dismiss();
    
    if (!username.trim()) {
      setRepo(null);
      setErrorTitle("Username Required");
      setError("Please enter a GitHub username to continue.");
      setInputError(true);
      return;
    }

    setLoading(true);
    setError("");
    setErrorTitle("");
    setRepo(null);
    setInputError(false);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username.trim()}/repos`,
      );

      // ✅ User not found
      if (response.status === 404) {
        setErrorTitle("User Not Found");
        setError(
          "We couldn't find this GitHub user. Please check the username.",
        );
        return;
      }

      // ✅ Rate limit
      if (response.status === 403) {
        setErrorTitle("API Limit Reached");
        setError("GitHub API rate limit exceeded. Please try again later.");
        return;
      }

      const data = await response.json();

      // ✅ No repositories
      if (!Array.isArray(data) || data.length === 0) {
        setErrorTitle("No Public Repositories");
        setError("This user does not have any public repositories.");
        return;
      }

      const randomIndex = Math.floor(Math.random() * data.length);
      setRepo(data[randomIndex]);
    } catch {
      // ✅ Network error
      setErrorTitle("Network Error");
      setError("Unable to fetch data. Please check your internet connection.");
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
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }] }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={styles.title}>GitHub Repo Explorer</Text>

        <View style={styles.card}>
          <Text style={styles.label}>GitHub Username</Text>

          <TextInput
            style={[
              styles.input,
              inputError && { borderColor: "#FF3B30", borderWidth: 2 },
            ]}
            placeholder="Enter username (e.g. torvalds)"
            value={username}
            onSubmitEditing={fetchRepo}
            returnKeyType="search"
            onChangeText={(text) => {
              setUsername(text);
              if (inputError) setInputError(false);
            }}
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

        {/* Loading */}
        {loading && (
          <LottieView
            source={require("../assets/github-spinner.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        )}

        {/* Error UI */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <View style={styles.errorBadge}>
              <Text style={styles.errorIcon}>⚠</Text>
            </View>

            <Text style={styles.errorTitle}>{errorTitle}</Text>
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
            <View style={styles.repoNameContainer}>
              <Text numberOfLines={1} style={styles.repoName}>
                {repo.name}
              </Text>
              <Text style={styles.publicBadge}>Public</Text>
            </View>

            <Text style={styles.repoDescription}>
              {repo.description ||
                "No description available for this repository."}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{repo.stargazers_count}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{repo.forks_count}</Text>
                <Text style={styles.statLabel}>Forks</Text>
              </View>
            </View>

            <Pressable
              onPress={() => Linking.openURL(repo.html_url)}
              style={({ pressed }) => [
                styles.visitButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.visitButtonText}>Visit Repository</Text>
            </Pressable>

            <LottieView
              source={require("../assets/success-animation.json")}
              autoPlay
              loop={false}
              style={styles.successLottie}
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
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  lottie: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginTop: 20,
  },

  errorCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    alignItems: "center",
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
    marginBottom: 5,
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

  repoCard: {
    backgroundColor: "#fff",
    marginTop: 30,
    padding: 22,
    borderRadius: 18,
    elevation: 8,
  },
  repoNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  repoName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    flex: 1,
  },
  publicBadge: {
    backgroundColor: "#EAF3FF",
    color: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 10,
  },
  repoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F7F9FC",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "700", color: "#007AFF" },
  statLabel: { fontSize: 13, color: "#555", marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: "#ddd" },
  visitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  visitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  successLottie: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginTop: 15,
  },
});
