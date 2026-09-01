import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:text_scroll/text_scroll.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/providers/app_providers.dart';
import 'package:radio90fm/services/radio_audio_service.dart';
import 'package:radio90fm/widgets/liquid_glass_card.dart';
import 'package:radio90fm/widgets/on_air_swipe_cards.dart';

class ListenScreen extends ConsumerWidget {
  const ListenScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final onAirAsync = ref.watch(onAirProvider);
    final audioStateAsync = ref.watch(audioStateProvider);
    final audioHandler = ref.watch(audioHandlerProvider);

    final currentState = audioStateAsync.value ?? audioHandler.currentCustomState;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Prominent Radio 90 FM Logo
            Center(
              child: Image.asset(
                'assets/images/icon.png',
                width: 250,
                fit: BoxFit.contain,
              ),
            ),

            // SWIPEABLE ON AIR & UP NEXT CARDS
            onAirAsync.when(
              data: (onAir) => OnAirSwipeCards(onAir: onAir),
              loading: () => const LiquidGlassCard(
                padding: EdgeInsets.symmetric(vertical: 30),
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

            // AUDIO PLAYER CONTROLS
            _buildPlayerControl(context, currentState, audioHandler),

            // Text Ticker Message
            _buildStatusTicker(currentState),
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
