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

final stationConfigProvider = FutureProvider<StationConfig>((ref) async {
  final repo = ref.watch(radioConfigRepoProvider);
  final config = await repo.fetchConfig();
  
  // Pass stream URL to audio handler
  final audioHandler = ref.watch(audioHandlerProvider);
  audioHandler.updateStreamUrl(config.streamUrl);

  return config;
});

final weeklyScheduleProvider = FutureProvider<List<Program>>((ref) async {
  final repo = ref.watch(scheduleRepoProvider);
  return await repo.fetchSchedule();
});

final onAirProvider = FutureProvider<OnAirData>((ref) async {
  final repo = ref.watch(scheduleRepoProvider);
  final onAir = await repo.fetchOnAir();

  // Update media notification details
  final audioHandler = ref.watch(audioHandlerProvider);
  final config = ref.watch(stationConfigProvider).value;
  audioHandler.updateStreamUrl(
    config?.streamUrl ?? 'https://icecast.octosignals.com/radio90_final',
    title: onAir.title,
    presenter: onAir.presenter,
  );

  return onAir;
});

final audioStateProvider = StreamProvider<CustomAudioState>((ref) {
  final audioHandler = ref.watch(audioHandlerProvider);
  return audioHandler.customStateStream;
});
