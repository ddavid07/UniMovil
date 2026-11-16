/**
 * ReportIncidentScreen – Formulario interactivo de reporte de incidencias
 * (HU-050: formulario de reporte, HU-051: selector de tipo y observaciones)
 *
 * Permite al usuario reportar una incidencia en el campus de Moncloa:
 *  - Selección del tipo de problema (obra, desvío, rampa averiada, etc.)
 *  - Selección de severidad (baja / media / alta / crítica)
 *  - Título y descripción con observaciones
 *  - Validación completa antes del envío (evita reportes vacíos/malformados)
 *  - Accesibilidad: accessibilityLabel y accessibilityRole en todos los campos
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  INCIDENT_TYPES,
  INCIDENT_SEVERITIES,
  validateIncidentReport,
  type IncidentReportInput,
  type IncidentType,
  type IncidentSeverity,
} from "@unimovil/contracts";
import { Action } from "../../campus/components/Action";

// ─── Etiquetas legibles para los valores del dominio ────────────────────────

const TYPE_LABELS: Record<IncidentType, string> = {
  obra: "Obra en curso",
  desvio: "Desvío de tráfico",
  rampa_averiada: "Rampa averiada",
  acera_cortada: "Acera cortada",
  obstaculo_temporal: "Obstáculo temporal",
};

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

/** Coordenadas por defecto: centro del campus de Moncloa */
const DEFAULT_COORDINATES = { latitude: 40.4453, longitude: -3.7291 };

// ─── Sub-componentes auxiliares ──────────────────────────────────────────────

function FieldError({ message }: { readonly message: string | null }) {
  if (!message) return null;
  return (
    <Text accessibilityRole="alert" style={styles.fieldError}>
      {message}
    </Text>
  );
}

function SectionLabel({ children }: { readonly children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/** Selector de opciones tipo chip/píldora */
function ChipSelector<T extends string>({
  options,
  selected,
  labels,
  accessibilityLabel,
  onSelect,
}: {
  readonly options: readonly T[];
  readonly selected: T;
  readonly labels: Record<T, string>;
  readonly accessibilityLabel: string;
  readonly onSelect: (value: T) => void;
}) {
  return (
    <View
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      style={styles.chipRow}
    >
      {options.map((option) => {
        // eslint-disable-next-line security/detect-object-injection
        const label = labels[option];
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected: selected === option }}
            onPress={() => onSelect(option)}
            style={[styles.chip, selected === option && styles.chipSelected]}
          >
            <Text
              style={[
                styles.chipText,
                selected === option && styles.chipTextSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

interface Props {
  /**
   * Se llama cuando el formulario supera la validación completa.
   * Recibe los datos validados y listos para persistencia.
   */
  readonly onSubmit: (data: IncidentReportInput) => void;
  /** Se llama al pulsar el botón de cerrar sin enviar. */
  readonly onClose: () => void;
}

interface FormErrors {
  title: string | null;
  description: string | null;
}

export function ReportIncidentScreen({ onSubmit, onClose }: Props) {
  // ── Estado del formulario ──────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>(INCIDENT_TYPES[0]);
  const [severity, setSeverity] = useState<IncidentSeverity>(
    INCIDENT_SEVERITIES[1], // "media" por defecto
  );
  const [errors, setErrors] = useState<FormErrors>({
    title: null,
    description: null,
  });

  // ── Envío con validación ───────────────────────────────────────────────────
  function handleSubmit() {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      severity,
      coordinates: DEFAULT_COORDINATES,
      reportedAt: new Date().toISOString(),
    };

    const result = validateIncidentReport(payload);

    if (!result.isValid) {
      // Mapear errores del dominio a los campos del formulario
      const newErrors: FormErrors = { title: null, description: null };
      for (const err of result.errors) {
        if (err.field === "title") newErrors.title = err.message;
        if (err.field === "description") newErrors.description = err.message;
      }
      setErrors(newErrors);
      return;
    }

    // Limpiar errores y notificar al padre
    setErrors({ title: null, description: null });
    if (result.data) onSubmit(result.data);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      transparent
      visible
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          {/* Cabecera */}
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              Reportar incidencia
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar formulario"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tipo de incidencia (HU-051) */}
            <SectionLabel>Tipo de problema</SectionLabel>
            <ChipSelector
              options={INCIDENT_TYPES}
              selected={type}
              labels={TYPE_LABELS}
              accessibilityLabel="Tipo de incidencia"
              onSelect={setType}
            />

            {/* Severidad */}
            <SectionLabel>Severidad</SectionLabel>
            <ChipSelector
              options={INCIDENT_SEVERITIES}
              selected={severity}
              labels={SEVERITY_LABELS}
              accessibilityLabel="Severidad de la incidencia"
              onSelect={setSeverity}
            />

            {/* Título (HU-050) */}
            <SectionLabel>Título *</SectionLabel>
            <TextInput
              accessibilityLabel="Título de la incidencia"
              accessibilityRole="none"
              accessibilityHint="Escribe un título breve que describa el problema"
              style={[styles.input, errors.title ? styles.inputError : null]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="Ej: Obras en acera junto a Rectorado"
              maxLength={80}
              returnKeyType="next"
            />
            <FieldError message={errors.title} />

            {/* Descripción con observaciones (HU-051) */}
            <SectionLabel>Descripción y observaciones *</SectionLabel>
            <TextInput
              accessibilityLabel="Descripción de la incidencia"
              accessibilityRole="none"
              accessibilityHint="Describe el problema con detalle para ayudar a otros usuarios"
              style={[
                styles.input,
                styles.inputMultiline,
                errors.description ? styles.inputError : null,
              ]}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: null }));
              }}
              placeholder="Ej: Zanja señalizada con vallas en acera izquierda, paso reducido a 60 cm."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              returnKeyType="done"
            />
            <FieldError message={errors.description} />

            {/* Ubicación — HU-051 indica selector de ubicación; en esta versión
                usamos las coordenadas del centro del campus. Una futura versión
                podría abrir un mapa táctil para precisar la ubicación. */}
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>📍 Ubicación</Text>
              <Text style={styles.locationText}>
                Campus de Moncloa (centro del campus por defecto)
              </Text>
              <Text style={styles.locationHint}>
                La ubicación exacta podrá ajustarse en futuras versiones.
              </Text>
            </View>

            {/* Botón de envío */}
            <Action label="Enviar reporte" onPress={handleSubmit} />

            {/* Aviso legal */}
            <Text style={styles.disclaimer}>
              Al enviar confirmas que la información es veraz. Datos procesados
              conforme a la política de privacidad de UniMovil.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000066",
  },
  sheet: {
    maxHeight: "95%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#18212b" },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 16, color: "#374151" },
  form: { gap: 8, paddingBottom: 20 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  chipSelected: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  chipText: { fontSize: 13, color: "#374151" },
  chipTextSelected: { color: "#f97316", fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#18212b",
    backgroundColor: "#fafafa",
  },
  inputMultiline: { minHeight: 100 },
  inputError: { borderColor: "#ef4444" },
  fieldError: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 2,
  },
  locationInfo: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    marginTop: 8,
  },
  locationLabel: { fontSize: 14, fontWeight: "600", color: "#166534" },
  locationText: { fontSize: 14, color: "#15803d" },
  locationHint: { fontSize: 12, color: "#6b7280" },
  disclaimer: { fontSize: 12, color: "#6b7280", marginTop: 12 },
});
