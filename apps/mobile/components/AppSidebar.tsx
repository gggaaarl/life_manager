import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { accountInitial, type AccountProfile } from "@life-manager/shared/auth/account";

const COLORS = {
  panel: "#ffffff",
  sand: "#f7f7f8",
  line: "#ececee",
  ink: "#111118",
  muted: "#8b8d93",
  teal: "#5b4dff",
  dim: "rgba(17,17,24,0.3)",
};

type Props = {
  visible: boolean;
  account: AccountProfile;
  signingOut: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function AppSidebar({ visible, account, signingOut, onClose, onSignOut }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.drawer, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.drawerHead}>
            <Text style={styles.brand}>
              NATURALEZA<Text style={styles.brandAccent}>CRUEL</Text>
            </Text>
            <Pressable onPress={onClose}>
              <Text style={styles.muted}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={styles.profile}>
            {account.avatarUrl ? (
              <Image source={{ uri: account.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{accountInitial(account)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {account.name ?? "Cuenta"}
              </Text>
              {account.email ? (
                <Text style={styles.muted} numberOfLines={1}>
                  {account.email}
                </Text>
              ) : null}
            </View>
          </View>

          <Pressable
            style={styles.navItem}
            onPress={onClose}
          >
            <Text style={styles.navText}>Registrar ejercicio</Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable onPress={onSignOut} disabled={signingOut}>
            <Text style={styles.muted}>{signingOut ? "Saliendo…" : "Cerrar sesión"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.dim, flexDirection: "row" },
  drawer: {
    width: "78%",
    maxWidth: 320,
    backgroundColor: COLORS.panel,
    paddingHorizontal: 20,
  },
  drawerHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  brand: { fontSize: 13, fontWeight: "600", color: COLORS.ink, letterSpacing: -0.2 },
  brandAccent: { color: COLORS.teal },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.sand },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  muted: { color: COLORS.muted, fontSize: 13 },
  navItem: {
    backgroundColor: COLORS.sand,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navText: { fontSize: 15, fontWeight: "500", color: COLORS.ink },
});
