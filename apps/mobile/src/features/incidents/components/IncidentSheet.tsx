/**
 * IncidentSheet – Ficha informativa de una incidencia activa (HU-053)
 *
 * Bottom-sheet modal que muestra el detalle de una incidencia del campus:
 * título, tipo, severidad, descripción, estado y fecha de reporte.
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Incident } from "@unimovil/contracts";
import { Action } from "../../campus/components/Action";

// ─── Etiquetas legibles para los valores del dominio ────────────────────────

const TYPE_LABELS: Record<string, string> = {
  obra: "Obra en curso",
  desvio: "Desvío de tráfico",
  rampa_averiada: "Rampa averiada",
  acera_cortada: "Acera cortada",
  obstaculo_temporal: "Obstáculo temporal",
};

const SEVERITY_LABELS: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

const STATUS_LABELS: Record<string, string> = {
  reportada: "Reportada",
  en_curso: "En curso",
  resuelta: "Resuelta",
};

/** Color del badge de estado */
const STATUS_COLORS: Record<string, string> = {
  reportada: "#f97316",
  en_curso: "#F57C00",
  resuelta: "#10b981",
};

/** Color del badge de severidad */
const SEVERITY_COLORS: Record<string, string> = {
  baja: "#1976D2",
  media: "#FBC02D",
  alta: "#F57C00",
  critica: "#D32F2F",
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function Badge({
  label,
  color,
}: {
  readonly label: string;
  readonly color: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

interface Props {
  /** Incidencia a mostrar. Si es null, el modal no se muestra. */
  readonly incident: Incident | null;
  /** Callback para cerrar la ficha. */
  readonly onClose: () => void;
}

export function IncidentSheet({ incident, onClose }: Props) {
  if (!incident) return null;

  const typeLabel = TYPE_LABELS[incident.type] ?? incident.type;
  const severityLabel = SEVERITY_LABELS[incident.severity] ?? incident.severity;
  const statusLabel = STATUS_LABELS[incident.status] ?? incident.status;
  const statusColor = STATUS_COLORS[incident.status] ?? "#f97316";
  const severityColor = SEVERITY_COLORS[incident.severity] ?? "#f97316";

  const reportedDate = new Date(incident.reportedAt).toLocaleDateString(
    "es-ES",
    { year: "numeric", month: "long", day: "numeric" },
  );

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
          <Action label="Cerrar ficha de incidencia" onPress={onClose} />
          <ScrollView contentContainerStyle={styles.content}>
            {/* Título */}
            <Text accessibilityRole="header" style={styles.title}>
              {incident.title}
            </Text>

            {/* Badges de estado y severidad */}
            <View style={styles.badges}>
              <Badge label={`⚠ ${typeLabel}`} color="#f97316" />
              <Badge label={severityLabel} color={severityColor} />
              <Badge label={statusLabel} color={statusColor} />
            </View>

            {/* Descripción */}
            <Text style={styles.sectionLabel}>Descripción</Text>
            <Text style={styles.text}>{incident.description}</Text>

            {/* Coordenadas */}
            <Text style={styles.sectionLabel}>Ubicación</Text>
            <Text style={styles.text}>
              {incident.coordinates.latitude.toFixed(6)},{" "}
              {incident.coordinates.longitude.toFixed(6)}
            </Text>

            {/* Fecha */}
            <Text style={styles.sectionLabel}>Reportada el</Text>
            <Text style={styles.text}>{reportedDate}</Text>

            {/* Aviso legal */}
            <Text style={styles.disclaimer}>
              Información reportada por usuarios. No constituye garantía de
              accesibilidad ni confirmación oficial.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000066",
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  content: { gap: 12, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#18212b" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginTop: 4 },
  text: { fontSize: 15, lineHeight: 22, color: "#18212b" },
  disclaimer: { fontSize: 12, color: "#6b7280", marginTop: 8 },
});
