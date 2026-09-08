import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ResumenScreen from "../screens/ResumenScreen";
import MovimientosScreen from "../screens/MovimientosScreen";
import AgregarScreen from "../screens/AgregarScreen";
import AsesorScreen from "../screens/AsesorScreen";
import MetasScreen from "../screens/MetasScreen";
import GraficosScreen from "../screens/GraficosScreen";
import AjustesScreen from "../screens/AjustesScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const iconByRoute: Record<string, keyof typeof Ionicons.glyphMap> = {
  Resumen: "home",
  Movimientos: "list",
  Agregar: "add-circle",
  Asesor: "sparkles",
  Metas: "flag",
  Gráficos: "bar-chart",
  Ajustes: "settings",
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgAlt,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.bgAlt, borderTopColor: colors.border },
          tabBarLabelStyle: { fontSize: 10 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconByRoute[route.name] ?? "ellipse"} size={size - 4} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Resumen" component={ResumenScreen} />
        <Tab.Screen name="Movimientos" component={MovimientosScreen} />
        <Tab.Screen
          name="Agregar"
          component={AgregarScreen}
          listeners={({ navigation, route }) => ({
            tabPress: () => {
              // Tapping the tab icon directly (not navigating here to edit a
              // specific movement) should always open a blank form.
              if ((route.params as { editId?: string } | undefined)?.editId) {
                navigation.setParams({ editId: undefined });
              }
            },
          })}
        />
        <Tab.Screen name="Asesor" component={AsesorScreen} />
        <Tab.Screen name="Metas" component={MetasScreen} />
        <Tab.Screen name="Gráficos" component={GraficosScreen} />
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
