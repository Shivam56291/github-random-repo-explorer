import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";

type DayEntry = {
  date: string;
  solved: number;
};

export default function Tracker() {
  const [solvedToday, setSolvedToday] = useState("");
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [isSavedToday, setIsSavedToday] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* Shared Values */
  const screenOpacity = useSharedValue(0);
  const screenTranslate = useSharedValue(40);
  const buttonScale = useSharedValue(1);

  /* ------------------ LOAD DATA ------------------ */
  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      screenOpacity.value = 0;
      screenTranslate.value = 40;

      screenOpacity.value = withTiming(1, { duration: 450 });
      screenTranslate.value = withSpring(0, { damping: 14, stiffness: 100 });
    }, [])
  );

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
        setIsSavedToday(true);
      } else {
        setIsSavedToday(false);
      }
    }
  };

  const saveData = async (data: DayEntry[]) => {
    setEntries(data);
    await AsyncStorage.setItem("coding_entries", JSON.stringify(data));
  };

  const addEntry = async () => {
    if (!solvedToday || isSavedToday) return;

    buttonScale.value = withSpring(0.9, { damping: 10, stiffness: 200 }, () => {
      buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });

    const newEntry = {
      date: today,
      solved: parseInt(solvedToday),
    };

    const filtered = entries.filter((e) => e.date !== today);
    const updated = [...filtered, newEntry];

    await saveData(updated);
    setIsSavedToday(true);
  };

  /* ------------------ STREAK LOGIC ------------------ */
  const calculateStreak = (data: DayEntry[]) => {
    const sorted = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let currentStreak = 0;
    let currentDate = new Date();

    for (let entry of sorted) {
      const entryDate = new Date(entry.date);
      const diff =
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

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

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslate.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <Animated.ScrollView
      style={[styles.container, containerStyle]}
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

        <Animated.View style={buttonStyle}>
          <Pressable 
            onPressIn={() => !isSavedToday && (buttonScale.value = withSpring(0.96, { damping: 10, stiffness: 200 }))}
            onPressOut={() => !isSavedToday && (buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 }))}
            onPress={addEntry} 
            disabled={isSavedToday}
          >
            <LinearGradient
              colors={
                isSavedToday ? ["#B0B0B0", "#999999"] : ["#007AFF", "#005BBB"]
              }
              style={[styles.button, isSavedToday && { opacity: 0.8 }]}
            >
              <Text style={styles.buttonText}>
                {isSavedToday ? "Saved for Today ✓" : "Save Progress"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {isSavedToday && (
          <Text style={styles.savedMessage}>
            Today's progress already recorded. Come back tomorrow !
          </Text>
        )}
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
              <AnimatedBar key={index} value={entry.solved} index={index} />
            ))}
          </View>
        )}
      </View>
    </Animated.ScrollView>
  );
}

/* ------------------ PREMIUM STAT CARD ------------------ */
function PremiumStatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ------------------ ANIMATED BAR ------------------ */
function AnimatedBar({ value, index }: { value: number; index?: number }) {
  const heightAnim = useSharedValue(0);

  useEffect(() => {
    heightAnim.value = withDelay(
      (index || 0) * 50,
      withSpring(Math.min(value * 12, 120), { damping: 12, stiffness: 100 })
    );
  }, [value, index]);

  const barStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
  }));

  return (
    <View style={styles.graphBarContainer}>
      <Animated.View style={[styles.graphBar, barStyle]} />
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
  savedMessage: {
    marginTop: 10,
    fontSize: 13,
    color: "#28A745",
    textAlign: "center",
    fontWeight: "500",
  },
  graphCard: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20,
    elevation: 8,
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
