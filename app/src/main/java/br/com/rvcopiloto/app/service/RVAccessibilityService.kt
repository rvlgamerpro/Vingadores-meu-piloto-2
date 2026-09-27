package br.com.rvcopiloto.app.service

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

        val fareRegex = Pattern.compile("R\\$\\s*([0-9]+[\\.,][0-9]{2})")
        val kmRegex = Pattern.compile("([0-9]+[\\.,]?[0-9]*)\\s*(?:km|quilômetros)", Pattern.CASE_INSENSITIVE)
        val minRegex = Pattern.compile("([0-9]+)\\s*(?:min|minutos)", Pattern.CASE_INSENSITIVE)

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
        val fareRegex = Pattern.compile("(?:R\\$|R\\$ )([0-9]+[\\.,][0-9]{2})")
        val kmRegex = Pattern.compile("([0-9]+[\\.,]?[0-9]*)\\s*km")
        val minRegex = Pattern.compile("([0-9]+)\\s*min")

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
}