import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:text_scroll/text_scroll.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/providers/app_providers.dart';
import 'package:radio90fm/services/radio_audio_service.dart';
import 'package:radio90fm/widgets/live_contact_actions.dart';
import 'package:radio90fm/widgets/liquid_glass_card.dart';

class ListenScreen extends ConsumerWidget {
  const ListenScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final onAirAsync = ref.watch(onAirProvider);
    final audioStateAsync = ref.watch(audioStateProvider);
    final audioHandler = ref.watch(audioHandlerProvider);

    final currentState = audioStateAsync.value ?? audioHandler.currentCustomState;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Large Prominent Radio 90 FM Logo
            Center(
              child: Image.asset(
                'assets/images/icon.png',
                width: 320,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 20),

            // NOW ON AIR CARD
            onAirAsync.when(
              data: (onAir) => Column(
                children: [
                  if (!onAir.isNetworkAvailable) ...[
                    LiquidGlassCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      borderColor: Colors.amber.withValues(alpha: 0.6),
                      backgroundColor: Colors.amber.withValues(alpha: 0.12),
                      child: const Row(
                        children: [
                          Icon(Icons.wifi_off_rounded, color: Colors.amber, size: 22),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'No Network Connection',
                                  style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Please check your internet connection.',
                                  style: TextStyle(color: Colors.white70, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  LiquidGlassCard(
                    borderColor: !onAir.isNetworkAvailable
                        ? Colors.amber.withValues(alpha: 0.5)
                        : onAir.isLiveOverride
                            ? AppTheme.primaryRed
                            : Colors.white.withValues(alpha: 0.18),
                    borderWidth: onAir.isLiveOverride ? 1.5 : 1.0,
                    child: Column(
                      children: [
                        // Live / Offline Badge
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: !onAir.isNetworkAvailable
                                    ? Colors.amber
                                    : onAir.isLiveOverride
                                        ? Colors.amber
                                        : AppTheme.primaryRed,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              !onAir.isNetworkAvailable
                                  ? '● OFFLINE'
                                  : onAir.isLiveOverride
                                      ? 'SPECIAL LIVE OVERRIDE'
                                      : '● LIVE NOW',
                              style: TextStyle(
                                color: !onAir.isNetworkAvailable
                                    ? Colors.amber
                                    : onAir.isLiveOverride
                                        ? Colors.amber
                                        : AppTheme.primaryRed,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Program Title
                        Text(
                          onAir.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        if (onAir.presenter.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Presenter: ${onAir.presenter}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 14,
                            ),
                          ),
                        ],

                        const SizedBox(height: 20),

                        // Live Communication Buttons
                        LiveContactActions(
                          phone: onAir.phone,
                          whatsapp: onAir.whatsapp,
                          enableCall: onAir.enableCall,
                          enableWhatsapp: onAir.enableWhatsapp,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              loading: () => const LiquidGlassCard(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: CircularProgressIndicator(color: AppTheme.primaryRed),
                ),
              ),
              error: (err, _) => const LiquidGlassCard(
                child: Center(
                  child: Text(
                    'Radio 90 FM Live',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 32),

            // AUDIO PLAYER CONTROLS
            _buildPlayerControl(context, currentState, audioHandler),

            const SizedBox(height: 24),

            // Text Ticker Message
            _buildStatusTicker(currentState),

            const SizedBox(height: 32),

            // UP NEXT CARD
            onAirAsync.when(
              data: (onAir) {
                if (onAir.nextTitle == null) return const SizedBox.shrink();
                return LiquidGlassCard(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryRed.withValues(alpha: 0.18),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.skip_next_rounded,
                          color: AppTheme.primaryRed,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'UP NEXT',
                              style: TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              onAir.nextTitle!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (onAir.nextPresenter != null)
                              Text(
                                onAir.nextPresenter!,
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlayerControl(
    BuildContext context,
    CustomAudioState state,
    RadioAudioHandler audioHandler,
  ) {
    final isPlaying = state == CustomAudioState.playing;
    final isLoading = state == CustomAudioState.connecting ||
        state == CustomAudioState.buffering ||
        state == CustomAudioState.reconnecting;

    return GestureDetector(
      onTap: () {
        if (isPlaying || isLoading) {
          audioHandler.pause();
        } else {
          audioHandler.play();
        }
      },
      child: Container(
        width: 96,
        height: 96,
        decoration: BoxDecoration(
          color: AppTheme.primaryRed,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryRed.withValues(alpha: isPlaying ? 0.6 : 0.35),
              blurRadius: isPlaying ? 24 : 12,
              spreadRadius: isPlaying ? 4 : 1,
            ),
          ],
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 44,
                  height: 44,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3.5,
                  ),
                )
              : Icon(
                  isPlaying
                      ? Icons.pause_rounded
                      : Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 56,
                ),
        ),
      ),
    );
  }

  Widget _buildStatusTicker(CustomAudioState state) {
    String text = 'Radio 90 FM Live from Amal Jyothi College of Engineering';
    Color textColor = AppTheme.primaryRed;

    switch (state) {
      case CustomAudioState.connecting:
        text = 'Connecting to Radio 90 FM...';
        textColor = Colors.amber;
        break;
      case CustomAudioState.buffering:
        text = 'Buffering live audio...';
        textColor = Colors.amber;
        break;
      case CustomAudioState.reconnecting:
        text = 'Connection lost — reconnecting...';
        textColor = Colors.orange;
        break;
      case CustomAudioState.offline:
        text = 'Offline — Check your internet connection';
        textColor = Colors.grey;
        break;
      case CustomAudioState.error:
        text = 'Unable to connect to live stream';
        textColor = Colors.redAccent;
        break;
      default:
        break;
    }

    return TextScroll(
      '$text                                                 ',
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      velocity: const Velocity(pixelsPerSecond: Offset(35, 0)),
    );
  }
}
