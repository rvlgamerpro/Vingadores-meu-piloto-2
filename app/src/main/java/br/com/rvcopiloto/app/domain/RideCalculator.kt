package br.com.rvcopiloto.app.domain

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
            id = "ride_${System.currentTimeMillis()}",
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
}