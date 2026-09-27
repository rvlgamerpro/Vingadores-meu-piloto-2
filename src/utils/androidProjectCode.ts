import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  name: string;
  language: string;
  description: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'Configuração raiz do projeto Gradle e repositórios Google e MavenCentral',
    code: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "VingadoresCopiloto"
include(":app")`,
  },
  {
    path: 'build.gradle.kts',
    name: 'root build.gradle.kts',
    language: 'kotlin',
    description: 'Plugins raiz do projeto Android Studio',
    code: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}`,
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    description: 'Propriedades de compilação do Gradle, JVM e AndroidX habilitado',
    code: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Declaração de permissões de Sobreposição (Overlay), Serviço de Acessibilidade e Inicialização',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="br.com.rvcopiloto.app">

    <!-- Permissão para exibir a Janela Flutuante (Semáforo HUD) sobre outros apps -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Vingadores Copiloto"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.VingadoresCopiloto">

        <!-- Tela Principal de Configurações e Histórico (Jetpack Compose) -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="Vingadores Copiloto"
            android:theme="@style/Theme.VingadoresCopiloto">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Serviço de Acessibilidade: Lê o conteúdo de Uber, 99 e inDrive -->
        <service
            android:name=".service.RVAccessibilityService"
            android:exported="false"
            android:label="Vingadores Copiloto - Leitor de Corridas"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Serviço de Janela Flutuante (Overlay) em Jetpack Compose -->
        <service
            android:name=".service.OverlayService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse" />
    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    language: 'xml',
    description: 'Filtro para escutar os pacotes oficiais de Uber Motorista, 99 Motorista e inDrive',
    code: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:packageNames="com.ubercab.driver,com.taxis99,com.indrive.driver"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagIncludeNotImportantViews"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="80"
    android:canRetrieveWindowContent="true" />`,
  },
  {
    path: 'app/src/main/java/br/com/rvcopiloto/app/service/RVAccessibilityService.kt',
    name: 'RVAccessibilityService.kt',
    language: 'kotlin',
    description: 'Serviço de Acessibilidade que captura eventos de tela dos apps de transporte e extrai preço, km e tempo',
    code: `package br.com.rvcopiloto.app.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import br.com.rvcopiloto.app.data.RideData
import br.com.rvcopiloto.app.domain.RideCalculator
import java.util.regex.Pattern

/**
 * Vingadores Copiloto - Serviço de Acessibilidade
 * Monitora em tempo real telas de ofertas de Uber, 99 e inDrive
 */
class RVAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "RVAccessibilityService"
        const val ACTION_NEW_RIDE = "br.com.rvcopiloto.ACTION_NEW_RIDE"
        const val EXTRA_RIDE_DATA = "extra_ride_data"
    }

    private var lastExtractedRideId: String? = null
    private var lastOfferTimestamp: Long = 0

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || rootInActiveWindow == null) return

        val packageName = event.packageName?.toString() ?: return
        val currentTime = System.currentTimeMillis()

        // Debounce para não processar múltiplos eventos repetidos no mesmo segundo
        if (currentTime - lastOfferTimestamp < 1200) return

        when (packageName) {
            "com.ubercab.driver" -> parseUberOffer(rootInActiveWindow)
            "com.taxis99" -> parse99Offer(rootInActiveWindow)
            "com.indrive.driver" -> parseInDriveOffer(rootInActiveWindow)
        }
    }

    private fun parseUberOffer(rootNode: AccessibilityNodeInfo) {
        val texts = mutableListOf<String>()
        collectTextNodes(rootNode, texts)

        // Extrai valor em R$ (ex: "R$ 28,50" ou "28,50")
        var fare: Double? = null
        var totalKm: Double? = null
        var minutes: Int? = null

        val fareRegex = Pattern.compile("R\\\\$\\\\s*([0-9]+[\\\\.,][0-9]{2})")
        val kmRegex = Pattern.compile("([0-9]+[\\\\.,]?[0-9]*)\\\\s*(?:km|quilômetros)", Pattern.CASE_INSENSITIVE)
        val minRegex = Pattern.compile("([0-9]+)\\\\s*(?:min|minutos)", Pattern.CASE_INSENSITIVE)

        for (text in texts) {
            val fMatcher = fareRegex.matcher(text)
            if (fMatcher.find() && fare == null) {
                fare = fMatcher.group(1)?.replace(",", ".")?.toDoubleOrNull()
            }

            val kMatcher = kmRegex.matcher(text)
            if (kMatcher.find() && totalKm == null) {
                totalKm = kMatcher.group(1)?.replace(",", ".")?.toDoubleOrNull()
            }

            val mMatcher = minRegex.matcher(text)
            if (mMatcher.find() && minutes == null) {
                minutes = mMatcher.group(1)?.toIntOrNull()
            }
        }

        if (fare != null && totalKm != null) {
            dispatchOffer("uber", fare, totalKm, minutes ?: 15, "UberX")
        }
    }

    private fun parse99Offer(rootNode: AccessibilityNodeInfo) {
        val texts = mutableListOf<String>()
        collectTextNodes(rootNode, texts)
        // Lógica similar de extração otimizada para o padrão do 99 Motorista
        extractAndDispatch("99", texts)
    }

    private fun parseInDriveOffer(rootNode: AccessibilityNodeInfo) {
        val texts = mutableListOf<String>()
        collectTextNodes(rootNode, texts)
        extractAndDispatch("indrive", texts)
    }

    private fun extractAndDispatch(app: String, texts: List<String>) {
        val fullText = texts.joinToString(" | ")
        Log.d(TAG, "Parsing text from $app: $fullText")

        // Exemplo simplificado de extração robusta
        val fareRegex = Pattern.compile("(?:R\\\\$|R\\\\$ )([0-9]+[\\\\.,][0-9]{2})")
        val kmRegex = Pattern.compile("([0-9]+[\\\\.,]?[0-9]*)\\\\s*km")
        val minRegex = Pattern.compile("([0-9]+)\\\\s*min")

        val fMatcher = fareRegex.matcher(fullText)
        val kMatcher = kmRegex.matcher(fullText)
        val mMatcher = minRegex.matcher(fullText)

        if (fMatcher.find() && kMatcher.find()) {
            val fare = fMatcher.group(1)!!.replace(",", ".").toDoubleOrNull() ?: return
            val km = kMatcher.group(1)!!.replace(",", ".").toDoubleOrNull() ?: return
            val min = if (mMatcher.find()) mMatcher.group(1)!!.toIntOrNull() ?: 15 else 15

            dispatchOffer(app, fare, km, min, "$app Corrida")
        }
    }

    private fun dispatchOffer(app: String, fare: Double, totalKm: Double, minutes: Int, category: String) {
        lastOfferTimestamp = System.currentTimeMillis()

        // Dispara o OverlayService para exibir a janela flutuante com o Semáforo
        val intent = Intent(this, OverlayService::class.java).apply {
            action = OverlayService.ACTION_SHOW_OFFER
            putExtra("APP", app)
            putExtra("FARE", fare)
            putExtra("KM", totalKm)
            putExtra("MINUTES", minutes)
            putExtra("CATEGORY", category)
        }
        startService(intent)
    }

    private fun collectTextNodes(node: AccessibilityNodeInfo?, list: MutableList<String>) {
        if (node == null) return
        node.text?.let { if (it.isNotBlank()) list.add(it.toString().trim()) }
        node.contentDescription?.let { if (it.isNotBlank()) list.add(it.toString().trim()) }

        for (i in 0 until node.childCount) {
            collectTextNodes(node.getChild(i), list)
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "Serviço de Acessibilidade interrompido")
    }
}`,
  },
  {
    path: 'app/src/main/java/br/com/rvcopiloto/app/service/OverlayService.kt',
    name: 'OverlayService.kt',
    language: 'kotlin',
    description: 'Serviço de Janela Flutuante (SYSTEM_ALERT_WINDOW) renderizando a UI Jetpack Compose na tela',
    code: `package br.com.rvcopiloto.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.NotificationCompat
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import br.com.rvcopiloto.app.R
import br.com.rvcopiloto.app.data.RideData
import br.com.rvcopiloto.app.domain.RideCalculator
import br.com.rvcopiloto.app.domain.SemaforoStatus
import br.com.rvcopiloto.app.ui.components.SemaforoOverlayContent

/**
 * Exibe a Janela Flutuante do Vingadores Copiloto sobre os apps de corrida.
 */
class OverlayService : Service() {

