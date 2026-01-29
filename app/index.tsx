import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import CustomAlert from "../components/CustomAlert";

export default function Index() {
  const [alertVisible, setAlertVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
          }}
          style={styles.image}
        />
        <Text style={styles.title}>Welcome to GitHub Explorer</Text>
        <Text style={styles.subtitle}>
          Explore random repositories of any GitHub user instantly.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
          onPress={() => setAlertVisible(true)}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features:</Text>
        <Text style={styles.featureItem}>• Random GitHub repo fetch</Text>
        <Text style={styles.featureItem}>• Shows stars & forks</Text>
        <Text style={styles.featureItem}>• Description & repo link</Text>
        <Text style={styles.featureItem}>• Modern card UI & smooth UX</Text>
      </View>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
      />
    </View>
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
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  features: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
});
