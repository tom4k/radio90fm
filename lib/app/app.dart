import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/core/constants/app_constants.dart';
import 'package:radio90fm/screens/listen/listen_screen.dart';
import 'package:radio90fm/screens/schedule/schedule_screen.dart';
import 'package:radio90fm/screens/about/about_screen.dart';
import 'package:radio90fm/screens/settings/notification_settings_screen.dart';
import 'package:radio90fm/widgets/liquid_background.dart';
import 'package:radio90fm/providers/app_providers.dart';

import 'package:url_launcher/url_launcher.dart';

class RadioApp extends ConsumerStatefulWidget {
  const RadioApp({super.key});

  @override
  ConsumerState<RadioApp> createState() => _RadioAppState();
}

class _RadioAppState extends ConsumerState<RadioApp> {
  int _currentIndex = 0;

  void _showAppUpdateDialog(BuildContext context, AppUpdateAlertData alertData) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1B2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
        ),
        title: Row(
          children: [
            const Icon(Icons.system_update_rounded, color: Color(0xFFA855F7), size: 28),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                alertData.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          alertData.message,
          style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Later', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF9333EA),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final uri = Uri.parse(alertData.actionUrl);
              await launchUrl(uri, mode: LaunchMode.externalApplication);
            },
            icon: const Icon(Icons.download_rounded, size: 18),
            label: const Text('Update Now', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(broadcastNotificationPollerProvider);

    ref.listen<AppUpdateAlertData?>(pendingAppUpdateAlertProvider, (previous, next) {
      if (next != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showAppUpdateDialog(context, next);
        });
      }
    });

    final configAsync = ref.watch(stationConfigProvider);
    final bool settingsEnabled = configAsync.value?.settingsEnabled ?? true;

    final List<Widget> activeScreens = [
      const ListenScreen(),
      const ScheduleScreen(),
      const AboutScreen(),
      if (settingsEnabled) const NotificationSettingsScreen(),
    ];

    final List<BottomNavigationBarItem> navItems = [
      const BottomNavigationBarItem(
        icon: Icon(Icons.radio_rounded),
        label: 'Listen',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.calendar_month_rounded),
        label: 'Schedule',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.info_outline_rounded),
        label: 'About',
      ),
      if (settingsEnabled)
        const BottomNavigationBarItem(
          icon: Icon(Icons.settings_rounded),
          label: 'Settings',
        ),
    ];

    final safeIndex = _currentIndex >= activeScreens.length ? 0 : _currentIndex;

    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: Scaffold(
        backgroundColor: Colors.transparent,
        body: LiquidBackground(
          child: IndexedStack(
            index: safeIndex,
            children: activeScreens,
          ),
        ),
        bottomNavigationBar: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: BottomNavigationBar(
              backgroundColor: Colors.black.withValues(alpha: 0.45),
              elevation: 0,
              currentIndex: safeIndex,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: AppTheme.primaryRed,
              unselectedItemColor: Colors.white60,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontSize: 11),
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              items: navItems,
            ),
          ),
        ),
      ),
    );
  }
}
