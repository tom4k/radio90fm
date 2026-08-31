import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/core/constants/app_constants.dart';
import 'package:radio90fm/screens/listen/listen_screen.dart';
import 'package:radio90fm/screens/schedule/schedule_screen.dart';
import 'package:radio90fm/screens/about/about_screen.dart';
import 'package:radio90fm/screens/settings/notification_settings_screen.dart';

import 'package:radio90fm/providers/app_providers.dart';

class RadioApp extends ConsumerStatefulWidget {
  const RadioApp({super.key});

  @override
  ConsumerState<RadioApp> createState() => _RadioAppState();
}

class _RadioAppState extends ConsumerState<RadioApp> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    ListenScreen(),
    ScheduleScreen(),
    AboutScreen(),
    NotificationSettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    ref.watch(broadcastNotificationPollerProvider);

    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          type: BottomNavigationBarType.fixed,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.radio_rounded),
              label: 'Listen',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_month_rounded),
              label: 'Schedule',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.info_outline_rounded),
              label: 'About',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings_rounded),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}
