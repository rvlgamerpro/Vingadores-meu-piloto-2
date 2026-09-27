package br.com.rvcopiloto.app.ui.components

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
                        text = "• ${ride.category}",
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
}