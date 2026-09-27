package br.com.rvcopiloto.app.service

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
}