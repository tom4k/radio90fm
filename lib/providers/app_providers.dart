import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:radio90fm/core/constants/app_constants.dart';
import 'package:radio90fm/models/station_config.dart';
import 'package:radio90fm/models/program.dart';
import 'package:radio90fm/models/on_air_data.dart';
import 'package:radio90fm/repositories/radio_config_repository.dart';
import 'package:radio90fm/repositories/schedule_repository.dart';
import 'package:radio90fm/services/radio_audio_service.dart';
import 'package:radio90fm/services/notification_service.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('Initialize sharedPreferencesProvider in main()');
});

final radioConfigRepoProvider = Provider<RadioConfigRepository>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return RadioConfigRepository(prefs);
});

final scheduleRepoProvider = Provider<ScheduleRepository>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ScheduleRepository(prefs);
});

final audioHandlerProvider = Provider<RadioAudioHandler>((ref) {
  throw UnimplementedError('Initialize audioHandlerProvider in main()');
});

// Auto-refreshing StreamProvider for Station Config (polls every 30 seconds for live admin updates)
final stationConfigProvider = StreamProvider<StationConfig>((ref) async* {
  final repo = ref.watch(radioConfigRepoProvider);
  final audioHandler = ref.watch(audioHandlerProvider);

  try {
    final initialConfig = await repo.fetchConfig();
    audioHandler.updateStreamUrl(initialConfig.streamUrl);
    yield initialConfig;
  } catch (_) {}

  await for (final _ in Stream.periodic(const Duration(seconds: 30))) {
    try {
      final config = await repo.fetchConfig();
      audioHandler.updateStreamUrl(config.streamUrl);
      yield config;
    } catch (_) {}
  }
});

// Auto-refreshing StreamProvider for Weekly Schedule (polls every 30 seconds for live admin updates)
final weeklyScheduleProvider = StreamProvider<List<Program>>((ref) async* {
  final repo = ref.watch(scheduleRepoProvider);

  try {
    yield await repo.fetchSchedule();
  } catch (_) {}

  await for (final _ in Stream.periodic(const Duration(seconds: 30))) {
    try {
      yield await repo.fetchSchedule();
    } catch (_) {}
  }
});

// Auto-refreshing StreamProvider for On-Air data (polls every 8 seconds for instant admin edits & live override)
final onAirProvider = StreamProvider<OnAirData>((ref) async* {
  final repo = ref.watch(scheduleRepoProvider);
  final audioHandler = ref.watch(audioHandlerProvider);

  Future<void> processAndYield(OnAirData onAir) async {
    final config = ref.read(stationConfigProvider).value;
    audioHandler.updateStreamUrl(
      config?.streamUrl ?? 'https://icecast.octosignals.com/radio90_final',
      title: onAir.title,
      presenter: onAir.presenter,
    );
  }

  // Initial immediate fetch
  try {
    final initialOnAir = await repo.fetchOnAir();
    await processAndYield(initialOnAir);
    yield initialOnAir;
  } catch (_) {}

  // Periodic instant sync polling (every 8 seconds)
  await for (final _ in Stream.periodic(const Duration(seconds: 8))) {
    try {
      final onAir = await repo.fetchOnAir();
      await processAndYield(onAir);
      yield onAir;
    } catch (_) {}
  }
});

final audioStateProvider = StreamProvider<CustomAudioState>((ref) {
  final audioHandler = ref.watch(audioHandlerProvider);
  return audioHandler.customStateStream;
});



class AppUpdateAlertData {
  final String title;
  final String message;
  final String actionUrl;

  const AppUpdateAlertData({
    required this.title,
    required this.message,
    required this.actionUrl,
  });
}

final pendingAppUpdateAlertProvider = StateProvider<AppUpdateAlertData?>((ref) => null);

// Auto-polling for Admin Broadcast Notifications
final broadcastNotificationPollerProvider = StreamProvider<void>((ref) async* {
  final prefs = ref.watch(sharedPreferencesProvider);
  String lastSeenId = prefs.getString('last_broadcast_notif_id') ?? '';

  Future<void> checkNotifications() async {
    try {
      final url = Uri.parse('${AppConstants.defaultApiBaseUrl}/public/notifications');
      final response = await http.get(url).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] is List && (body['data'] as List).isNotEmpty) {
          final latest = (body['data'] as List).first;
          final String notifId = latest['id'] ?? '';
          final String title = latest['title'] ?? 'Radio 90 FM Alert';
          final String message = latest['message'] ?? '';
          final String type = latest['type'] ?? 'standard';
          final String actionUrl = (latest['actionUrl'] != null && (latest['actionUrl'] as String).isNotEmpty)
              ? latest['actionUrl']
              : AppConstants.shareAppUrl;
          final String targetPlatform = latest['targetPlatform'] ?? 'all';

          // Platform filtering
          if (targetPlatform == 'android' && defaultTargetPlatform != TargetPlatform.android) return;
          if (targetPlatform == 'ios' && defaultTargetPlatform != TargetPlatform.iOS) return;

          if (notifId.isNotEmpty && notifId != lastSeenId) {
            lastSeenId = notifId;
            await prefs.setString('last_broadcast_notif_id', notifId);

            final isUpdate = type == 'app_update';

            NotificationService().showNotification(
              id: notifId.hashCode,
              title: title,
              body: message,
              payload: isUpdate ? actionUrl : null,
            );

            if (isUpdate) {
              ref.read(pendingAppUpdateAlertProvider.notifier).state = AppUpdateAlertData(
                title: title,
                message: message,
                actionUrl: actionUrl,
              );
            }
          }
        }
      }
    } catch (_) {}
  }

  // Initial check
  await checkNotifications();

  // Poll every 10 seconds for new admin broadcasts
  await for (final _ in Stream.periodic(const Duration(seconds: 10))) {
    await checkNotifications();
    yield null;
  }
});
