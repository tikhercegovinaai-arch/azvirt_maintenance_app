import { View, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText, G, Path } from "react-native-svg";
import { ThemedText } from "@/components/themed-text";
import { ServiceRecord } from "@/types";

interface ServiceCostChartProps {
  services: ServiceRecord[];
  size?: number;
}

export function ServiceCostChart({ services, size = 200 }: ServiceCostChartProps) {
  // Group services by type and calculate total cost
  const costByType: Record<string, number> = {};
  services.forEach((service) => {
    if (!costByType[service.serviceType]) {
      costByType[service.serviceType] = 0;
    }
    costByType[service.serviceType] += service.cost;
  });

  const types = Object.keys(costByType);
  const costs = Object.values(costByType);
  const totalCost = costs.reduce((sum, cost) => sum + cost, 0);

  if (types.length === 0 || totalCost === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText type="default" style={styles.emptyText}>
          Nema dostupnih podataka o servisu
        </ThemedText>
      </View>
    );
  }

  // Colors for pie chart
  const colors = [
    "#FF9500",
    "#0066CC",
    "#34C759",
    "#FF3B30",
    "#AF52DE",
    "#A2845E",
    "#5856D6",
    "#00B0FF",
  ];

  // Calculate pie slices
  let currentAngle = -Math.PI / 2;
  const slices = types.map((type, index) => {
    const percentage = costs[index] / totalCost;
    const sliceAngle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = size / 2 + (size / 2 - 10) * Math.cos(startAngle);
    const y1 = size / 2 + (size / 2 - 10) * Math.sin(startAngle);
    const x2 = size / 2 + (size / 2 - 10) * Math.cos(endAngle);
    const y2 = size / 2 + (size / 2 - 10) * Math.sin(endAngle);

    const largeArc = percentage > 0.5 ? 1 : 0;

    const pathData = `
      M ${size / 2} ${size / 2}
      L ${x1} ${y1}
      A ${size / 2 - 10} ${size / 2 - 10} 0 ${largeArc} 1 ${x2} ${y2}
      Z
    `;

    currentAngle = endAngle;

    return {
      type,
      cost: costs[index],
      percentage,
      color: colors[index % colors.length],
      pathData,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, index) => (
          <Path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {/* Center circle for donut effect */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 4}
          fill="#1a1a1a"
        />
      </Svg>

      <View style={styles.legend}>
        {slices.map((slice, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: slice.color },
              ]}
            />
            <View style={styles.legendText}>
              <ThemedText type="default" style={styles.legendLabel}>
                {slice.type}
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.legendValue}>
                €{slice.cost.toFixed(2)} ({(slice.percentage * 100).toFixed(0)}%)
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <ThemedText type="defaultSemiBold" style={styles.summaryLabel}>
          Ukupni Trošak Servisa
        </ThemedText>
        <ThemedText type="title" style={styles.summaryValue}>
          €{totalCost.toFixed(2)}
        </ThemedText>
        <ThemedText type="default" style={styles.summarySubtext}>
          {types.length} vrsta servisa • {services.length} servisa
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.6,
  },
  legend: {
    marginTop: 16,
    width: "100%",
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  legendValue: {
    fontSize: 12,
    marginTop: 2,
  },
  summary: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    alignItems: "center",
    width: "100%",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    color: "#FF9500",
  },
  summarySubtext: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
  },
});
