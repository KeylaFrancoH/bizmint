# BizMint

App móvil (Android/iOS) para administrar tus gastos mensuales, con un
pequeño motor de IA basado en reglas que responde "¿puedo gastar esto?"
según tu presupuesto, lo que ya gastaste y cuántos días quedan del mes.

## Funcionalidades

- **Inicio**: resumen del mes (gastado vs. presupuesto, gasto por categoría).
- **Agregar**: registrar un gasto (monto, categoría, nota).
- **Asesor (IA)**: preguntas del tipo "¿puedo gastar $50 en Ocio?" con
  respuesta Sí/No, nivel de confianza y las razones del cálculo.
- **Historial**: lista de gastos, borrar con toque largo.
- **Presupuesto**: presupuesto mensual (o ingreso + % de ahorro) y límites
  por categoría opcionales.
- **Ajustes**: estado del plan (Gratis/Premium) — punto de partida para
  monetización.

Todos los datos se guardan **localmente en el dispositivo** con
`AsyncStorage`. No hay backend ni llamadas a APIs externas: el "asesor"
(`src/ai/advisor.ts`) es aritmética sobre tus propios datos, así que
funciona sin conexión y sin costo por consulta.

## Cómo funciona el asesor

`evaluateSpend(monto, categoría, estado)` en `src/ai/advisor.ts`:

1. Calcula tu presupuesto mensual efectivo (el que definiste, o
   ingreso − % de ahorro).
2. Calcula cuánto llevas gastado este mes y cuántos días quedan.
3. Obtiene tu "ritmo diario sugerido" = presupuesto restante / días restantes.
4. Compara el monto contra ese ritmo, el presupuesto total restante y el
   límite de la categoría (si lo configuraste), y devuelve Sí/No +
   confianza (alta/media/baja) + las razones en texto plano.

Si más adelante quieres una IA "de verdad" (lenguaje natural, generación de
consejos), puedes reemplazar o complementar este módulo con una llamada a
la API de Claude — pero eso agrega costo por consulta y requiere conexión,
por eso el motor por defecto es 100% local y gratis de operar.

## Correr el proyecto localmente

```bash
npm install
npm run android   # abre en un emulador/dispositivo Android (requiere Expo Go o dev client)
npm run ios       # solo macOS
npm run web       # vista previa rápida en el navegador
```

La forma más simple de probarlo en tu teléfono ahora mismo es instalar
**Expo Go** desde Google Play y escanear el QR que muestra `npm start`.

## Publicarla en Google Play

Esto requiere cosas que solo tú puedes hacer (cuenta y pagos), pero el
proyecto ya está listo para el resto del proceso:

1. **Cuenta de Google Play Console** (pago único de $25 USD):
   https://play.google.com/console/signup
2. **Cuenta gratuita de Expo/EAS**: https://expo.dev/signup
3. Instala la CLI y autentícate:
   ```bash
   npm install -g eas-cli
   eas login
   ```
4. Antes de compilar, cambia el `"package"` en `app.json`
   (`com.bizmint.app`) por un identificador único tuyo si ese ya está
   tomado, y reemplaza los íconos en `assets/` con tu propio branding.
5. Compila el App Bundle de producción:
   ```bash
   eas build --platform android --profile production
   ```
   EAS gestiona el keystore de firma automáticamente (o puedes subir el
   tuyo).
6. Sube el `.aab` generado a Google Play Console (o usa
   `eas submit --platform android`, configurado en `eas.json` para subirlo
   directo al track "internal" y luego promoverlo a producción desde la
   consola).
7. Completa en la consola: ficha de la tienda (capturas, descripción,
   ícono), clasificación de contenido, política de privacidad (obligatoria
   porque la app maneja datos financieros del usuario, aunque sean solo
   locales) y cuestionario de seguridad de datos.

La guía oficial y siempre actualizada: https://docs.expo.dev/deploy/build-project/

## Monetización

La app ya trae el punto de enganche para dos modelos, ambos combinables:

### 1. Suscripción / compra "Premium" (recomendado como ingreso principal)

En `src/screens/SettingsScreen.tsx` hay un botón "Obtener Premium" que hoy
solo **simula** el desbloqueo (`setPremium(true)`) para que puedas ver el
flujo. Para monetizar de verdad:

- Usa **Google Play Billing** vía [RevenueCat](https://www.revenuecat.com/)
  (tiene SDK de Expo y plan gratis hasta cierto volumen) o
  `expo-in-app-purchases`.
- Define en Play Console un producto de suscripción (ej. "BizMint
  Premium mensual/anual").
- Reemplaza el `Alert` de `onUpgrade` por la llamada real de compra, y
  `setPremium` por el estado que te devuelva RevenueCat.
- Ideas de features exclusivas de Premium: categorías ilimitadas
  (ya hay 9, podrías permitir crear personalizadas), respaldo/sincronización
  en la nube, exportar a Excel/PDF, quitar anuncios.

### 2. Anuncios (ingreso complementario para el plan gratis)

- Integra **Google AdMob** con `react-native-google-mobile-ads`.
- Muestra un banner en `DashboardScreen` solo cuando
  `state.isPremium === false` (ese `if` ya está listo para agregarlo).
- Necesitas crear la app en tu cuenta de AdMob y poner tus IDs de bloque de
  anuncios reales antes de publicar (los IDs de prueba de Google no generan
  ingresos y no deben ir a producción).

**Importante:** no puedo crear cuentas, aceptar términos de servicio ni
generar dinero por ti — eso depende de que tú completes el registro en
Google Play Console, AdMob y/o RevenueCat con tus propios datos fiscales y
de pago. Lo que sí queda listo es todo el código y la estructura para que,
en cuanto conectes esas cuentas, la app pueda cobrar y mostrar anuncios sin
rediseñar nada.

## Estructura del proyecto

```
src/
  ai/advisor.ts          Motor de reglas "¿puedo gastar esto?"
  components/ui.tsx      Componentes visuales reutilizables
  navigation/             Tabs de la app
  screens/                Pantallas (Inicio, Agregar, Asesor, Historial, Presupuesto, Ajustes)
  state/AppContext.tsx    Estado global + persistencia
  storage/                Lectura/escritura en AsyncStorage
  theme/                  Colores y espaciados
  types/                  Tipos compartidos
```
