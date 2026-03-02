import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type DayEntry = {
  date: string;
  solved: number;
};

export default function Tracker() {
  const [solvedToday, setSolvedToday] = useState("");
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [streak, setStreak] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleButton = useRef(new Animated.Value(1)).current;

  const today = new Date().toISOString().split("T")[0];

  /* ------------------ LOAD DATA ------------------ */
  useEffect(() => {
    loadData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  useEffect(() => {
    calculateStreak(entries);
  }, [entries]);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem("coding_entries");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);

      const todayEntry = parsed.find((e: DayEntry) => e.date === today);
      if (todayEntry) {
        setSolvedToday(String(todayEntry.solved));
      }
    }
  };

  const saveData = async (data: DayEntry[]) => {
    setEntries(data);
    await AsyncStorage.setItem("coding_entries", JSON.stringify(data));
  };

  const addEntry = async () => {
    if (!solvedToday) return;

    Animated.sequence([
      Animated.timing(scaleButton, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleButton, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const newEntry = {
      date: today,
      solved: parseInt(solvedToday),
    };

    const filtered = entries.filter((e) => e.date !== today);
    const updated = [...filtered, newEntry];

    await saveData(updated);
  };

  /* ------------------ STREAK LOGIC ------------------ */
  const calculateStreak = (data: DayEntry[]) => {
    const sorted = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let currentDate = new Date();

    for (let entry of sorted) {
      const entryDate = new Date(entry.date);
      const diff =
        (currentDate.getTime() - entryDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (Math.floor(diff) === 0 || Math.floor(diff) === 1) {
        currentStreak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const totalSolved = entries.reduce((sum, e) => sum + e.solved, 0);

  const last7 = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Coding Progress Tracker</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <PremiumStatCard label="Total Solved" value={totalSolved} />
        <PremiumStatCard label="Day Streak 🔥" value={streak} />
      </View>

      {/* Input Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Problems Solved Today</Text>
        <TextInput
          value={solvedToday}
          onChangeText={setSolvedToday}
          keyboardType="numeric"
          placeholder="Enter number"
          style={styles.input}
        />

        <Animated.View style={{ transform: [{ scale: scaleButton }] }}>
          <Pressable onPress={addEntry}>
            <LinearGradient
              colors={["#007AFF", "#005BBB"]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Save Progress</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {/* Graph Section */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Last 7 Days</Text>

        {last7.length === 0 ? (
          <Text style={styles.emptyText}>
            No data yet. Start solving problems today 🚀
          </Text>
        ) : (
          <View style={styles.graphRow}>
            {last7.map((entry, index) => (
              <AnimatedBar key={index} value={entry.solved} />
            ))}
          </View>
        )}
      </View>
    </Animated.ScrollView>
  );
}

/* ------------------ PREMIUM STAT CARD ------------------ */
function PremiumStatCard({ label, value }: { label: string; value: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={styles.statCard}>
      <Animated.Text style={styles.statNumber}>
        {animatedValue.interpolate({
          inputRange: [0, value || 1],
          outputRange: [0, value || 1],
        })}
      </Animated.Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ------------------ ANIMATED BAR ------------------ */
function AnimatedBar({ value }: { value: number }) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: Math.min(value * 12, 120),
      friction: 6,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.graphBarContainer}>
      <Animated.View style={[styles.graphBar, { height: heightAnim }]} />
      <Text style={styles.graphLabel}>{value}</Text>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#007AFF",
  },
  statLabel: {
    marginTop: 6,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    marginBottom: 25,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  graphCard: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  graphTitle: {
    fontWeight: "700",
    marginBottom: 15,
    fontSize: 16,
  },
  graphRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
  },
  graphBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  graphBar: {
    width: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  graphLabel: {
    marginTop: 6,
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 10,
  },
});