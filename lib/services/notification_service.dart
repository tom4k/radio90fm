import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:radio90fm/core/constants/app_constants.dart';

class NotificationSettings {
  final bool enableNotifications;
  final bool enableShowReminders;
  final int reminderLeadMinutes; // 0, 5, 10, 15
  final bool enableLiveAlerts;
  final bool enableVibration;
  final bool enableSound;
  final bool quietHoursEnabled;
  final int quietStartHour; // e.g. 22 for 10 PM
  final int quietEndHour; // e.g. 6 for 6 AM

  const NotificationSettings({
    this.enableNotifications = true,
    this.enableShowReminders = true,
    this.reminderLeadMinutes = 5,
    this.enableLiveAlerts = true,
    this.enableVibration = true,
    this.enableSound = true,
    this.quietHoursEnabled = false,
    this.quietStartHour = 22,
    this.quietEndHour = 6,
  });

  NotificationSettings copyWith({
    bool? enableNotifications,
    bool? enableShowReminders,
    int? reminderLeadMinutes,
    bool? enableLiveAlerts,
    bool? enableVibration,
    bool? enableSound,
    bool? quietHoursEnabled,
    int? quietStartHour,
    int? quietEndHour,
  }) {
    return NotificationSettings(
      enableNotifications: enableNotifications ?? this.enableNotifications,
      enableShowReminders: enableShowReminders ?? this.enableShowReminders,
      reminderLeadMinutes: reminderLeadMinutes ?? this.reminderLeadMinutes,
      enableLiveAlerts: enableLiveAlerts ?? this.enableLiveAlerts,
      enableVibration: enableVibration ?? this.enableVibration,
      enableSound: enableSound ?? this.enableSound,
      quietHoursEnabled: quietHoursEnabled ?? this.quietHoursEnabled,
      quietStartHour: quietStartHour ?? this.quietStartHour,
      quietEndHour: quietEndHour ?? this.quietEndHour,
    );
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  SharedPreferences? _prefs;

  // Preference Keys
  static const String keyEnableNotifications = 'notif_enable_master';
  static const String keyEnableShowReminders = 'notif_enable_reminders';
  static const String keyReminderLeadMinutes = 'notif_reminder_lead_mins';
  static const String keyEnableLiveAlerts = 'notif_enable_live_alerts';
  static const String keyEnableVibration = 'notif_enable_vibration';
  static const String keyEnableSound = 'notif_enable_sound';
  static const String keyQuietHoursEnabled = 'notif_quiet_hours_enabled';
  static const String keyQuietStartHour = 'notif_quiet_start_hour';
  static const String keyQuietEndHour = 'notif_quiet_end_hour';



  static Future<void> handleNotificationPayload(String? payload) async {
    if (payload == null || payload.isEmpty) return;
    try {
      final String urlStr = payload.trim();
      final uri = Uri.parse(urlStr);
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      try {
        final fallbackUri = Uri.parse(AppConstants.shareAppUrl);
        await launchUrl(fallbackUri, mode: LaunchMode.externalApplication);
      } catch (_) {}
    }
  }

  Future<void> init(SharedPreferences prefs) async {
    _prefs = prefs;

    const androidInit = AndroidInitializationSettings('@mipmap/launcher_icon');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidInit,
      iOS: iosInit,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        handleNotificationPayload(response.payload);
      },
    );

    // Check if app was launched by tapping notification from cold start (terminated state)
    final launchDetails = await _localNotifications.getNotificationAppLaunchDetails();
    if (launchDetails?.didNotificationLaunchApp == true) {
      final payload = launchDetails?.notificationResponse?.payload;
      if (payload != null && payload.isNotEmpty) {
        handleNotificationPayload(payload);
      }
    }

    // Request Android 13+ permissions
    final androidImplementation = _localNotifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    if (androidImplementation != null) {
      await androidImplementation.requestNotificationsPermission();
    }
  }

  NotificationSettings getSettings() {
    if (_prefs == null) return const NotificationSettings();
    return NotificationSettings(
      enableNotifications: _prefs!.getBool(keyEnableNotifications) ?? true,
      enableShowReminders: _prefs!.getBool(keyEnableShowReminders) ?? true,
      reminderLeadMinutes: _prefs!.getInt(keyReminderLeadMinutes) ?? 5,
      enableLiveAlerts: _prefs!.getBool(keyEnableLiveAlerts) ?? true,
      enableVibration: _prefs!.getBool(keyEnableVibration) ?? true,
      enableSound: _prefs!.getBool(keyEnableSound) ?? true,
      quietHoursEnabled: _prefs!.getBool(keyQuietHoursEnabled) ?? false,
      quietStartHour: _prefs!.getInt(keyQuietStartHour) ?? 22,
      quietEndHour: _prefs!.getInt(keyQuietEndHour) ?? 6,
    );
  }

  Future<void> saveSettings(NotificationSettings settings) async {
    if (_prefs == null) return;
    await _prefs!.setBool(keyEnableNotifications, settings.enableNotifications);
    await _prefs!.setBool(keyEnableShowReminders, settings.enableShowReminders);
    await _prefs!.setInt(keyReminderLeadMinutes, settings.reminderLeadMinutes);
    await _prefs!.setBool(keyEnableLiveAlerts, settings.enableLiveAlerts);
    await _prefs!.setBool(keyEnableVibration, settings.enableVibration);
    await _prefs!.setBool(keyEnableSound, settings.enableSound);
    await _prefs!.setBool(keyQuietHoursEnabled, settings.quietHoursEnabled);
    await _prefs!.setInt(keyQuietStartHour, settings.quietStartHour);
    await _prefs!.setInt(keyQuietEndHour, settings.quietEndHour);
  }

  bool isQuietTime(NotificationSettings settings) {
    if (!settings.quietHoursEnabled) return false;
    final now = DateTime.now();
    final hour = now.hour;

    if (settings.quietStartHour > settings.quietEndHour) {
      // Overnight range, e.g., 22 (10 PM) to 6 (6 AM)
      return hour >= settings.quietStartHour || hour < settings.quietEndHour;
    } else {
      // Daytime range, e.g., 1 PM to 4 PM
      return hour >= settings.quietStartHour && hour < settings.quietEndHour;
    }
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? channelId,
    String? payload,
  }) async {
    final settings = getSettings();
    if (!settings.enableNotifications) return;
    if (isQuietTime(settings)) return;

    final androidDetails = AndroidNotificationDetails(
      channelId ?? 'com.radio90fm.alerts',
      'Radio 90 FM Alerts',
      channelDescription: 'Radio 90 FM program and broadcast notifications',
      importance: Importance.high,
      priority: Priority.high,
      enableVibration: settings.enableVibration,
      playSound: settings.enableSound,
    );

    const iosDetails = DarwinNotificationDetails();

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(id, title, body, details, payload: payload);
  }
}
