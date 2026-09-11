import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addExerciseToDay,
  addSet,
  addSubset,
  changeSetKind,
  createAndAddExercise,
  deleteEntry,
  deleteSetRow,
  listCatalogExercises,
  loadWorkoutDay,
  reorderDayEntry,
  updateSetFields,
} from "@life-manager/shared/workout/api";
import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_COLORS,
  MUSCLE_GROUP_LABELS,
  SET_KINDS,
  SET_KIND_LABELS,
  isSpecialSetKind,
  shiftDate,
  todayInLima,
  type MuscleGroup,
} from "@life-manager/shared/workout/constants";
import {
  applySetFields,
  exerciseMuscles,
  formatSetLabel,
  groupByMuscle,
  moveEntryToPosition,
  numberToInput,
  orderedEntries,
  sessionSetSummary,
  parseOptionalInt,
  parseOptionalNumber,
  parseOptionalRir,
  type CatalogExercise,
  type WorkoutEntryView,
} from "@life-manager/shared/workout/logic";
import type { AccountProfile } from "@life-manager/shared/auth/account";
import { AppSidebar } from "../components/AppSidebar";
import { supabase } from "../lib/supabase";

const COLORS = {
  sand: "#f7f7f8",
  panel: "#ffffff",
  line: "#ececee",
  ink: "#111118",
  muted: "#8b8d93",
  sage: "#6d5ef5",
  sageDark: "#5b4dff",
  danger: "#e11d48",
};

function formatDayLabel(dateYmd: string): string {
  const [year, month, day] = dateYmd.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

type Props = {
  userId: string;
  account: AccountProfile;
  onSignOut: () => void;
  signingOut: boolean;
};

export function WorkoutScreen({ userId, account, onSignOut, signingOut }: Props) {
  const [date, setDate] = useState(todayInLima);
  const [catalog, setCatalog] = useState<CatalogExercise[]>([]);
  const [entries, setEntries] = useState<WorkoutEntryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const reloadDay = useCallback(async () => {
    const nextEntries = await loadWorkoutDay(supabase, userId, date);
    setEntries(nextEntries);
  }, [date, userId]);

  const reloadCatalog = useCallback(async () => {
    const nextCatalog = await listCatalogExercises(supabase);
    setCatalog(nextCatalog);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    reloadDay()
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el día.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadDay]);

  useEffect(() => {
    let cancelled = false;
    reloadCatalog().catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el catálogo.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reloadCatalog]);

  async function run(action: () => Promise<void>, options?: { refreshCatalog?: boolean; refreshDay?: boolean }) {
    setError(null);
    try {
      await action();
      if (options?.refreshDay !== false) {
        await reloadDay();
      }
      if (options?.refreshCatalog) {
        await reloadCatalog();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  function onSetFieldsChange(
    setId: string,
    fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
  ) {
    setEntries((current) => applySetFields(current, setId, fields));
  }

  async function onReorderEntry(entryId: string, position: number) {
    setEntries((current) => moveEntryToPosition(current, entryId, position));
    await run(() => reorderDayEntry(supabase, entryId, position));
  }

  const listed = orderedEntries(entries);
  const setSummary = sessionSetSummary(entries);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.hamburger}
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Abrir menú"
        >
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
        </Pressable>
        <Text style={styles.brand}>
          NATURALEZA<Text style={styles.brandAccent}>CRUEL</Text>
        </Text>
        <View style={styles.hamburger} />
      </View>
      <AppSidebar
        visible={menuOpen}
        account={account}
        signingOut={signingOut}
        onClose={() => setMenuOpen(false)}
        onSignOut={onSignOut}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateBtn} onPress={() => setDate((value) => shiftDate(value, -1))}>
            <Text style={styles.dateBtnText}>‹</Text>
          </Pressable>
          <View style={styles.dateCenter}>
            <Text style={styles.title}>Entrenamiento</Text>
            <Text style={styles.email}>{formatDayLabel(date)}</Text>
          </View>
          <Pressable style={styles.dateBtn} onPress={() => setDate((value) => shiftDate(value, 1))}>
            <Text style={styles.dateBtnText}>›</Text>
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color={COLORS.sageDark} style={{ marginTop: 24 }} /> : null}

        {!loading && entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>Todavía no hay ejercicios en este día.</Text>
          </View>
        ) : null}

        {!loading && entries.length > 0 ? (
          <View>
            <Text style={styles.summaryTotal}>
              Volumen sistemático del día: {setSummary.total}
            </Text>
            <Text style={styles.muted}>
              {setSummary.byMuscle.map((group) => `${group.label} ${group.sets}`).join(" · ")}
            </Text>
          </View>
        ) : null}

        {listed.map((entry, index) => (
          <ExerciseCard
            key={entry.id}
            number={index + 1}
            entry={entry}
            onRun={run}
            onSetFieldsChange={onSetFieldsChange}
            onReorderEntry={onReorderEntry}
          />
        ))}

        <Pressable style={styles.primary} onPress={() => setPickerOpen(true)}>
          <Text style={styles.primaryText}>Agregar ejercicio</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <AddExerciseModal
        visible={pickerOpen}
        catalog={catalog}
        usedIds={new Set(entries.map((entry) => entry.exerciseId))}
        onClose={() => setPickerOpen(false)}
        onPick={(exerciseId) =>
          run(async () => {
            await addExerciseToDay(supabase, userId, date, exerciseId);
            setPickerOpen(false);
          })
        }
        onCreate={(name, muscleGroups) =>
          run(
            async () => {
              await createAndAddExercise(supabase, userId, date, name, muscleGroups);
              setPickerOpen(false);
            },
            { refreshCatalog: true },
          )
        }
      />
    </View>
  );
}

