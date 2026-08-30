import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:radio90fm/core/constants/app_constants.dart';
import 'package:radio90fm/models/station_config.dart';

class RadioConfigRepository {
  final SharedPreferences _prefs;

  RadioConfigRepository(this._prefs);

  StationConfig getCachedConfig() {
    final cachedStr = _prefs.getString(AppConstants.keyStationConfig);
    if (cachedStr != null && cachedStr.isNotEmpty) {
      return StationConfig.decode(cachedStr);
    }
    return StationConfig.emergency();
  }

  Future<StationConfig> fetchConfig({String? baseUrl}) async {
    final apiBase = baseUrl ?? AppConstants.defaultApiBaseUrl;
    final url = Uri.parse('$apiBase/public/config');

    try {
      final response = await http.get(url).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] != null) {
          final config = StationConfig.fromJson(body['data']);
          await _prefs.setString(AppConstants.keyStationConfig, config.encode());
          return config;
        }
      }
    } catch (_) {
      // Failure isolation: log error and return cached config
    }

    return getCachedConfig();
  }
}
