import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useApp } from "../state/AppContext";
import { categoryChartData } from "../domain/finance";
import { formatMoney } from "../domain/format";
import { Card, EmptyText, SectionTitle } from "../components/ui";
import { colors, spacing } from "../theme";

const BAR_HEIGHT = 160;
const DONUT_SIZE = 160;
const DONUT_STROKE = 26;

function BarChart({ data, money }: { data: { name: string; color: string; spent: number }[]; money: (n: number) => string }) {
  if (data.length === 0) return <EmptyText>Todavía no hay gastos este mes.</EmptyText>;
  const max = Math.max(...data.map((x) => x.spent));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.barChart}>
        {data.map((d) => (
          <View key={d.name} style={styles.barCol}>
            <Text style={styles.barValue}>{money(d.spent)}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { height: `${Math.max((d.spent / max) * 100, 4)}%`, backgroundColor: d.color },
                ]}
              />
            </View>
            <Text style={styles.barName} numberOfLines={1}>
              {d.name}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DonutChart({ data, money }: { data: { name: string; color: string; spent: number }[]; money: (n: number) => string }) {
  if (data.length === 0) return <EmptyText>Todavía no hay gastos este mes.</EmptyText>;
  const total = data.reduce((s, x) => s + x.spent, 0);
  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;

  return (
    <View>
      <View style={styles.donutWrap}>
        <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
          <Circle
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={radius}
            stroke={colors.bgAlt}
            strokeWidth={DONUT_STROKE}
            fill="none"
          />
          {data.map((d) => {
            const fraction = d.spent / total;
            const dash = fraction * circumference;
            const offset = -((acc / total) * circumference);
            acc += d.spent;
            return (
              <Circle
                key={d.name}
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={radius}
                stroke={d.color}
                strokeWidth={DONUT_STROKE}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                fill="none"
                rotation={-90}
                origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}
              />
            );
          })}
        </Svg>
      </View>
      {data.map((d) => (
        <View key={d.name} style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: d.color }]} />
          <Text style={styles.legendName}>{d.name}</Text>
          <Text style={styles.legendValue}>
            {money(d.spent)} · {Math.round((d.spent / total) * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

function LineChart({ points, money }: { points: { label: string; restante: number }[]; money: (n: number) => string }) {
  if (points.length === 0) {
    return <EmptyText>Todavía no tenés historial. Guardá el resumen del mes en Resumen y va a aparecer acá.</EmptyText>;
  }
  if (points.length === 1) {
    return (
      <View style={{ alignItems: "center", paddingVertical: spacing(2) }}>
        <Text style={{ color: colors.textMuted }}>{points[0].label}</Text>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 4 }}>
          {money(points[0].restante)}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: spacing(1) }}>
          Guardá otro mes para ver la tendencia en una línea.
        </Text>
      </View>
    );
  }
  const values = points.map((p) => p.restante);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const w = 300;
  const h = 140;
  const pad = 12;
  const stepX = (w - pad * 2) / (points.length - 1);
  const coords = values.map((v, i) => [pad + i * stepX, pad + (1 - (v - min) / range) * (h - pad * 2)]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <View>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Path d={path} fill="none" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={3.5} fill={colors.primary} />
        ))}
      </Svg>
      <View style={styles.lineLabels}>
        {points.map((p, i) => (
          <Text key={i} style={styles.lineLabel} numberOfLines={1}>
            {p.label.split(" ")[0].slice(0, 3)}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function GraficosScreen() {
  const { state } = useApp();
  const money = (n: number) => formatMoney(n, state.currency);
  const data = categoryChartData(state.categories, state.movements);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(2.5) }}>
      <SectionTitle>Gráficos</SectionTitle>
      <Card style={{ marginBottom: spacing(2) }}>
        <Text style={styles.cardTitle}>Gastos por categoría (este mes)</Text>
        <BarChart data={data} money={money} />
      </Card>
      <Card style={{ marginBottom: spacing(2) }}>
        <Text style={styles.cardTitle}>Repartición de tus gastos</Text>
        <DonutChart data={data} money={money} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Balance por mes</Text>
        <LineChart points={state.archive} money={money} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: spacing(1.5),
  },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: BAR_HEIGHT, gap: spacing(1.5), paddingTop: spacing(1) },
  barCol: { alignItems: "center", width: 52 },
  barValue: { color: colors.textMuted, fontSize: 11, marginBottom: spacing(0.5) },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  barFill: { width: "60%", alignSelf: "center", borderRadius: 6 },
  barName: { color: colors.textMuted, fontSize: 11, marginTop: spacing(0.75), maxWidth: 52 },
  donutWrap: { alignItems: "center", paddingVertical: spacing(1) },
  legendRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing(0.75), borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing(1) },
  legendName: { color: colors.text, flex: 1, fontSize: 14 },
  legendValue: { color: colors.textMuted, fontSize: 12 },
  lineLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing(0.5) },
  lineLabel: { color: colors.textMuted, fontSize: 11 },
});