type RunFn = (
  action: () => Promise<void>,
  options?: { refreshCatalog?: boolean; refreshDay?: boolean },
) => Promise<void>;

function MuscleBadges({
  item,
}: {
  item: { muscleGroup: MuscleGroup; muscleGroups?: MuscleGroup[] };
}) {
  return (
    <View style={styles.badgeRow}>
      {exerciseMuscles(item).map((group) => (
        <View key={group} style={[styles.badge, { backgroundColor: MUSCLE_GROUP_COLORS[group] }]}>
          <Text style={styles.badgeText}>{MUSCLE_GROUP_LABELS[group]}</Text>
        </View>
      ))}
    </View>
  );
}

function ExerciseCard({
  number,
  entry,
  onRun,
  onSetFieldsChange,
  onReorderEntry,
}: {
  number: number;
  entry: WorkoutEntryView;
  onRun: RunFn;
  onSetFieldsChange: (
    setId: string,
    fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
  ) => void;
  onReorderEntry: (entryId: string, position: number) => Promise<void>;
}) {
  const [orderText, setOrderText] = useState(String(number));

  useEffect(() => {
    setOrderText(String(number));
  }, [number]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.titleRow}>
            <TextInput
              value={orderText}
              onChangeText={setOrderText}
              onBlur={() => {
                const next = Number.parseInt(orderText, 10);
                if (!Number.isInteger(next) || next === number) {
                  setOrderText(String(number));
                  return;
                }
                void onReorderEntry(entry.id, next);
              }}
              keyboardType="number-pad"
              style={styles.orderInput}
            />
            <Text style={styles.cardTitle}>{entry.exerciseName}</Text>
          </View>
          <MuscleBadges item={entry} />
        </View>
        <Pressable onPress={() => onRun(() => deleteEntry(supabase, entry.id))}>
          <Text style={styles.muted}>Quitar</Text>
        </Pressable>
      </View>
      <View style={styles.tableHead}>
        <Text style={[styles.headCell, styles.colSet]}>Set</Text>
        <Text style={styles.headCell}>kg</Text>
        <Text style={styles.headCell}>Reps</Text>
        <Text style={styles.headCell}>RIR</Text>
        <Text style={[styles.headCell, styles.colKind]}>Tipo</Text>
      </View>

      {entry.sets.map((set) => (
        <SetEditor
          key={set.id}
          entryId={entry.id}
          sets={entry.sets}
          set={set}
          onRun={onRun}
          onSetFieldsChange={onSetFieldsChange}
        />
      ))}

      <Pressable onPress={() => onRun(() => addSet(supabase, entry.id))}>
        <Text style={styles.link}>+ Agregar set</Text>
      </Pressable>
    </View>
  );
}

