import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/providers/app_providers.dart';

class ContactScreen extends ConsumerWidget {
  const ContactScreen({super.key});

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configAsync = ref.watch(stationConfigProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contact & Social'),
      ),
      body: configAsync.when(
        data: (config) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo Banner
              Center(
                child: Image.asset(
                  'assets/images/logo2.png',
                  height: 100,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 24),

              // Address Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Station Director',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryRed,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text('Community Radio 90 FM'),
                      Text('Amal Jyothi College of Engineering'),
                      Text('Kanjirappally, Koovappally P.O'),
                      Text('Kottayam Dt., Kerala, India - 686518'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Phone & Email Card
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.email_rounded, color: AppTheme.primaryRed),
                      title: const Text('Email Us'),
                      subtitle: Text(config.email),
                      onTap: () => _launch('mailto:${config.email}'),
                    ),
                    const Divider(height: 1, color: Color(0xFF262626)),
                    ListTile(
                      leading: const Icon(Icons.phone_rounded, color: AppTheme.primaryRed),
                      title: const Text('Program Director'),
                      subtitle: const Text('9496345029'),
                      onTap: () => _launch('tel:9496345029'),
                    ),
                    const Divider(height: 1, color: Color(0xFF262626)),
                    ListTile(
                      leading: const Icon(Icons.phone_android_rounded, color: AppTheme.primaryRed),
                      title: const Text('Assistant Program Director'),
                      subtitle: const Text('9207057969 / 8138909064'),
                      onTap: () => _launch('tel:9207057969'),
                    ),
                    const Divider(height: 1, color: Color(0xFF262626)),
                    ListTile(
                      leading: const Icon(Icons.person_rounded, color: AppTheme.primaryRed),
                      title: const Text('PRO & Marketing Manager'),
                      subtitle: const Text('Sino Antony (9020434574)'),
                      onTap: () => _launch('tel:9020434574'),
                    ),
                    const Divider(height: 1, color: Color(0xFF262626)),
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.whatsapp, color: Color(0xFF25D366)),
                      title: const Text('Official WhatsApp'),
                      subtitle: Text(config.whatsapp),
                      onTap: () => _launch('https://wa.me/91${config.whatsapp}'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Social Media Grid
              const Text(
                'Follow Us On Social Media',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  IconButton(
                    icon: const FaIcon(FontAwesomeIcons.facebook, size: 28, color: Colors.white),
                    onPressed: () => _launch(config.facebookUrl),
                  ),
                  IconButton(
                    icon: const FaIcon(FontAwesomeIcons.youtube, size: 28, color: Colors.white),
                    onPressed: () => _launch(config.youtubeUrl),
                  ),
                  IconButton(
                    icon: const FaIcon(FontAwesomeIcons.instagram, size: 28, color: Colors.white),
                    onPressed: () => _launch(config.instagramUrl),
                  ),
                  IconButton(
                    icon: const FaIcon(FontAwesomeIcons.spotify, size: 28, color: Colors.white),
                    onPressed: () => _launch(config.spotifyUrl),
                  ),
                  IconButton(
                    icon: const FaIcon(FontAwesomeIcons.xTwitter, size: 28, color: Colors.white),
                    onPressed: () => _launch(config.twitterUrl),
                  ),
                ],
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primaryRed)),
        error: (_, __) => const Center(child: Text('Failed to load contact info')),
      ),
    );
  }
}
