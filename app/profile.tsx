import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";

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

  const fetchProfile = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setUser(null);

    try {
      const userRes = await fetch(
        `https://api.github.com/users/${username}`
      );
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
          languages[repo.language] =
            (languages[repo.language] || 0) + 1;
        }
      });

      const mostUsed =
        Object.keys(languages).sort(
          (a, b) => languages[b] - languages[a]
        )[0] || "N/A";

      setUser(userData);
      setTotalStars(stars);
      setTopLanguage(mostUsed);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
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

        <Pressable style={styles.button} onPress={fetchProfile}>
          <Text style={styles.buttonText}>Analyze Profile</Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}

      {/* Error */}
      {error !== "" && (
        <Text style={styles.error}>{error}</Text>
      )}

      {/* Profile Result */}
      {user && !loading && (
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user.avatar_url }}
            style={styles.avatar}
          />

          <Text style={styles.username}>{user.login}</Text>

          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {user.public_repos}
              </Text>
              <Text style={styles.statLabel}>Repos</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {totalStars}
              </Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {user.followers}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {user.following}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <View style={styles.extraInfo}>
            <Text style={styles.infoText}>
              💻 Top Language: {topLanguage}
            </Text>

            <Text style={styles.infoText}>
              📅 Joined:{" "}
              {new Date(user.created_at).toDateString()}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
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
    borderRadius: 12,
    elevation: 4,
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
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
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