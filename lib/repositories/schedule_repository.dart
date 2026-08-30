import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:radio90fm/core/constants/app_constants.dart';
import 'package:radio90fm/models/program.dart';
import 'package:radio90fm/models/on_air_data.dart';

class ScheduleRepository {
  final SharedPreferences _prefs;

  ScheduleRepository(this._prefs);

  List<Program> getCachedSchedule() {
    final cachedStr = _prefs.getString(AppConstants.keyScheduleData);
    if (cachedStr != null && cachedStr.isNotEmpty) {
      return Program.decodeList(cachedStr);
    }
    return [];
  }

  Future<List<Program>> fetchSchedule({String? baseUrl}) async {
    final apiBase = baseUrl ?? AppConstants.defaultApiBaseUrl;
    final url = Uri.parse('$apiBase/public/schedule');

    try {
      final response = await http.get(url).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] != null) {
          final List<dynamic> listData = body['data'];
          final programs = listData.map((j) => Program.fromJson(j)).toList();
          await _prefs.setString(
            AppConstants.keyScheduleData,
            Program.encodeList(programs),
          );
          return programs;
        }
      }
    } catch (_) {
      // Failure isolation
    }

    return getCachedSchedule();
  }

  Future<OnAirData> fetchOnAir({String? baseUrl}) async {
    final apiBase = baseUrl ?? AppConstants.defaultApiBaseUrl;
    final url = Uri.parse('$apiBase/public/on-air');

    try {
      final response = await http.get(url).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] != null) {
          return OnAirData.fromJson(body['data']);
        }
      }
    } catch (_) {
      // Failure isolation
    }

    return OnAirData.emergency();
  }
}
