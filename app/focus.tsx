import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const BREAK_TIME = 5 * 60;

const quotes = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  {
    text: "Programs must be written for people to read.",
    author: "Harold Abelson",
  },
  {
    text: "First solve the problem, then write the code.",
    author: "John Johnson",
  },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
];

export default function Focus() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  /* animations */

  const screenOpacity = useSharedValue(0);
  const timerScale = useSharedValue(0.8);

  const quoteOpacity = useSharedValue(1);
  const quoteTranslate = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      screenOpacity.value = 0;
      timerScale.value = 0.8;

      screenOpacity.value = withTiming(1, { duration: 400 });
      timerScale.value = withSpring(1);
    }, []),
  );

  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value,
  }));

  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const quoteAnimatedStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteTranslate.value }],
  }));

  /* storage */

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const saved = await AsyncStorage.getItem("pomodoro_sessions");
    if (saved) setSessions(parseInt(saved));
  };

  const saveSessions = async (value: number) => {
    setSessions(value);
    await AsyncStorage.setItem("pomodoro_sessions", value.toString());
  };

  /* timer */

  useEffect(() => {
    let timer: any;

    if (running) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);

            if (!isBreak) {
              const newSessions = sessions + 1;
              saveSessions(newSessions);
            }

            setIsBreak(!isBreak);

            return isBreak ? focusMinutes * 60 : BREAK_TIME;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, isBreak, sessions, focusMinutes]);

  /* helpers */

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  /* quote animation */

  const changeQuote = () => {
    quoteOpacity.value = withTiming(0, { duration: 200 });
    quoteTranslate.value = withTiming(-10, { duration: 200 });

    setTimeout(() => {
      const random = Math.floor(Math.random() * quotes.length);
      setQuoteIndex(random);

      quoteTranslate.value = 10;
      quoteOpacity.value = 0;

      quoteOpacity.value = withTiming(1, { duration: 300 });
      quoteTranslate.value = withTiming(0, { duration: 300 });
    }, 200);
  };

  /* adjust time */

  const increaseTime = () => {
    if (focusMinutes >= 60) return;

    const newTime = focusMinutes + 5;

    setFocusMinutes(newTime);
    setTimeLeft(newTime * 60);
  };

  const decreaseTime = () => {
    if (focusMinutes <= 5) return;

    const newTime = focusMinutes - 5;

    setFocusMinutes(newTime);
    setTimeLeft(newTime * 60);
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>Dev Mode</Text>

      {/* TIMER CARD */}

      <View style={styles.card}>
        <Text style={styles.label}>
          {isBreak ? "Break Time ☕" : "Focus Session ⏱"}
        </Text>

        <View style={styles.adjustRow}>
          <Pressable style={styles.adjustBtn} onPress={decreaseTime}>
            <Text style={styles.adjustText}>−</Text>
          </Pressable>

          <Text style={styles.minutes}>{focusMinutes} min</Text>

          <Pressable style={styles.adjustBtn} onPress={increaseTime}>
            <Text style={styles.adjustText}>+</Text>
          </Pressable>
        </View>

        <Animated.Text style={[styles.timer, timerStyle]}>
          {formatTime(timeLeft)}
        </Animated.Text>

        <View style={styles.buttonRow}>
          <Pressable onPress={() => setRunning(!running)}>
            <LinearGradient
              colors={["#007AFF", "#005BBB"]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {running ? "Pause" : "Start"}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => {
              setRunning(false);
              setIsBreak(false);
              setTimeLeft(focusMinutes * 60);
            }}
          >
            <LinearGradient
              colors={["#FF5F6D", "#FF2D55"]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.sessionText}>🔥 Sessions Today: {sessions}</Text>
      </View>

      {/* QUOTE CARD */}

      <Animated.View style={[styles.quoteCard, quoteAnimatedStyle]}>
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteEmoji}></Text>
          <Text style={styles.quoteTitle}>Developer Motivation</Text>
        </View>

        <Text style={styles.quoteText}>“{quotes[quoteIndex].text}”</Text>

        <Text style={styles.quoteAuthor}>— {quotes[quoteIndex].author}</Text>

        <Pressable style={styles.quoteButton} onPress={changeQuote}>
          <Text style={styles.quoteButtonText}>New Quote</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2F4F7",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 22,
    alignItems: "center",
    elevation: 10,
    marginBottom: 22,
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  adjustRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  adjustBtn: {
    backgroundColor: "#EAF3FF",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  adjustText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007AFF",
  },

  minutes: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "600",
  },

  timer: {
    fontSize: 52,
    fontWeight: "800",
    color: "#007AFF",
    marginVertical: 15,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 14,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  sessionText: {
    marginTop: 14,
    color: "#555",
  },

  quoteCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 22,
    elevation: 8,
  },

  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  quoteEmoji: {
    fontSize: 20,
    marginRight: 6,
  },

  quoteTitle: {
    fontWeight: "700",
    fontSize: 16,
  },

  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 10,
    color: "#333",
  },

  quoteAuthor: {
    color: "#666",
    marginBottom: 16,
  },

  quoteButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF3FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  quoteButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
