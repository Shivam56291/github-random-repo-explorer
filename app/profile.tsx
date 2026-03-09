import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type User = {
  avatar_url: string;
  login: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

function ProfileSkeleton() {
  const opacity = useSharedValue(0.4);

  opacity.value = withTiming(1, {
    duration: 800,
    easing: Easing.inOut(Easing.ease),
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.profileCard, animatedStyle]}>
      <View style={styles.skeletonAvatar} />

      <View style={styles.skeletonLineLarge} />
      <View style={styles.skeletonLineSmall} />

      <View style={styles.skeletonStats}>
        <View style={styles.skeletonStatBox} />
        <View style={styles.skeletonStatBox} />
      </View>

      <View style={styles.skeletonStats}>
        <View style={styles.skeletonStatBox} />
        <View style={styles.skeletonStatBox} />
      </View>
    </Animated.View>
  );
}

export default function Profile() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [topLanguage, setTopLanguage] = useState("");
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Screen Animation */
  const screenOpacity = useSharedValue(0);
  const screenTranslate = useSharedValue(40);

  /* Profile Animations */
  const avatarScale = useSharedValue(0.7);
  const avatarOpacity = useSharedValue(0);

  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  const statsOpacity = useSharedValue(0);
  const statsTranslate = useSharedValue(15);

  const buttonScale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      screenOpacity.value = 0;
      screenTranslate.value = 40;

      screenOpacity.value = withTiming(1, {
        duration: 450,
        easing: Easing.out(Easing.cubic),
      });

      screenTranslate.value = withTiming(0, {
        duration: 450,
        easing: Easing.out(Easing.cubic),
      });
    }, []),
  );

  const startProfileAnimations = () => {
    avatarScale.value = 0.7;
    avatarOpacity.value = 0;
    cardOpacity.value = 0;
    cardScale.value = 0.95;
    statsOpacity.value = 0;
    statsTranslate.value = 15;

    avatarScale.value = withDelay(
      100,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.back(1.7)),
      }),
    );

    avatarOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));

    cardOpacity.value = withTiming(1, { duration: 400 });

    cardScale.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });

    statsOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    statsTranslate.value = withDelay(200, withTiming(0, { duration: 400 }));
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
        `https://api.github.com/users/${username}/repos`,
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

  /* Animated Styles */

  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslate.value }],
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslate.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>GitHub Profile Analyzer</Text>

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
              onPressIn={() =>
                (buttonScale.value = withTiming(0.94, { duration: 120 }))
              }
              onPressOut={() =>
                (buttonScale.value = withTiming(1, { duration: 150 }))
              }
              onPress={fetchProfile}
            >
              <Text style={styles.buttonText}>Analyze Profile</Text>
            </Pressable>
          </Animated.View>
        </View>

        {loading && <ProfileSkeleton />}

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        {user && !loading && (
          <Animated.View style={[styles.profileCard, cardStyle]}>
            <Animated.Image
              source={{ uri: user.avatar_url }}
              style={[styles.avatar, avatarStyle]}
            />

            <Text style={styles.username}>{user.login}</Text>

            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

            <Animated.View style={[styles.statsRow, statsStyle]}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.public_repos}</Text>
                <Text style={styles.statLabel}>Repos</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalStars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.statsRow, statsStyle]}>
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
              <Text style={styles.infoText}>
                💻 Top Language: {topLanguage}
              </Text>

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
    borderRadius: 16,
    elevation: 6,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
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
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
    elevation: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 12,
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
    marginTop: 16,
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
    marginTop: 16,
  },

  infoText: {
    fontSize: 14,
    color: "#333",
    marginTop: 6,
  },
  skeletonAvatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#e5e5e5",
    marginBottom: 16,
  },

  skeletonLineLarge: {
    width: 160,
    height: 18,
    backgroundColor: "#e5e5e5",
    borderRadius: 6,
    marginBottom: 10,
  },

  skeletonLineSmall: {
    width: 200,
    height: 14,
    backgroundColor: "#e5e5e5",
    borderRadius: 6,
    marginBottom: 20,
  },

  skeletonStats: {
    flexDirection: "row",
    marginTop: 12,
  },

  skeletonStatBox: {
    width: 70,
    height: 40,
    backgroundColor: "#e5e5e5",
    borderRadius: 10,
    marginHorizontal: 12,
  },
});
