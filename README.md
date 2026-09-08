# BizMint

App móvil (Android/iOS, un solo código con Expo/React Native) para
administrar tus gastos mensuales — cuentas, movimientos, categorías con
límites, metas de deuda/ahorro y gráficos — más un pequeño motor de IA
basado en reglas que responde "¿puedo gastar esto?" según tu presupuesto,
lo que ya gastaste y cuántos días quedan del mes.

## Funcionalidades

- **Resumen**: saldo total y por cuenta (editable), ingresos/gastos del
  mes, simulador de escenarios hipotéticos, próximos pagos (recordatorios),
  progreso por categoría, archivo de meses anteriores.
- **Movimientos**: gastos, ingresos y transferencias entre cuentas,
  agrupados por semana, con estado "ya pasó / pendiente". Tocar uno lo
  edita; borrar con el botón ✕.
- **Agregar**: alta de un movimiento (gasto, ingreso o transferencia),
  cuenta, categoría, fecha y si ya se hizo o está pendiente.
- **Asesor (IA)**: preguntas del tipo "¿puedo gastar $50 en Ocio?" con
  respuesta Sí/No, nivel de confianza y las razones del cálculo.
- **Metas**: deudas a pagar o metas de ahorro, con barra de progreso y
  registro de pagos/aportes.
- **Gráficos**: gasto por categoría (barras y torta) y balance mes a mes
  (línea), usando el archivo de "Resumen".
- **Ajustes**: moneda, categorías y sus límites, presupuesto del Asesor
  (ingreso + % de ahorro) y estado del plan (Gratis/Premium).

Todos los datos se guardan **localmente en el dispositivo** con
`AsyncStorage`. No hay backend ni llamadas a APIs externas: toda la lógica
financiera (`src/domain/finance.ts`, portada de un prototipo web de
referencia) y el "asesor" (`src/ai/advisor.ts`) son aritmética sobre tus
propios datos, así que funcionan sin conexión y sin costo por consulta.

## Cómo funciona el asesor

`evaluateSpend(monto, categoriaId, estado)` en `src/ai/advisor.ts`:

1. Calcula tu presupuesto mensual efectivo (el que definiste en Ajustes, o
   ingreso − % de ahorro).
2. Calcula cuánto llevas gastado este mes y cuántos días quedan.
3. Obtiene tu "ritmo diario sugerido" = presupuesto restante / días restantes.
4. Compara el monto contra ese ritmo, el presupuesto total restante y el
   límite de la categoría elegida (si le pusiste uno en Ajustes), y
   devuelve Sí/No + confianza (alta/media/baja) + las razones en texto
   plano.

### Sobre el LLM conversacional

Se evaluó conectar un LLM real (Claude) para responder preguntas en
lenguaje natural sobre tus gastos ("¿en qué categoría gasté más este mes?",
etc.), pero por ahora se dejó pendiente a pedido explícito: requiere que
cada usuario traiga su propia clave de API (para no dejar una clave
compartida embebida en la app, insegura y con costo para quien la
publique) o que se despliegue un backend propio que la sostenga. El motor
de reglas actual no tiene ese costo ni esa dependencia de red. Si más
adelante se quiere sumar, el punto de entrada natural es una pantalla
nueva que arme un resumen de `state` (cuentas, movimientos, categorías) y
se lo pase como contexto a la API de Claude junto con la pregunta del
usuario.

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
   tomado. El branding (ícono, ícono adaptativo de Android, splash) ya está
   generado a partir del logo de BizMint — ver la sección de branding más
   abajo si quieres actualizarlo.
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

## Publicarla en iOS (App Store)

Es el mismo código — Expo compila para ambas plataformas — pero Apple pone
requisitos que Google no pone, y **no se pueden evitar**:

1. **Apple Developer Program**: USD 99/año, obligatorio para subir a la
   App Store o incluso para instalar en tu propio iPhone por más de 7 días
   (a diferencia de Android, no existe un "APK" que se pueda instalar
   libremente). https://developer.apple.com/programs/
2. Con la cuenta activa: `eas build --platform ios --profile production`
   compila en la nube de Expo (no hace falta Mac). La primera vez, `eas`
   te guía para generar el certificado de firma y el perfil de
   aprovisionamiento — dejá que los gestione EAS, es lo más simple.
3. Subir a la tienda: `eas submit --platform ios` (necesita el App Store
   Connect API Key de tu cuenta de Apple) o subirlo a mano desde Xcode/
   Transporter.
4. En App Store Connect: ficha de la app, capturas para distintos tamaños
   de pantalla, política de privacidad y el cuestionario de privacidad
   ("App Privacy") — Apple es más estricto que Google revisando esto.
5. La primera revisión de Apple suele tardar 1–3 días y puede rechazar la
   app pidiendo cambios; es normal, se corrige y se reenvía.

Si por ahora solo querés probarla en tu iPhone sin pagar la cuenta de
desarrollador, podés usar **Expo Go** (`npm start` y escanear el QR) con
las mismas limitaciones que en Android: funciona para desarrollo, no sirve
para distribuir la app a otras personas.

## Branding / logo

`assets/` ya tiene el branding generado a partir del logo oficial de
BizMint (el robot con la moneda):

- `icon.png` — ícono principal (iOS y genérico), el mono sobre fondo navy.
- `android-icon-foreground.png` / `android-icon-monochrome.png` — capas del
  ícono adaptativo de Android (`backgroundColor` navy definido en `app.json`).
- `splash-icon.png` — pantalla de carga.
- `favicon.png` — ícono para la versión web.
- `store/bizmint-logo-full.png` — el lockup completo (mono + texto "BizMint"
  + tagline), útil para el gráfico de portada ("feature graphic" 1024×500)
  y materiales de marketing en la ficha de Google Play.
- `store/bizmint-mark-transparent.png` — solo el mono en 1024×1024
  transparente, por si necesitas el ícono de 512×512 de la ficha de Play
  Store aparte del `.aab` (Play lo regenera del ícono de la app, pero a
  veces piden subirlo también en la ficha de la tienda).

Si cambias el logo más adelante, todos estos archivos se regeneran con el
mismo recorte/composición desde el PNG original del logo — pide que se
vuelvan a generar y se actualiza todo junto.

## Monetización

La app ya trae el punto de enganche para dos modelos, ambos combinables:

### 1. Suscripción / compra "Premium" (recomendado como ingreso principal)

En `src/screens/AjustesScreen.tsx` hay un botón "Obtener Premium" que hoy
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
- Muestra un banner en `ResumenScreen` solo cuando
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
  ai/advisor.ts           Motor de reglas "¿puedo gastar esto?"
  domain/finance.ts       Lógica financiera pura (saldos, metas, semanas, recordatorios)
  domain/format.ts        Formato de moneda/fecha y parseo de montos
  components/ui.tsx       Componentes visuales reutilizables (incluye FormModal)
  navigation/             Tabs de la app
  screens/                Resumen, Movimientos, Agregar, Asesor, Metas, Gráficos, Ajustes
  state/AppContext.tsx    Estado global + persistencia
  storage/                Lectura/escritura en AsyncStorage
  theme/                  Colores y espaciados
  types/                  Tipos compartidos
```
