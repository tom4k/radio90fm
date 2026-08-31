import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:radio90fm/models/station_config.dart';
import 'package:radio90fm/models/program.dart';
import 'package:radio90fm/models/on_air_data.dart';
import 'package:radio90fm/repositories/radio_config_repository.dart';
import 'package:radio90fm/repositories/schedule_repository.dart';
import 'package:radio90fm/services/radio_audio_service.dart';

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
