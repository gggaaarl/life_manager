import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "../lib/auth";

const COLORS = {
  sand: "#f7f7f8",
  ink: "#111118",
  muted: "#8b8d93",
  line: "#ececee",
  panel: "#ffffff",
  teal: "#5b4dff",
  danger: "#e11d48",
};

type Mode = "signin" | "signup";

type Props = {
  busy: boolean;
  error: string | null;
  onBusy: (value: boolean) => void;
  onError: (value: string | null) => void;
};

export function LoginScreen({ busy, error, onBusy, onError }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  async function handleEmail() {
    onError(null);
    setInfo(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      onError("Escribe email y contraseña.");
      return;
    }
    if (password.length < 6) {
      onError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading("email");
    onBusy(true);
    try {
      if (mode === "signup") {
        const result = await signUpWithEmail(trimmedEmail, password);
        if (result === "confirm") {
          setInfo("Te enviamos un correo de confirmación. Ábrelo y luego inicia sesión.");
          setMode("signin");
          setPassword("");
        }
        return;
      }
      await signInWithEmail(trimmedEmail, password);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(null);
      onBusy(false);
    }
  }

  async function handleGoogle() {
    onError(null);
    setInfo(null);
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

        <Text style={styles.title}>{mode === "signup" ? "Crear cuenta" : "Inicio de sesión"}</Text>

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
            textContentType={mode === "signup" ? "newPassword" : "password"}
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

        {mode === "signup" ? (
          <Text style={styles.hint}>Mínimo 6 caracteres. Te llegará un correo para confirmar.</Text>
        ) : null}

        {info ? <Text style={styles.info}>{info}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryBtn, disabled && styles.disabled]}
          onPress={handleEmail}
          disabled={disabled}
        >
          <Text style={styles.primaryText}>
            {loading === "email"
              ? mode === "signup"
                ? "Creando…"
                : "Entrando…"
              : mode === "signup"
                ? "Crear cuenta"
                : "Inicia sesión"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setMode((current) => (current === "signup" ? "signin" : "signup"));
            onError(null);
            setInfo(null);
          }}
          disabled={disabled}
        >
          <Text style={styles.switchMode}>
            {mode === "signup" ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Crear cuenta"}
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
  hint: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 12,
  },
  info: {
    borderWidth: 1,
    borderColor: "rgba(91,77,255,0.25)",
    backgroundColor: "rgba(91,77,255,0.08)",
    color: COLORS.teal,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
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
  switchMode: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
    color: COLORS.teal,
    fontWeight: "500",
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
