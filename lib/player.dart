import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:text_scroll/text_scroll.dart';
import 'package:firebase_database/firebase_database.dart';

class Player extends StatefulWidget {
  const Player({Key? key}) : super(key: key);

  @override
  State<Player> createState() => _PlayerState();
}

class _PlayerState extends State<Player> with WidgetsBindingObserver {
  late AudioPlayer _audioPlayer;
  String _url = "";
  DatabaseReference _urlref = FirebaseDatabase.instance.ref('/url');

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _urlref.onValue.listen((event) {
      setState(() {
        _url = event.snapshot.value.toString();
      });
    });

    _audioPlayer = AudioPlayer()
      //..setUrl('https://d3i39hzrvzmmlb.cloudfront.net/ajceradio.m3u8');
      ..setAudioSource(AudioSource.uri(
        //Uri.parse('https://icecast.octosignals.com/radio90_final'),
        //Uri.parse('http://stream.cseajce.in:8088/radio90'),
        //Uri.parse('http://3.110.250.189:8088/radio90'),
        Uri.parse('https://icecast.octosignals.com/radio90_final'),
        //Uri.parse('http://radio90.xyz:8088/radio90'),
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

    _audioPlayer.play();



    @override
    void dispose() {
      WidgetsBinding.instance.removeObserver(this); // Remove observer
      _audioPlayer.dispose();
      super.dispose();
    }
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
                } else if (processingState == ProcessingState.loading ||
                    processingState == ProcessingState.buffering) {
                  return Column(
                    children: [
                      Stack(
                        children: [
                          IconButton(
                            onPressed: _audioPlayer.stop,
                            icon: const Icon(Icons.pause_circle_filled_rounded,
                                color: Colors.white),
                            iconSize: 100,
                          ),
                          SizedBox(
                            child: Padding(
                              padding: const EdgeInsets.only(left: 15, top: 15),
                              child: const CircularProgressIndicator(
                                color: Colors.red,
                                strokeWidth: 5,
                              ),
                            ),
                            height: 100,
                            width: 100,
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 10,
                      ),
                      const Text(
                        "Loading...",
                        style: TextStyle(fontSize: 24, color: Colors.red),
                      )
                    ],
                  );
                } else if (processingState == ProcessingState.ready) {
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
                        "Radio 90 FM Live from Amal Jyothi College of Engineering                                                  ",
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
