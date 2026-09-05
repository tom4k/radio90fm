import 'dart:convert';
import 'package:radio90fm/core/constants/app_constants.dart';

class StationConfig {
  final String name;
  final String tagline;
  final String streamUrl;
  final bool streamEnabled;
  final String fallbackStreamUrl;
  final String phone;
  final String whatsapp;
  final String email;
  final String website;
  final String facebookUrl;
  final String instagramUrl;
  final String youtubeUrl;
  final String spotifyUrl;
  final String twitterUrl;
  final bool settingsEnabled;
  final int configVersion;

  StationConfig({
    required this.name,
    required this.tagline,
    required this.streamUrl,
    required this.streamEnabled,
    required this.fallbackStreamUrl,
    required this.phone,
    required this.whatsapp,
    required this.email,
    required this.website,
    required this.facebookUrl,
    required this.instagramUrl,
    required this.youtubeUrl,
    required this.spotifyUrl,
    required this.twitterUrl,
    required this.settingsEnabled,
    required this.configVersion,
  });

  factory StationConfig.emergency() {
    return StationConfig(
      name: AppConstants.appName,
      tagline: AppConstants.tagline,
      streamUrl: AppConstants.emergencyStreamUrl,
      streamEnabled: true,
      fallbackStreamUrl: AppConstants.emergencyStreamUrl,
      phone: AppConstants.defaultPhone,
      whatsapp: AppConstants.defaultWhatsapp,
      email: AppConstants.defaultEmail,
      website: AppConstants.defaultWebsite,
      facebookUrl: AppConstants.facebookUrl,
      instagramUrl: AppConstants.instagramUrl,
      youtubeUrl: AppConstants.youtubeUrl,
      spotifyUrl: AppConstants.spotifyUrl,
      twitterUrl: AppConstants.twitterUrl,
      settingsEnabled: true,
      configVersion: 1,
    );
  }

  factory StationConfig.fromJson(Map<String, dynamic> json) {
    final station = json['station'] ?? {};
    final stream = json['stream'] ?? {};
    final contacts = json['contacts'] ?? {};
    final socials = json['socials'] ?? {};

    return StationConfig(
      name: station['name'] ?? AppConstants.appName,
      tagline: station['tagline'] ?? AppConstants.tagline,
      streamUrl: stream['url'] ?? AppConstants.emergencyStreamUrl,
      streamEnabled: stream['enabled'] ?? true,
      fallbackStreamUrl: stream['fallbackUrl'] ?? AppConstants.emergencyStreamUrl,
      phone: contacts['phone'] ?? AppConstants.defaultPhone,
      whatsapp: contacts['whatsapp'] ?? AppConstants.defaultWhatsapp,
      email: station['email'] ?? AppConstants.defaultEmail,
      website: station['website'] ?? AppConstants.defaultWebsite,
      facebookUrl: socials['facebook'] ?? AppConstants.facebookUrl,
      instagramUrl: socials['instagram'] ?? AppConstants.instagramUrl,
      youtubeUrl: socials['youtube'] ?? AppConstants.youtubeUrl,
      spotifyUrl: socials['spotify'] ?? AppConstants.spotifyUrl,
      twitterUrl: socials['x'] ?? AppConstants.twitterUrl,
      settingsEnabled: json['settingsEnabled'] ?? station['settingsEnabled'] ?? true,
      configVersion: json['configVersion'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'station': {
        'name': name,
        'tagline': tagline,
        'email': email,
        'website': website,
      },
      'stream': {
        'url': streamUrl,
        'enabled': streamEnabled,
        'fallbackUrl': fallbackStreamUrl,
      },
      'contacts': {
        'phone': phone,
        'whatsapp': whatsapp,
      },
      'socials': {
        'facebook': facebookUrl,
        'instagram': instagramUrl,
        'youtube': youtubeUrl,
        'spotify': spotifyUrl,
        'x': twitterUrl,
      },
      'settingsEnabled': settingsEnabled,
      'configVersion': configVersion,
    };
  }

  String encode() => jsonEncode(toJson());

  factory StationConfig.decode(String str) {
    try {
      return StationConfig.fromJson(jsonDecode(str));
    } catch (_) {
      return StationConfig.emergency();
    }
  }
}
