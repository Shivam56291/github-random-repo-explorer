import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
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

  /* Reanimated Shared Values */
  const screenOpacity = useSharedValue(0);
  const screenTranslate = useSharedValue(40);

  const avatarScale = useSharedValue(0.7);
  const cardOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      // Reset
      screenOpacity.value = 0;
      screenTranslate.value = 40;

      // Premium Entrance
      screenOpacity.value = withTiming(1, { duration: 400 });
      screenTranslate.value = withSpring(0, { damping: 14, stiffness: 100 });
    }, [])
  );

  const startProfileAnimations = () => {
    avatarScale.value = 0.7;
    cardOpacity.value = 0;
    statsOpacity.value = 0;

    // Trigger animations
    avatarScale.value = withSpring(1, { damping: 10, stiffness: 120 });
    cardOpacity.value = withTiming(1, { duration: 400 });
    statsOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
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

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslate.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const profileCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const statsRowStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  return (
    <Animated.View style={containerStyle}>
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

          <Animated.View style={buttonStyle}>
            <Pressable
              style={styles.button}
              onPressIn={() => (buttonScale.value = withSpring(0.96, { damping: 10, stiffness: 200 }))}
              onPressOut={() => (buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 }))}
              onPress={fetchProfile}
            >
              <Text style={styles.buttonText}>Analyze Profile</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Loading */}
        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 25 }} />
        )}

        {/* Error */}
        {error !== "" && <Text style={styles.error}>{error}</Text>}

        {/* Profile Result */}
        {user && !loading && (
          <Animated.View style={[styles.profileCard, profileCardStyle]}>
            <Animated.Image
              source={{ uri: user.avatar_url }}
              style={[styles.avatar, avatarStyle]}
            />

            <Text style={styles.username}>{user.login}</Text>

            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

            <Animated.View style={[styles.statsRow, statsRowStyle]}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.public_repos}</Text>
                <Text style={styles.statLabel}>Repos</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalStars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.statsRow, statsRowStyle]}>
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