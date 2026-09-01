import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

enum CustomAudioState {
  idle,
  connecting,
  buffering,
  playing,
  paused,
  reconnecting,
  offline,
  error,
}

class RadioAudioHandler extends BaseAudioHandler with QueueHandler, SeekHandler {
  final AudioPlayer _player = AudioPlayer();
  final Connectivity _connectivity = Connectivity();
  StreamSubscription? _connectivitySub;

  String _currentStreamUrl = '';
  bool _userIntentPlay = false;
  bool _isReconnecting = false;
  int _reconnectAttempts = 0;
  Timer? _reconnectTimer;

  final _customStateController = StreamController<CustomAudioState>.broadcast();
  Stream<CustomAudioState> get customStateStream => _customStateController.stream;
  CustomAudioState _customState = CustomAudioState.idle;

  RadioAudioHandler() {
    _init();
  }

  CustomAudioState get currentCustomState => _customState;

  void _setCustomState(CustomAudioState state) {
    _customState = state;
    _customStateController.add(state);
  }

  void _init() {
    // Media item notification setup
    mediaItem.add(
      const MediaItem(
        id: 'radio90fm_stream',
        album: 'Radio 90 FM',
        title: 'Voice of Amal Jyothi',
        artist: 'Radio 90 FM Live',
        artUri: null,
      ),
    );

    // Listen to player state stream
    _player.playerStateStream.listen((state) {
      final isPlaying = state.playing;
      final processingState = state.processingState;

      playbackState.add(
        playbackState.value.copyWith(
          controls: [
            if (isPlaying) MediaControl.pause else MediaControl.play,
            MediaControl.stop,
          ],
          systemActions: const {
            MediaAction.play,
            MediaAction.pause,
            MediaAction.stop,
          },
          androidCompactActionIndices: const [0, 1],
          processingState: _mapProcessingState(processingState),
          playing: isPlaying,
        ),
      );

      if (_isReconnecting) return;

      if (isPlaying) {
        if (processingState == ProcessingState.buffering ||
            processingState == ProcessingState.loading) {
          _setCustomState(CustomAudioState.buffering);
        } else if (processingState == ProcessingState.ready) {
          _setCustomState(CustomAudioState.playing);
          _reconnectAttempts = 0;
        }
      } else {
        if (processingState == ProcessingState.idle) {
          _setCustomState(CustomAudioState.idle);
        } else {
          _setCustomState(CustomAudioState.paused);
        }
      }
    });

    // Listen for errors
    _player.playbackEventStream.listen(
      (_) {},
      onError: (Object e, StackTrace st) {
        _handlePlaybackFailure();
      },
    );

    // Listen to connectivity changes
    _connectivitySub = _connectivity.onConnectivityChanged.listen((results) {
      final isOffline = results.contains(ConnectivityResult.none) || results.isEmpty;
      if (isOffline) {
        if (_userIntentPlay) {
          _setCustomState(CustomAudioState.offline);
        }
      } else {
        if (_userIntentPlay && (_customState == CustomAudioState.offline || _customState == CustomAudioState.error)) {
          _triggerReconnect();
        }
      }
    });
  }

  AudioProcessingState _mapProcessingState(ProcessingState state) {
    switch (state) {
      case ProcessingState.idle:
        return AudioProcessingState.idle;
      case ProcessingState.loading:
        return AudioProcessingState.loading;
      case ProcessingState.buffering:
        return AudioProcessingState.buffering;
      case ProcessingState.ready:
        return AudioProcessingState.ready;
      case ProcessingState.completed:
        return AudioProcessingState.completed;
    }
  }

  Future<void> updateStreamUrl(String newUrl, {String? title, String? presenter}) async {
    if (newUrl.isEmpty) return;

    if (title != null) {
      mediaItem.add(
        mediaItem.value?.copyWith(
          title: title,
          artist: presenter ?? 'Voice of Amal Jyothi',
        ) ??
        MediaItem(
          id: 'radio90fm_stream',
          album: 'Radio 90 FM',
          title: title,
          artist: presenter ?? 'Voice of Amal Jyothi',
        ),
      );
    }

    // Requirement 51: Only change source if streamUrl actually changed!
    if (_currentStreamUrl == newUrl) return;

    _currentStreamUrl = newUrl;

    if (_userIntentPlay) {
      await _playUrl(_currentStreamUrl);
    }
  }

  Future<void> _playUrl(String url) async {
    try {
      _setCustomState(CustomAudioState.connecting);
      await _player.stop();
      await _player.setAudioSource(AudioSource.uri(Uri.parse(url)));
      await _player.play();
    } catch (e) {
      _handlePlaybackFailure();
    }
  }

  void _handlePlaybackFailure() {
    if (!_userIntentPlay) return;

    _setCustomState(CustomAudioState.reconnecting);
    _triggerReconnect();
  }

  void _triggerReconnect() {
    _reconnectTimer?.cancel();

    if (!_userIntentPlay) return;

    // Bounded exponential backoff: 1s, 2s, 4s, 8s, 15s, 30s max
    final delays = [1, 2, 4, 8, 15, 30];
    final delaySeconds = _reconnectAttempts < delays.length
        ? delays[_reconnectAttempts]
        : 30;

    _reconnectAttempts++;
    _setCustomState(CustomAudioState.reconnecting);

    _reconnectTimer = Timer(Duration(seconds: delaySeconds), () async {
      if (!_userIntentPlay) return;
      if (_currentStreamUrl.isEmpty) return;

      try {
        await _player.setAudioSource(AudioSource.uri(Uri.parse(_currentStreamUrl)));
        await _player.play();
      } catch (_) {
        _handlePlaybackFailure();
      }
    });
  }

  @override
  Future<void> play() async {
    _userIntentPlay = true;
    _reconnectAttempts = 0;
    _setCustomState(CustomAudioState.connecting);

    if (_currentStreamUrl.isEmpty) {
      _currentStreamUrl = 'https://icecast.octosignals.com/radio90_final';
    }

    await _playUrl(_currentStreamUrl);
  }

  @override
  Future<void> pause() async {
    _userIntentPlay = false;
    _reconnectTimer?.cancel();
    await _player.pause();
    _setCustomState(CustomAudioState.paused);
  }

  @override
  Future<void> stop() async {
    _userIntentPlay = false;
    _reconnectTimer?.cancel();
    await _player.stop();
    _setCustomState(CustomAudioState.idle);
  }

  void dispose() {
    _reconnectTimer?.cancel();
    _connectivitySub?.cancel();
    _customStateController.close();
    _player.dispose();
  }
}
