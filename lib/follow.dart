import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class Follow extends StatelessWidget {
  const Follow({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Center(
          child: Text(
            "Follow us on",
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://www.facebook.com/fm.radio90/'));
              },
              icon: const FaIcon(
                FontAwesomeIcons.facebook,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://youtube.com/@radio90fm13'));
              },
              icon: const FaIcon(
                FontAwesomeIcons.youtube,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://www.instagram.com/radio90.fm'));
              },
              icon: const FaIcon(
                FontAwesomeIcons.instagram,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://wa.me/9048389090'));
              },
              icon: const FaIcon(
                FontAwesomeIcons.whatsapp,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://twitter.com/Radio90FM_AJCE'));
              },
              icon: const FaIcon(
                FontAwesomeIcons.xTwitter,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(
                  Uri.parse('https://open.spotify.com/show/68Ii81VKFBzRWKnEo2y1Oe'),
                );
              },
              icon: const FaIcon(
                FontAwesomeIcons.spotify,
                size: 30,
                color: Colors.white,
              ),
            ),
          ],
        )
      ],
    );
  }
}