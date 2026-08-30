import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/core/constants/app_constants.dart';
import 'package:radio90fm/screens/listen/listen_screen.dart';
import 'package:radio90fm/screens/schedule/schedule_screen.dart';
import 'package:radio90fm/screens/about/about_screen.dart';
import 'package:radio90fm/screens/contact/contact_screen.dart';

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
  ];

  void _shareApp() {
    Share.share(
      'Click Here to install Radio 90 FM App on your mobile:\n${AppConstants.shareAppUrl}',
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: Scaffold(
        drawer: Drawer(
          backgroundColor: const Color(0xFF141414),
          child: Column(
            children: [
              DrawerHeader(
                decoration: const BoxDecoration(color: Color(0xFF0F0F0F)),
                child: Center(
                  child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.radio_rounded, color: AppTheme.primaryRed),
                title: const Text('Listen Live', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 0);
                },
              ),
              const Divider(color: Color(0xFF262626)),
              ListTile(
                leading: const Icon(Icons.calendar_month_rounded, color: AppTheme.primaryRed),
                title: const Text('Weekly Schedule', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 1);
                },
              ),
              const Divider(color: Color(0xFF262626)),
              ListTile(
                leading: const Icon(Icons.info_outline_rounded, color: AppTheme.primaryRed),
                title: const Text('About Station', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 2);
                },
              ),
              const Divider(color: Color(0xFF262626)),
              ListTile(
                leading: const Icon(Icons.contact_phone_rounded, color: AppTheme.primaryRed),
                title: const Text('Contact Us', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ContactScreen()),
                  );
                },
              ),
              const Spacer(),
              ListTile(
                leading: const Icon(Icons.share_rounded, color: Colors.white),
                title: const Text('Share App', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  _shareApp();
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
        appBar: AppBar(
          actions: [
            IconButton(
              icon: const Icon(Icons.share_rounded, color: Colors.white),
              onPressed: _shareApp,
            ),
          ],
        ),
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
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
          ],
        ),
      ),
    );
  }
}