function SetEditor({
  entryId,
  sets,
  set,
  onRun,
  onSetFieldsChange,
}: {
  entryId: string;
  sets: WorkoutEntryView["sets"];
  set: WorkoutEntryView["sets"][number];
  onRun: RunFn;
  onSetFieldsChange: (
    setId: string,
    fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
  ) => void;
}) {
  const [weight, setWeight] = useState(numberToInput(set.weightKg));
  const [reps, setReps] = useState(numberToInput(set.reps));
  const [rir, setRir] = useState(numberToInput(set.rir));

  useEffect(() => {
    setWeight(numberToInput(set.weightKg));
    setReps(numberToInput(set.reps));
    setRir(numberToInput(set.rir));
  }, [set.id, set.weightKg, set.reps, set.rir]);

  const special = isSpecialSetKind(set.setKind);
  const isLastSubset =
    special &&
    set.subsetNumber ===
      Math.max(...sets.filter((row) => row.setNumber === set.setNumber).map((row) => row.subsetNumber));

  function live(nextWeight: string, nextReps: string, nextRir: string) {
    try {
      onSetFieldsChange(set.id, {
        weightKg: parseOptionalNumber(nextWeight),
        reps: parseOptionalInt(nextReps),
        rir: parseOptionalRir(nextRir),
      });
    } catch {
      return;
    }
  }

  function save() {
    try {
      const fields = {
        weightKg: parseOptionalNumber(weight),
        reps: parseOptionalInt(reps),
        rir: parseOptionalRir(rir),
      };
      onSetFieldsChange(set.id, fields);
      void onRun(() => updateSetFields(supabase, set.id, fields), { refreshDay: false });
    } catch {
      return;
    }
  }

  return (
    <View style={styles.setBox}>
      <View style={styles.setRow}>
        <Text style={[styles.setNumber, styles.colSet]}>{formatSetLabel(sets, set)}</Text>
        <TextInput
          value={weight}
          onChangeText={(value) => {
            setWeight(value);
            live(value, reps, rir);
          }}
          onBlur={save}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={COLORS.muted}
          style={styles.cellInput}
        />
        <TextInput
          value={reps}
          onChangeText={(value) => {
            setReps(value);
            live(weight, value, rir);
          }}
          onBlur={save}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={COLORS.muted}
          style={styles.cellInput}
        />
        <TextInput
          value={rir}
          onChangeText={(value) => {
            setRir(value);
            live(weight, reps, value);
          }}
          onBlur={save}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={COLORS.muted}
          style={styles.cellInput}
        />
        <Pressable
          style={styles.colKind}
          onPress={() => {
            const next = SET_KINDS[(SET_KINDS.indexOf(set.setKind) + 1) % SET_KINDS.length];
            void onRun(() => changeSetKind(supabase, entryId, set.setNumber, next));
          }}
        >
          <Text style={styles.kindCurrent}>{SET_KIND_LABELS[set.setKind]}</Text>
        </Pressable>
        <Pressable onPress={() => onRun(() => deleteSetRow(supabase, set.id))}>
          <Text style={styles.muted}>✕</Text>
        </Pressable>
      </View>
      {isLastSubset ? (
        <Pressable onPress={() => onRun(() => addSubset(supabase, entryId, set.setNumber))}>
          <Text style={styles.link}>
            + Sub set {set.setNumber}.{set.subsetNumber + 1}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function AddExerciseModal({
  visible,
  catalog,
  usedIds,
  onClose,
  onPick,
  onCreate,
}: {
  visible: boolean;
  catalog: CatalogExercise[];
  usedIds: Set<string>;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
  onCreate: (name: string, muscleGroups: MuscleGroup[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(["pecho"]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = catalog.filter((item) => !usedIds.has(item.id));
    const filtered = q ? pool.filter((item) => item.name.toLowerCase().includes(q)) : pool;
    return groupByMuscle(filtered);
  }, [catalog, query, usedIds]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.cardTitle}>Agregar ejercicio</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.muted}>Cerrar</Text>
          </Pressable>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar…"
          placeholderTextColor={COLORS.muted}
          style={[styles.input, { marginHorizontal: 16, marginBottom: 8 }]}
        />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {grouped.map((group) => (
            <View key={group.muscleGroup} style={{ marginBottom: 16 }}>
              <Text style={styles.groupTitle}>{group.label}</Text>
              {group.items.map((exercise) => (
                <Pressable key={exercise.id} style={styles.pickRow} onPress={() => onPick(exercise.id)}>
                  <Text style={styles.pickText}>{exercise.name}</Text>
                  <MuscleBadges item={exercise} />
                </Pressable>
              ))}
            </View>
          ))}

          <Text style={styles.groupTitle}>Nuevo ejercicio</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
          <ScrollView horizontal style={{ marginVertical: 8 }}>
            {MUSCLE_GROUPS.map((group) => (
              <Pressable
                key={group}
                style={[styles.kindChip, muscleGroups.includes(group) && { backgroundColor: MUSCLE_GROUP_COLORS[group] }]}
                onPress={() => {
                  setMuscleGroups((current) => {
                    if (current.includes(group)) {
                      const next = current.filter((item) => item !== group);
                      return next.length > 0 ? next : current;
                    }
                    return [...current, group];
                  });
                }}
              >
                <Text style={[styles.kindText, muscleGroups.includes(group) && styles.kindTextActive]}>
                  {MUSCLE_GROUP_LABELS[group]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.primary} onPress={() => onCreate(name, muscleGroups)}>
            <Text style={styles.primaryText}>Crear</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.panel },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  hamburger: { width: 36, height: 36, justifyContent: "center", gap: 5 },
  hamburgerBar: { height: 2, width: 20, backgroundColor: COLORS.ink, borderRadius: 1 },
  brand: { fontSize: 13, fontWeight: "600", color: COLORS.ink, letterSpacing: -0.2 },
  brandAccent: { color: COLORS.sageDark },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 18 },
  title: { fontSize: 17, fontWeight: "600", color: COLORS.ink, letterSpacing: -0.3 },
  summaryTotal: { fontSize: 15, fontWeight: "600", color: COLORS.ink, marginBottom: 4 },
  email: { color: COLORS.muted, fontSize: 13, textAlign: "center" },
  dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateCenter: { alignItems: "center" },
  dateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBtnText: { fontSize: 22, color: COLORS.ink },
  empty: { paddingVertical: 48, alignItems: "center" },
  group: { gap: 16 },
  groupTitle: { fontSize: 13, fontWeight: "500", color: COLORS.muted, marginBottom: 2 },
  card: { gap: 0 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  orderInput: {
    width: 32,
    height: 32,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.ink,
    backgroundColor: COLORS.sand,
    borderRadius: 6,
    paddingVertical: 0,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.ink, letterSpacing: -0.2, flex: 1 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  tableHead: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.line, paddingBottom: 6 },
  headCell: { flex: 1, fontSize: 11, fontWeight: "500", color: COLORS.muted, textAlign: "center" },
  colSet: { width: 36, flex: 0, textAlign: "left" },
  colKind: { width: 72, flex: 0, alignItems: "center" },
  setBox: { borderBottomWidth: 1, borderBottomColor: COLORS.line },
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, gap: 2 },
  setNumber: { fontWeight: "500", color: COLORS.ink, fontSize: 15 },
  cellInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    color: COLORS.ink,
    paddingVertical: 8,
  },
  kindCurrent: { fontSize: 12, color: COLORS.ink, textAlign: "center" },
  input: {
    backgroundColor: COLORS.sand,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.ink,
    fontSize: 15,
  },
  kindChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.sand,
    marginRight: 6,
  },
  kindChipActive: { backgroundColor: COLORS.sageDark },
  kindText: { fontSize: 12, color: COLORS.ink },
  kindTextActive: { color: "#fff", fontWeight: "600" },
  link: { color: COLORS.sageDark, fontWeight: "600", textAlign: "center", paddingVertical: 10, fontSize: 14 },
  muted: { color: COLORS.muted, fontSize: 13 },
  primary: {
    backgroundColor: COLORS.sageDark,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  outline: { paddingVertical: 14, alignItems: "center" },
  outlineText: { color: COLORS.muted, fontWeight: "500" },
  error: { color: COLORS.danger, textAlign: "center" },
  modal: { flex: 1, backgroundColor: COLORS.panel, paddingTop: 48 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pickRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  pickText: { color: COLORS.ink, fontSize: 15 },
});