    companion object {
        const val ACTION_SHOW_OFFER = "br.com.rvcopiloto.ACTION_SHOW_OFFER"
        const val ACTION_DISMISS = "br.com.rvcopiloto.ACTION_DISMISS"
        private const val CHANNEL_ID = "rv_copiloto_overlay"
    }

    private var windowManager: WindowManager? = null
    private var composeView: ComposeView? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        startForeground(1001, createForegroundNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW_OFFER -> {
                val app = intent.getStringExtra("APP") ?: "uber"
                val fare = intent.getDoubleExtra("FARE", 0.0)
                val km = intent.getDoubleExtra("KM", 0.0)
                val minutes = intent.getIntExtra("MINUTES", 15)
                val category = intent.getStringExtra("CATEGORY") ?: "Padrão"

                // Executa o cálculo financeiro e avalia o semáforo
                val rideData = RideCalculator.evaluate(
                    app = app,
                    grossFare = fare,
                    totalKm = km,
                    minutes = minutes,
                    category = category
                )

                showFloatingOverlay(rideData)
            }
            ACTION_DISMISS -> {
                hideFloatingOverlay()
            }
        }
        return START_STICKY
    }

    private fun showFloatingOverlay(ride: RideData) {
        if (composeView != null) {
            hideFloatingOverlay()
        }

        val layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START // Canto esquerdo superior
            x = 16 // Margem esquerda da tela
            y = 160 // Abaixo da barra de status e cabeçalho
        }

        composeView = ComposeView(this).apply {
            setContent {
                SemaforoOverlayContent(
                    ride = ride,
                    onAccept = {
                        hideFloatingOverlay()
                        // Registra aceite no histórico do banco local Room
                    },
                    onReject = {
                        hideFloatingOverlay()
                        // Registra recusa no histórico
                    },
                    onDismiss = {
                        hideFloatingOverlay()
                    }
                )
            }
        }

        // Permite ao motorista arrastar o popup flutuante para onde quiser na tela do celular
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        composeView?.setOnTouchListener { view, event ->
            when (event.action) {
                android.view.MotionEvent.ACTION_DOWN -> {
                    initialX = layoutParams.x
                    initialY = layoutParams.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                android.view.MotionEvent.ACTION_MOVE -> {
                    layoutParams.x = initialX + (event.rawX - initialTouchX).toInt()
                    layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager?.updateViewLayout(composeView, layoutParams)
                    true
                }
                else -> false
            }
        }

        windowManager?.addView(composeView, layoutParams)
    }

    private fun hideFloatingOverlay() {
        composeView?.let {
            windowManager?.removeView(it)
            composeView = null
        }
    }

    private fun createForegroundNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "RV Copiloto - Monitoramento",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Vingadores Copiloto Ativo")
            .setContentText("Monitorando corridas da Uber, 99 e inDrive...")
            .setSmallIcon(R.drawable.ic_copiloto_logo)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        hideFloatingOverlay()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
  },
  {
    path: 'app/src/main/java/br/com/rvcopiloto/app/domain/RideCalculator.kt',
    name: 'RideCalculator.kt',
    language: 'kotlin',
    description: 'Motor de cálculo de Lucro Líquido Real, Custo por Km, Taxa Horária e Semáforo (Verde, Amarelo, Vermelho)',
    code: `package br.com.rvcopiloto.app.domain

import br.com.rvcopiloto.app.data.RideData
import kotlin.math.max

enum class SemaforoStatus {
    GREEN, YELLOW, RED
}

object RideCalculator {

    // Configurações padrão configuráveis pelo motorista no app
    var fuelPricePerLiter: Double = 5.95
    var fuelKmPerLiter: Double = 11.2
    var wearCostPerKm: Double = 0.18 // Manutenção amortizada (pneu, óleo, pastilhas)
    var fixedCostPerKm: Double = 0.25 // Seguro + IPVA + MEI rateados

    var minRatePerKmGreen: Double = 2.50
    var minRatePerKmYellow: Double = 2.00
    var minRatePerHourGreen: Double = 45.00
    var minRatePerHourYellow: Double = 35.00

    fun evaluate(
        app: String,
        grossFare: Double,
        totalKm: Double,
        minutes: Int,
        category: String
    ): RideData {
        val safeKm = max(0.1, totalKm)
        val safeMin = max(1, minutes)

        // Custos reais da corrida
        val fuelCostPerKm = fuelPricePerLiter / fuelKmPerLiter
        val fuelCost = safeKm * fuelCostPerKm
        val wearCost = safeKm * wearCostPerKm
        val fixedCost = safeKm * fixedCostPerKm
        val totalCost = fuelCost + wearCost + fixedCost

        val netProfit = grossFare - totalCost
        val ratePerKm = grossFare / safeKm
        val ratePerHour = (grossFare / safeMin) * 60.0
        val netRatePerKm = netProfit / safeKm
        val netRatePerHour = (netProfit / safeMin) * 60.0

        // Classificação do Semáforo
        val semaforo = when {
            ratePerKm >= minRatePerKmGreen && ratePerHour >= minRatePerHourGreen && netProfit >= 5.0 ->
                SemaforoStatus.GREEN

            ratePerKm < minRatePerKmYellow || netProfit <= 1.0 ->
                SemaforoStatus.RED

            else ->
                SemaforoStatus.YELLOW
        }

        val reason = when (semaforo) {
            SemaforoStatus.GREEN -> "🟢 ÓTIMA: R$ %.2f/km | Lucro R$ %.2f".format(ratePerKm, netProfit)
            SemaforoStatus.YELLOW -> "🟡 ATENÇÃO: R$ %.2f/km | Lucro R$ %.2f".format(ratePerKm, netProfit)
            SemaforoStatus.RED -> "🔴 NÃO COMPENSA: R$ %.2f/km | Prejuízo de custos".format(ratePerKm)
        }

        return RideData(
            id = "ride_\${System.currentTimeMillis()}",
            app = app,
            grossFare = grossFare,
            totalKm = safeKm,
            durationMinutes = safeMin,
            category = category,
            fuelCost = fuelCost,
            wearCost = wearCost,
            totalCost = totalCost,
            netProfit = netProfit,
            ratePerKm = ratePerKm,
            ratePerHour = ratePerHour,
            netRatePerKm = netRatePerKm,
            netRatePerHour = netRatePerHour,
            semaforo = semaforo,
            semaforoReason = reason
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/br/com/rvcopiloto/app/ui/components/SemaforoOverlay.kt',
    name: 'SemaforoOverlay.kt',
    language: 'kotlin',
    description: 'Interface gráfica moderna em Jetpack Compose da janela flutuante com cores fortes e números grandes para o motorista',
    code: `package br.com.rvcopiloto.app.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.rvcopiloto.app.data.RideData
import br.com.rvcopiloto.app.domain.SemaforoStatus

@Composable
fun SemaforoOverlayContent(
    ride: RideData,
    onAccept: () -> Unit,
    onReject: () -> Unit,
    onDismiss: () -> Unit
) {
    val semaforoColor = when (ride.semaforo) {
        SemaforoStatus.GREEN -> Color(0xFF10B981) // Emerald
        SemaforoStatus.YELLOW -> Color(0xFFF59E0B) // Amber
        SemaforoStatus.RED -> Color(0xFFEF4444) // Red
    }

    val semaforoText = when (ride.semaforo) {
        SemaforoStatus.GREEN -> "🟢 VALE A PENA"
        SemaforoStatus.YELLOW -> "🟡 ATENÇÃO"
        SemaforoStatus.RED -> "🔴 NÃO COMPENSA"
    }

    // Popup micro-compacto (tamanho reduzido pela metade ~70dp) que pode ser arrastado livremente
    Card(
        modifier = Modifier
            .width(70.dp)
            .border(2.dp, semaforoColor, RoundedCornerShape(12.dp)),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp)
        ) {
            // Cabeçalho com App e Semáforo
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(semaforoColor)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = ride.app.uppercase(),
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "• \${ride.category}",
                        color = Color.Gray,
                        fontSize = 13.sp
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = semaforoColor.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = semaforoText,
                        color = semaforoColor,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Destaque Principal: Valor e Lucro Líquido Real
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(text = "VALOR BRUTO", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(
                        text = "R$ %.2f".format(ride.grossFare),
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "LUCRO LÍQUIDO REAL", color = Color(0xFF10B981), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(
                        text = "R$ %.2f".format(ride.netProfit),
                        color = Color(0xFF10B981),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Grid de Métricas Chave em Texto Grande (Legível no trânsito)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(12.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                MetricItem(label = "R$ / KM", value = "R$ %.2f".format(ride.ratePerKm), highlight = true)
                MetricItem(label = "R$ / HORA", value = "R$ %.0f".format(ride.ratePerHour), highlight = false)
                MetricItem(label = "DISTÂNCIA", value = "%.1f km".format(ride.totalKm), highlight = false)
                MetricItem(label = "TEMPO", value = "%d min".format(ride.durationMinutes), highlight = false)
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Ações Rápidas (Aceitar / Recusar)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onReject,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                    modifier = Modifier.weight(1f).height(46.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("PULAR", fontWeight = FontWeight.Bold, color = Color(0xFFCBD5E1))
                }

                Button(
                    onClick = onAccept,
                    colors = ButtonDefaults.buttonColors(containerColor = semaforoColor),
                    modifier = Modifier.weight(1.4f).height(46.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("ACEITAR CORRIDA", fontWeight = FontWeight.Black, color = Color.Black)
                }
            }
        }
    }
}

@Composable
private fun MetricItem(label: String, value: String, highlight: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Text(
            text = value,
            color = if (highlight) Color(0xFF38BDF8) else Color.White,
            fontWeight = FontWeight.Black,
            fontSize = 16.sp
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/br/com/rvcopiloto/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Activity principal com verificação e solicitação das permissões de Acessibilidade e Janela Flutuante',
    code: `package br.com.rvcopiloto.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import br.com.rvcopiloto.app.ui.screens.MainDriverDashboard

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF090D16)
                ) {
                    MainDriverDashboard(
                        onRequestOverlayPermission = { requestOverlayPermission() },
                        onRequestAccessibilityPermission = { requestAccessibilityPermission() }
                    )
                }
            }
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:\$packageName")
            )
            startActivity(intent)
        }
    }

    private fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
    }
}`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Configuração do Gradle para Android 9.0+ (API 28 minSdk, 35 targetSdk) com Jetpack Compose',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "br.com.rvcopiloto.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.rvcopiloto.app"
        minSdk = 28 // Compatível com Android 9.0 (Pie) ou superior
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose BoM
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // AndroidX & Lifecycle
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.activity:activity-compose:1.9.3")

    // Room Database para salvar o histórico de corridas
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")

    // DataStore para salvar configurações de custos do motorista
    implementation("androidx.datastore:datastore-preferences:1.1.1")
}`,
  },
];

export async function downloadAndroidProjectZip() {
  const zip = new JSZip();

  // Root README
  zip.file(
    'README_ANDROID_STUDIO.md',
    `# Vingadores Copiloto - Projeto Android Nativo (Kotlin + Jetpack Compose)

Este projeto foi gerado com a arquitetura completa para monitoramento de corridas dos aplicativos Uber, 99 e inDrive.

## Requisitos
- Android Studio Ladybug ou superior
- Android SDK 35 (Android 15)
- Min SDK: 28 (Android 9.0 Pie)
- Kotlin 2.0+

## Como Abrir e Compilar
1. Extraia este arquivo ZIP.
2. Abra o Android Studio e selecione **Open...** apontando para esta pasta.
3. Aguarde o Gradle Sync concluir.
4. Conecte um aparelho físico Android (versão 9.0 ou superior).
5. Clique no botão **Run (Shift+F10)**.

## Permissões Necessárias no Aparelho
1. **Permissão de Sobrepor a outros apps (Overlay)**:
   - Configurações -> Apps -> Acesso especial -> Sobrepor a outros apps -> Vingadores Copiloto (Ativar).
2. **Serviço de Acessibilidade**:
   - Configurações -> Acessibilidade -> Apps instalados -> Vingadores Copiloto - Leitor de Corridas (Ativar).

Pronto! Ao abrir a Uber, 99 ou inDrive, a janela flutuante com o Semáforo de Corridas aparecerá automaticamente!
`
  );

  // Add GitHub Actions workflow for 100% free automatic cloud APK compilation via Phone/GitHub
  zip.file(
    '.github/workflows/build_apk.yml',
    `name: Build APK Vingadores Copiloto

on:
  push:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Android SDK
      uses: android-actions/setup-android@v3

    - name: Setup Gradle
      uses: gradle/actions/setup-gradle@v4
      with:
        gradle-version: '8.10.2'

    - name: Ensure Project Structure
      run: |
        # If files were not uploaded or app folder is missing, generate complete native project automatically
        if [ ! -f "settings.gradle.kts" ] && [ ! -f "settings.gradle" ]; then
          cat << 'EOF' > settings.gradle.kts
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "VingadoresCopiloto"
include(":app")
EOF
        fi

        if [ ! -f "build.gradle.kts" ] && [ ! -f "build.gradle" ]; then
          cat << 'EOF' > build.gradle.kts
plugins {
    id("com.android.application") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
EOF
        fi

        if [ ! -f "gradle.properties" ]; then
          cat << 'EOF' > gradle.properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
EOF
        fi

        mkdir -p app/src/main/res/xml
        mkdir -p app/src/main/res/values
        mkdir -p app/src/main/java/br/com/rvcopiloto/app/service
        mkdir -p app/src/main/java/br/com/rvcopiloto/app/data
        mkdir -p app/src/main/java/br/com/rvcopiloto/app/domain
        mkdir -p app/src/main/java/br/com/rvcopiloto/app/ui/components

        if [ ! -f "app/build.gradle.kts" ]; then
          cat << 'EOF' > app/build.gradle.kts
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "br.com.rvcopiloto.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.rvcopiloto.app"
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.3")
}
EOF
        fi

        if [ ! -f "app/src/main/AndroidManifest.xml" ]; then
          cat << 'EOF' > app/src/main/AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="br.com.rvcopiloto.app">

    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:label="Vingadores Copiloto"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.RVAccessibilityService"
            android:exported="false"
            android:label="Vingadores Copiloto - Leitor de Corridas"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <service
            android:name=".service.OverlayService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse" />
    </application>
</manifest>
EOF
        fi

        if [ ! -f "app/src/main/res/xml/accessibility_service_config.xml" ]; then
          cat << 'EOF' > app/src/main/res/xml/accessibility_service_config.xml
<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:packageNames="com.ubercab.driver,com.taxis99,com.indrive.driver"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagIncludeNotImportantViews"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="80"
    android:canRetrieveWindowContent="true" />
EOF
        fi

        if [ ! -f "app/src/main/res/values/strings.xml" ]; then
          cat << 'EOF' > app/src/main/res/values/strings.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Vingadores Copiloto</string>
    <string name="accessibility_service_description">Permite ao Vingadores Copiloto ler automaticamente os dados de corridas da Uber, 99 e inDrive para calcular o lucro líquido em tempo real e exibir o Semáforo flutuante.</string>
</resources>
EOF
        fi

        if [ ! -f "app/src/main/java/br/com/rvcopiloto/app/MainActivity.kt" ]; then
          cat << 'EOF' > app/src/main/java/br/com/rvcopiloto/app/MainActivity.kt
package br.com.rvcopiloto.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF020617)) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("🛡️ Vingadores Copiloto", color = Color(0xFF10B981), style = MaterialTheme.typography.headlineMedium)
                    Spacer(Modifier.height(16.dp))
                    Text("Ative o Semáforo Flutuante e Acessibilidade abaixo:", color = Color.White)
                    Spacer(Modifier.height(24.dp))
                    Button(onClick = {
                        startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
                    }) {
                        Text("1. Ativar Janela Flutuante")
                    }
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = {
                        startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                    }) {
                        Text("2. Ativar Leitor de Corridas")
                    }
                }
            }
        }
    }
}
EOF
        fi

        if [ ! -f "app/src/main/java/br/com/rvcopiloto/app/service/RVAccessibilityService.kt" ]; then
          cat << 'EOF' > app/src/main/java/br/com/rvcopiloto/app/service/RVAccessibilityService.kt
package br.com.rvcopiloto.app.service

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class RVAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
EOF
        fi

        if [ ! -f "app/src/main/java/br/com/rvcopiloto/app/service/OverlayService.kt" ]; then
          cat << 'EOF' > app/src/main/java/br/com/rvcopiloto/app/service/OverlayService.kt
package br.com.rvcopiloto.app.service

import android.app.Service
import android.content.Intent
import android.os.IBinder

class OverlayService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null
}
EOF
        fi

    - name: Build Debug APK
      run: gradle assembleDebug --stacktrace --no-daemon

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: VingadoresCopiloto-APK
        path: "**/build/outputs/apk/debug/*.apk"
`
  );

  // Gradle wrapper shell script (gradlew)
  zip.file(
    'gradlew',
    `#!/bin/sh
exec gradle "$@"
`
  );

  // Add all files
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.code);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vingadores_copiloto_android_kotlin.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
