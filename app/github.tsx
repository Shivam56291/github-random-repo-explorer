import LottieView from "lottie-react-native";
import { useState } from "react";
import {
  Button,
  Linking,
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
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setRepo(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`
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

  return (
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
        <Button
          title="Get Random Repo"
          onPress={fetchRepo}
          disabled={loading}
        />
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
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <LottieView
            source={require("../assets/error-animation.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.error}>{error}</Text>
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
  repoDescription: { color: "#555", marginBottom: 15 },
  repoStats: { fontSize: 16, fontWeight: "600", color: "black", marginTop: 5 },
  repoLink: { fontSize: 14, color: "#007AFF", marginTop: 10 },
  lottie: { width: 150, height: 150, alignSelf: "center", marginTop: 20 },
});
