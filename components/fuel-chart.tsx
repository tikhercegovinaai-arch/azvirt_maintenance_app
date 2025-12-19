import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface FuelDataPoint {
  month: string;
  liters: number;
  cost: number;
}

interface FuelChartProps {
  data: FuelDataPoint[];
  maxLiters?: number;
}

export function FuelChart({ data, maxLiters = 1000 }: FuelChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText type="default">Nema podataka o potrošnji goriva</ThemedText>
      </View>
    );
  }

  const chartHeight = 200;
  const chartWidth = 300;
  const padding = 40;
  const barWidth = (chartWidth - padding * 2) / data.length;
  const scale = (chartHeight - padding) / maxLiters;

  const maxValue = Math.max(...data.map((d) => d.liters));
  const scaledMax = Math.max(maxValue, maxLiters);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <svg width={chartWidth} height={chartHeight} style={styles.svg}>
          {/* Y-axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#ccc"
            strokeWidth="2"
          />

          {/* X-axis */}
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#ccc"
            strokeWidth="2"
          />

          {/* Grid lines and Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
            const value = Math.round(scaledMax * ratio);

            return (
              <g key={`grid-${i}`}>
                <line
                  x1={padding - 5}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={y + 5}
                  fontSize="12"
                  fill="#999"
                  textAnchor="end"
                >
                  {value}L
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((point, i) => {
            const barHeight = (point.liters / scaledMax) * (chartHeight - padding * 2);
            const x = padding + i * barWidth + barWidth * 0.1;
            const y = chartHeight - padding - barHeight;

            return (
              <g key={`bar-${i}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill="#FF9500"
                  rx="4"
                />
                <text
                  x={x + barWidth * 0.4}
                  y={chartHeight - padding + 20}
                  fontSize="11"
                  fill="#666"
                  textAnchor="middle"
                >
                  {point.month}
                </text>
              </g>
            );
          })}
        </svg>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText type="default" style={styles.statLabel}>
            Ukupna Potrošnja
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            {data.reduce((sum, d) => sum + d.liters, 0).toFixed(1)}L
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText type="default" style={styles.statLabel}>
            Prosječna Potrošnja
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            {(data.reduce((sum, d) => sum + d.liters, 0) / data.length).toFixed(1)}L
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText type="default" style={styles.statLabel}>
            Ukupni Trošak
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            €{data.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
  },
  svg: {
    backgroundColor: "transparent",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: "#FF9500",
  },
});
