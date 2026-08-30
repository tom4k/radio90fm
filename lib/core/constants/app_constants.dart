class AppConstants {
  static const String appName = 'Radio 90 FM';
  static const String tagline = 'Voice of Amal Jyothi';

  // Default API Base URL (Configurable via --dart-define=API_BASE_URL=...)
  static const String defaultApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );

  // Emergency fallback stream URL
  static const String emergencyStreamUrl =
      'https://icecast.octosignals.com/radio90_final';

  // Emergency contact details
  static const String defaultPhone = '9496345029';
  static const String defaultWhatsapp = '9048389090';
  static const String defaultEmail = 'radio90@amaljyothi.ac.in';
  static const String defaultWebsite = 'https://radio90.in';
  static const String shareAppUrl = 'https://onelink.to/243uae';

  // Social Links
  static const String facebookUrl = 'https://www.facebook.com/fm.radio90/';
  static const String instagramUrl = 'https://www.instagram.com/radio90.fm';
  static const String youtubeUrl = 'https://youtube.com/@radio90fm13';
  static const String spotifyUrl =
      'https://open.spotify.com/show/68Ii81VKFBzRWKnEo2y1Oe';
  static const String twitterUrl = 'https://twitter.com/Radio90FM_AJCE';

  // Cache Keys
  static const String keyStationConfig = 'cache_station_config';
  static const String keyScheduleData = 'cache_schedule_data';
  static const String keyConfigVersion = 'cache_config_version';
  static const String keyLastUpdated = 'cache_last_updated';
}
