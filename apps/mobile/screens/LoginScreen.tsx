import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmail, signInWithGoogle } from "../lib/auth";

const COLORS = {
  sand: "#f7f7f8",
  ink: "#111118",
  muted: "#8b8d93",
  line: "#ececee",
  panel: "#ffffff",
  teal: "#5b4dff",
  mint: "#6d5ef5",
  danger: "#e11d48",
};

type Props = {
  busy: boolean;
  error: string | null;
  onBusy: (value: boolean) => void;
  onError: (value: string | null) => void;
};

export function LoginScreen({ busy, error, onBusy, onError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  async function handleEmail() {
    onError(null);
    setLoading("email");
    onBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(null);
      onBusy(false);
    }
  }

  async function handleGoogle() {
    onError(null);
    setLoading("google");
    onBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(null);
      onBusy(false);
    }
  }

  const disabled = busy || loading !== null;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandLine1}>NATURALEZA</Text>
          <Text style={styles.brandLine2}>CRUEL</Text>
        </View>

        <Text style={styles.title}>Inicio de sesión</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Dirección de email"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={styles.input}
        />

        <View style={styles.passwordWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.muted}
            secureTextEntry={!showPassword}
            textContentType="password"
            style={[styles.input, styles.passwordInput]}
          />
          <Pressable
            onPress={() => setShowPassword((value) => !value)}
            style={styles.eyeBtn}
            accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Text style={styles.eyeText}>{showPassword ? "Ocultar" : "Ver"}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryBtn, disabled && styles.disabled]}
          onPress={handleEmail}
          disabled={disabled}
        >
          <Text style={styles.primaryText}>
            {loading === "email" ? "Entrando…" : "Inicia sesión"}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>o</Text>
          <View style={styles.divider} />
        </View>

        <Pressable
          style={[styles.googleBtn, disabled && styles.disabled]}
          onPress={handleGoogle}
          disabled={disabled}
        >
          <GoogleIcon />
          <Text style={styles.googleText}>
            {loading === "google" ? "Redirigiendo…" : "Continuar con Google"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleMark}>
      <Text style={styles.googleMarkText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  glowTop: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 280,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(91,77,255,0.08)",
  },
  glowBottom: {
    position: "absolute",
    right: -50,
    bottom: -30,
    width: 240,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(109,94,245,0.06)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brandBlock: {
    marginBottom: 36,
  },
  brandLine1: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.ink,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  brandLine2: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.teal,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.ink,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.panel,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 12,
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 72,
    marginBottom: 12,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    height: 48,
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "500",
  },
  error: {
    borderWidth: 1,
    borderColor: "#fecdd3",
    backgroundColor: "#fff1f2",
    color: COLORS.danger,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.line,
  },
  dividerLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  googleBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.panel,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  googleMark: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  googleMarkText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.ink,
  },
  disabled: {
    opacity: 0.6,
  },
});
