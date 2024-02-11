import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:text_scroll/text_scroll.dart';

class Player extends StatefulWidget {
  const Player({Key? key}) : super(key: key);

  @override
  State<Player> createState() => _PlayerState();
}

class _PlayerState extends State<Player> {
  late AudioPlayer _audioPlayer;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _audioPlayer = AudioPlayer()
      //..setUrl('https://d3i39hzrvzmmlb.cloudfront.net/ajceradio.m3u8');
      ..setAudioSource(AudioSource.uri(
        Uri.parse('https://d3i39hzrvzmmlb.cloudfront.net/ajceradio.m3u8'),
        tag: MediaItem(
          // Specify a unique ID for each media item:
          id: '1',
          // Metadata to display in the notification:
          album: "Radio 90 PM",
          title: "Voice of Amal Jyothi",
          artUri: Uri.parse(
              'https://radio90.in/wp-content/uploads/2023/01/Logo-Black-Png.png'),
        ),
      ));
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 100),
      child: Center(
        child: SizedBox(
            width: double.infinity,
            child: StreamBuilder<PlayerState>(
              stream: _audioPlayer.playerStateStream,
              builder: (context, snapshot) {
                final playerState = snapshot.data;
                final processingState = playerState?.processingState;
                final playing = playerState?.playing;
                if (!(playing ?? false)) {
                  return IconButton(
                    onPressed: _audioPlayer.play,
                    icon: const Icon(Icons.play_circle_filled_rounded,
                        color: Colors.white),
                    iconSize: 100,
                  );
                } else if (processingState != ProcessingState.completed) {
                  return Column(
                    children: [
                      IconButton(
                        onPressed: _audioPlayer.stop,
                        icon: const Icon(Icons.pause_circle_filled_rounded,
                            color: Colors.white),
                        iconSize: 100,
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      const TextScroll(
                        "Radio 90 FM Live from Amal Jyothi College of Engineering                             ",
                        style: TextStyle(fontSize: 24, color: Colors.red),
                      )
                    ],
                  );
                }
                return const Icon(
                  Icons.plagiarism_outlined,
                  color: Colors.white,
                  size: 100,
                );
              },
            )),
      ),
    );
  }
}
