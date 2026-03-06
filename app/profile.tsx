import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useFocusEffect } from "expo-router";

type User = {
  avatar_url: string;
  login: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

export default function Profile() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [topLanguage, setTopLanguage] = useState("");
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Animations */
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslate = useRef(new Animated.Value(40)).current;

  const avatarScale = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      screenOpacity.setValue(0);
      screenTranslate.setValue(40);

      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(screenTranslate, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  const startProfileAnimations = () => {
    avatarScale.setValue(0.7);
    cardOpacity.setValue(0);
    statsOpacity.setValue(0);

    Animated.sequence([
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchProfile = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setUser(null);

    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      const userData = await userRes.json();

      if (userData.message === "Not Found") {
        setError("User not found");
        setLoading(false);
        return;
      }

      const repoRes = await fetch(
        `https://api.github.com/users/${username}/repos`
      );
      const repos = await repoRes.json();

      let stars = 0;
      const languages: Record<string, number> = {};

      repos.forEach((repo: any) => {
        stars += repo.stargazers_count;

        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      const mostUsed =
        Object.keys(languages).sort((a, b) => languages[b] - languages[a])[0] ||
        "N/A";

      setUser(userData);
      setTotalStars(stars);
      setTopLanguage(mostUsed);

      startProfileAnimations();
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: screenOpacity,
        transform: [{ translateY: screenTranslate }],
      }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>GitHub Profile Analyzer</Text>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.label}>GitHub Username</Text>

          <TextInput
            placeholder="Enter username (e.g. torvalds)"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={fetchProfile}
            returnKeyType="search"
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
            onPress={fetchProfile}
          >
            <Text style={styles.buttonText}>Analyze Profile</Text>
          </Pressable>
        </View>

        {/* Loading */}
        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 25 }} />
        )}

        {/* Error */}
        {error !== "" && <Text style={styles.error}>{error}</Text>}

        {/* Profile Result */}
        {user && !loading && (
          <Animated.View style={[styles.profileCard, { opacity: cardOpacity }]}>
            <Animated.Image
              source={{ uri: user.avatar_url }}
              style={[
                styles.avatar,
                { transform: [{ scale: avatarScale }] },
              ]}
            />

            <Text style={styles.username}>{user.login}</Text>

            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

            <Animated.View
              style={[styles.statsRow, { opacity: statsOpacity }]}
            >
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.public_repos}</Text>
                <Text style={styles.statLabel}>Repos</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalStars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[styles.statsRow, { opacity: statsOpacity }]}
            >
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </Animated.View>

            <View style={styles.extraInfo}>
              <Text style={styles.infoText}>💻 Top Language: {topLanguage}</Text>

              <Text style={styles.infoText}>
                📅 Joined: {new Date(user.created_at).toDateString()}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#F0F2F5",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    elevation: 5,
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },

  profileCard: {
    marginTop: 25,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    elevation: 8,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },

  username: {
    fontSize: 22,
    fontWeight: "bold",
  },

  bio: {
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  statBox: {
    alignItems: "center",
    marginHorizontal: 20,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },

  statLabel: {
    color: "#555",
  },

  extraInfo: {
    marginTop: 15,
  },

  infoText: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
});