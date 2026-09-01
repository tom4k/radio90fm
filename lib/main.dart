import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:audio_service/audio_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:radio90fm/app/app.dart';
import 'package:radio90fm/providers/app_providers.dart';
import 'package:radio90fm/services/radio_audio_service.dart';

import 'package:radio90fm/services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Initialize SharedPreferences
  final prefs = await SharedPreferences.getInstance();

  // 2. Initialize AudioService safely
  AudioHandler? audioHandler;
  try {
    audioHandler = await AudioService.init(
      builder: () => RadioAudioHandler(),
      config: const AudioServiceConfig(
        androidNotificationChannelId: 'com.radio90fm.audio',
        androidNotificationChannelName: 'Radio 90 FM Live',
        androidNotificationOngoing: true,
        androidStopForegroundOnPause: true,
      ),
    );
  } catch (e) {
    debugPrint('AudioService init warning: $e');
  }

  // 3. Initialize NotificationService in background without blocking splash screen / UI render
  NotificationService().init(prefs).catchError((e) {
    debugPrint('NotificationService init warning: $e');
  });

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        if (audioHandler != null)
          audioHandlerProvider.overrideWithValue(audioHandler as RadioAudioHandler),
      ],
      child: const RadioApp(),
    ),
  );
}
