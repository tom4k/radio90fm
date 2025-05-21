import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class Follow extends StatelessWidget {
  const Follow({super.key});

  @override
  Widget build(BuildContext context) {
    return  Column(
      
      children: [
        Center(
          child: Text(
            "Follow us on",
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ),
        Row(
          children: [
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://www.facebook.com/fm.radio90/'));
              },
              icon: FaIcon(
                FontAwesomeIcons.facebook,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://youtube.com/@radio90fm13'));
              },
              icon: FaIcon(
                FontAwesomeIcons.youtube,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://www.instagram.com/radio90.fm'));
              },
              icon: FaIcon(
                FontAwesomeIcons.instagram,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://wa.me/9048389090'));
              },
              icon: FaIcon(
                FontAwesomeIcons.whatsapp,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse('https://twitter.com/Radio90FM_AJCE'));
              },
              icon: FaIcon(
                FontAwesomeIcons.xTwitter,
                size: 30,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: () {
                launchUrl(Uri.parse(
                    'https://open.spotify.com/show/68Ii81VKFBzRWKnEo2y1Oe'));
              },
              icon: FaIcon(
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