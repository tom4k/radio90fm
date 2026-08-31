import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/services/notification_service.dart';

class NotificationSettingsScreen extends ConsumerStatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  ConsumerState<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends ConsumerState<NotificationSettingsScreen> {
  final NotificationService _notificationService = NotificationService();
  late NotificationSettings _settings;

  @override
  void initState() {
    super.initState();
    _settings = _notificationService.getSettings();
  }

  void _updateSettings(NotificationSettings newSettings) {
    setState(() {
      _settings = newSettings;
    });
    _notificationService.saveSettings(newSettings);
  }

  String _formatHour(int hour) {
    final period = hour >= 12 ? 'PM' : 'AM';
    final h = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return '$h:00 $period';
  }

  Future<void> _selectTime(bool isStart) async {
    final currentHour = isStart ? _settings.quietStartHour : _settings.quietEndHour;
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: currentHour, minute: 0),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.primaryRed,
              surface: Color(0xFF1E1E1E),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      if (isStart) {
        _updateSettings(_settings.copyWith(quietStartHour: picked.hour));
      } else {
        _updateSettings(_settings.copyWith(quietEndHour: picked.hour));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('Notification Settings'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Header Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF260808), Color(0xFF171717)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.primaryRed.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryRed.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.notifications_active_rounded,
                      color: AppTheme.primaryRed,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Broadcast Alerts',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Configure show reminders, live alerts, quiet hours, and sound preferences.',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 2. Master Enable Switch
            _buildCard(
              child: SwitchListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                secondary: const Icon(Icons.power_settings_new_rounded, color: AppTheme.primaryRed),
                title: const Text(
                  'Allow Notifications',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                subtitle: const Text(
                  'Enable or disable all app notifications',
                  style: TextStyle(fontSize: 12, color: Colors.white70),
                ),
                activeColor: AppTheme.primaryRed,
                value: _settings.enableNotifications,
                onChanged: (val) {
                  _updateSettings(_settings.copyWith(enableNotifications: val));
                },
              ),
            ),

            const SizedBox(height: 20),

            // 3. Reminders & Alerts Section
            _buildSectionHeader('Show Reminders & Live Alerts'),
            _buildCard(
              child: Column(
                children: [
                  SwitchListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    secondary: const Icon(Icons.alarm_rounded, color: Colors.amber),
                    title: const Text('Program Start Reminders',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Get notified before scheduled shows begin',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                    activeColor: AppTheme.primaryRed,
                    value: _settings.enableNotifications && _settings.enableShowReminders,
                    onChanged: _settings.enableNotifications
                        ? (val) => _updateSettings(_settings.copyWith(enableShowReminders: val))
                        : null,
                  ),

                  if (_settings.enableNotifications && _settings.enableShowReminders) ...[
                    const Divider(color: Color(0xFF2E2E2E)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Reminder Lead Time',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white70),
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [0, 5, 10, 15].map((mins) {
                              final isSelected = _settings.reminderLeadMinutes == mins;
                              return ChoiceChip(
                                label: Text(mins == 0 ? 'At Show Time' : '$mins mins before'),
                                selected: isSelected,
                                selectedColor: AppTheme.primaryRed,
                                backgroundColor: const Color(0xFF262626),
                                labelStyle: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white70,
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                                onSelected: (sel) {
                                  if (sel) {
                                    _updateSettings(_settings.copyWith(reminderLeadMinutes: mins));
                                  }
                                },
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const Divider(color: Color(0xFF2E2E2E)),
                  SwitchListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    secondary: const Icon(Icons.live_tv_rounded, color: Colors.redAccent),
                    title: const Text('Live Broadcast Alerts',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Notify when special live programs go on-air',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                    activeColor: AppTheme.primaryRed,
                    value: _settings.enableNotifications && _settings.enableLiveAlerts,
                    onChanged: _settings.enableNotifications
                        ? (val) => _updateSettings(_settings.copyWith(enableLiveAlerts: val))
                        : null,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 4. Sound & Vibration
            _buildSectionHeader('Sound & Haptics'),
            _buildCard(
              child: Column(
                children: [
                  SwitchListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    secondary: const Icon(Icons.volume_up_rounded, color: Colors.blueAccent),
                    title: const Text('Notification Sound',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Play sound on alert',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                    activeColor: AppTheme.primaryRed,
                    value: _settings.enableNotifications && _settings.enableSound,
                    onChanged: _settings.enableNotifications
                        ? (val) => _updateSettings(_settings.copyWith(enableSound: val))
                        : null,
                  ),
                  const Divider(color: Color(0xFF2E2E2E)),
                  SwitchListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    secondary: const Icon(Icons.vibration_rounded, color: Colors.purpleAccent),
                    title: const Text('Vibration Feedback',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Vibrate on incoming notification',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                    activeColor: AppTheme.primaryRed,
                    value: _settings.enableNotifications && _settings.enableVibration,
                    onChanged: _settings.enableNotifications
                        ? (val) => _updateSettings(_settings.copyWith(enableVibration: val))
                        : null,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 5. Quiet Hours / DND
            _buildSectionHeader('Quiet Hours (Do Not Disturb)'),
            _buildCard(
              child: Column(
                children: [
                  SwitchListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    secondary: const Icon(Icons.do_not_disturb_on_rounded, color: Colors.tealAccent),
                    title: const Text('Quiet Hours',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Silence all notifications during specified times',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                    activeColor: AppTheme.primaryRed,
                    value: _settings.enableNotifications && _settings.quietHoursEnabled,
                    onChanged: _settings.enableNotifications
                        ? (val) => _updateSettings(_settings.copyWith(quietHoursEnabled: val))
                        : null,
                  ),

                  if (_settings.enableNotifications && _settings.quietHoursEnabled) ...[
                    const Divider(color: Color(0xFF2E2E2E)),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: () => _selectTime(true),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF262626),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: Column(
                                  children: [
                                    const Text('Start Time',
                                        style: TextStyle(fontSize: 11, color: Colors.white54)),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatHour(_settings.quietStartHour),
                                      style: const TextStyle(
                                          fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Icon(Icons.arrow_forward_rounded, color: Colors.white38, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: InkWell(
                              onTap: () => _selectTime(false),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF262626),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: Column(
                                  children: [
                                    const Text('End Time',
                                        style: TextStyle(fontSize: 11, color: Colors.white54)),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatHour(_settings.quietEndHour),
                                      style: const TextStyle(
                                          fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryRed,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: child,
    );
  }
}
