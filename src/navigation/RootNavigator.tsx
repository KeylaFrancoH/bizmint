import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/DashboardScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import BudgetScreen from "../screens/BudgetScreen";
import AdvisorScreen from "../screens/AdvisorScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const iconByRoute: Record<string, keyof typeof Ionicons.glyphMap> = {
  Inicio: "home",
  Agregar: "add-circle",
  Historial: "list",
  Asesor: "sparkles",
  Presupuesto: "wallet",
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconByRoute[route.name] ?? "ellipse"} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Inicio" component={DashboardScreen} />
        <Tab.Screen name="Agregar" component={AddExpenseScreen} />
        <Tab.Screen name="Asesor" component={AdvisorScreen} />
        <Tab.Screen name="Historial" component={ExpensesScreen} />
        <Tab.Screen name="Presupuesto" component={BudgetScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
