import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import { signInWithGoogle, signOut } from "./lib/auth";
import { supabase } from "./lib/supabase";

const COLORS = {
  void: "#060806",
  sand: "#0a0d08",
  panel: "#0e120c",
  line: "#1e2419",
  ink: "#e8ede4",
  muted: "#8a9580",
  sage: "#a3b18a",
  sageDark: "#7d9168",
  danger: "#e07a7a",
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);

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

  useEffect(() => {
    if (!session?.user) {
      setShowPlayerMenu(false);
      return;
    }

    getProfileAccess(supabase, session.user.id).then((profile) => {
      setShowPlayerMenu(canAccessPlayerMenu(profile, session.user.id));
    });
  }, [session]);

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

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
      <View style={[styles.centered, styles.screen]}>
        <ActivityIndicator size="large" color={COLORS.sageDark} />
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loginWrap}>
          <Text style={styles.brandLine1}>NATURALEZA</Text>
          <Text style={styles.brandLine2}>CRUEL</Text>
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              {busy ? "Conectando..." : "Continuar con Google"}
            </Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>HUB</Text>
        <Text style={styles.brandLine1}>NATURALEZA</Text>
        <Text style={styles.brandLine2Small}>CRUEL</Text>
        <Text style={styles.email}>{session.user.email}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jobs activos</Text>
          <Text style={styles.cardBody}>TRAINEE · DRIVER · PLAYER según tu perfil.</Text>
        </View>

        {showPlayerMenu ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Salidas</Text>
            <Text style={styles.cardBody}>
              Módulo PLAYER disponible en web. Misma base de datos.
            </Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.buttonOutline, busy && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={busy}
        >
          <Text style={styles.buttonOutlineText}>Cerrar sesión</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <StatusBar style="light" />
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
    padding: 24,
  },
  loginWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  kicker: {
    color: COLORS.sageDark,
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 12,
  },
  brandLine1: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  brandLine2: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.sage,
    letterSpacing: -0.5,
    marginBottom: 28,
  },
  brandLine2Small: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.sage,
    marginTop: -8,
    marginBottom: 4,
  },
  email: {
    color: COLORS.muted,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.ink,
  },
  cardBody: {
    color: COLORS.muted,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.sageDark,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.void,
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonOutlineText: {
    color: COLORS.muted,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    color: COLORS.danger,
    marginTop: 12,
    textAlign: "center",
  },
});
