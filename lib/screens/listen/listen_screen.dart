import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:text_scroll/text_scroll.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/providers/app_providers.dart';
import 'package:radio90fm/services/radio_audio_service.dart';
import 'package:radio90fm/widgets/live_contact_actions.dart';

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
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.6)),
                    ),
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
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.cardBackground,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: !onAir.isNetworkAvailable
                          ? Colors.amber.withValues(alpha: 0.5)
                          : onAir.isLiveOverride
                              ? AppTheme.primaryRed
                              : const Color(0xFF262626),
                      width: onAir.isLiveOverride ? 1.5 : 1.0,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
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
          ),
            loading: () => Container(
              height: 140,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppTheme.cardBackground,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const CircularProgressIndicator(color: AppTheme.primaryRed),
            ),
            error: (err, _) => Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardBackground,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Radio 90 FM Live',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.cardBackground.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF262626)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryRed.withOpacity(0.15),
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

    return Stack(
      alignment: Alignment.center,
      children: [
        if (isLoading)
          const SizedBox(
            width: 104,
            height: 104,
            child: CircularProgressIndicator(
              color: AppTheme.primaryRed,
              strokeWidth: 4,
            ),
          ),
        IconButton(
          onPressed: () {
            if (isPlaying || isLoading) {
              audioHandler.pause();
            } else {
              audioHandler.play();
            }
          },
          icon: Icon(
            isPlaying || isLoading
                ? Icons.pause_circle_filled_rounded
                : Icons.play_circle_filled_rounded,
            color: Colors.white,
          ),
          iconSize: 96,
        ),
      ],
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
