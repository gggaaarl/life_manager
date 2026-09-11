import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { signOut } from "./lib/auth";
import { supabase } from "./lib/supabase";
import { LoginScreen } from "./screens/LoginScreen";
import { WorkoutScreen } from "./screens/WorkoutScreen";

const COLORS = {
  sand: "#f7f7f8",
  teal: "#5b4dff",
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppReady />
    </SafeAreaProvider>
  );
}

function AppReady() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setBusy(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar sesión.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }

  if (!session) {
    return (
      <>
        <LoginScreen
          busy={busy}
          error={error}
          onBusy={setBusy}
          onError={setError}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <WorkoutScreen
        userId={session.user.id}
        email={session.user.email}
        onSignOut={handleSignOut}
        signingOut={busy}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.sand,
  },
});
