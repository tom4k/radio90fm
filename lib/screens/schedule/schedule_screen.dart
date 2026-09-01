import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/models/program.dart';
import 'package:radio90fm/providers/app_providers.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  int _selectedDay = 0;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, String>> _days = [
    {'short': 'MON', 'full': 'Monday'},
    {'short': 'TUE', 'full': 'Tuesday'},
    {'short': 'WED', 'full': 'Wednesday'},
    {'short': 'THU', 'full': 'Thursday'},
    {'short': 'FRI', 'full': 'Friday'},
    {'short': 'SAT', 'full': 'Saturday'},
    {'short': 'SUN', 'full': 'Sunday'},
  ];

  @override
  void initState() {
    super.initState();
    // Default to current day of week (0 = Monday, ..., 6 = Sunday)
    final now = DateTime.now();
    _selectedDay = (now.weekday - 1) % 7;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool _isCurrentlyOnAir(Program program) {
    final now = DateTime.now();
    final currentDay = (now.weekday - 1) % 7;
    if (program.dayOfWeek != currentDay) return false;

    final currentMins = now.hour * 60 + now.minute;
    return currentMins >= program.startMinutes && currentMins < program.endMinutes;
  }

  @override
  Widget build(BuildContext context) {
    final scheduleAsync = ref.watch(weeklyScheduleProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text(
          'Broadcast Schedule',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Schedule',
            onPressed: () => ref.invalidate(weeklyScheduleProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _searchQuery = val.trim().toLowerCase();
                });
              },
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search programs or presenters...',
                hintStyle: TextStyle(color: AppTheme.textSecondary.withValues(alpha: 0.7), fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryRed, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, color: AppTheme.textSecondary, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppTheme.cardBackground,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.primaryRed, width: 1.5),
                ),
              ),
            ),
          ),

          // Day Tab Selector
          Container(
            height: 48,
            margin: const EdgeInsets.only(bottom: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _days.length,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) {
                final isSelected = _selectedDay == index;
                final now = DateTime.now();
                final isToday = ((now.weekday - 1) % 7) == index;

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    child: ChoiceChip(
                      label: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isToday)
                            Container(
                              width: 6,
                              height: 6,
                              margin: const EdgeInsets.only(right: 6),
                              decoration: const BoxDecoration(
                                color: Color(0xFF22C55E),
                                shape: BoxShape.circle,
                              ),
                            ),
                          Text(_days[index]['short']!),
                        ],
                      ),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppTheme.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        fontSize: 13,
                      ),
                      selected: isSelected,
                      selectedColor: AppTheme.primaryRed,
                      backgroundColor: AppTheme.cardBackground,
                      side: BorderSide(
                        color: isSelected
                            ? AppTheme.primaryRed
                            : (isToday ? Colors.white.withValues(alpha: 0.2) : Colors.transparent),
                      ),
                      elevation: isSelected ? 4 : 0,
                      shadowColor: AppTheme.primaryRed.withValues(alpha: 0.4),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedDay = index;
                          });
                        }
                      },
                    ),
                  ),
                );
              },
            ),
          ),

          const Divider(color: Color(0xFF262626), height: 1),

          // Schedule List
          Expanded(
            child: scheduleAsync.when(
              data: (programs) {
                var dayPrograms = programs.where((p) => p.dayOfWeek == _selectedDay).toList();

                // Sort chronologically by startMinutes
                dayPrograms.sort((a, b) => a.startMinutes.compareTo(b.startMinutes));

                if (_searchQuery.isNotEmpty) {
                  dayPrograms = dayPrograms.where((p) {
                    final titleMatch = p.title.toLowerCase().contains(_searchQuery);
                    final presenterMatch = p.presenter.toLowerCase().contains(_searchQuery);
                    return titleMatch || presenterMatch;
                  }).toList();
                }

                if (dayPrograms.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _searchQuery.isNotEmpty ? Icons.search_off_rounded : Icons.event_note_rounded,
                          size: 54,
                          color: AppTheme.textSecondary.withValues(alpha: 0.4),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          _searchQuery.isNotEmpty
                              ? 'No programs found matching "$_searchQuery"'
                              : 'No scheduled programs for ${_days[_selectedDay]['full']}',
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  color: AppTheme.primaryRed,
                  backgroundColor: AppTheme.cardBackground,
                  onRefresh: () async {
                    ref.invalidate(weeklyScheduleProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: dayPrograms.length,
                    itemBuilder: (context, index) {
                      final program = dayPrograms[index];
                      final isOnAir = _isCurrentlyOnAir(program);
                      return _buildProgramCard(program, isOnAir);
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppTheme.primaryRed),
              ),
              error: (err, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off_rounded, size: 54, color: Colors.amber),
                    const SizedBox(height: 14),
                    const Text(
                      'No Network Connection',
                      style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Please check your internet connection and try again.',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryRed,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () => ref.invalidate(weeklyScheduleProvider),
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Try Again'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgramCard(Program program, bool isOnAir) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isOnAir ? const Color(0xFF1E1515) : AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isOnAir
              ? AppTheme.primaryRed
              : Colors.white.withValues(alpha: 0.05),
          width: isOnAir ? 1.5 : 1,
        ),
        boxShadow: isOnAir
            ? [
                BoxShadow(
                  color: AppTheme.primaryRed.withValues(alpha: 0.25),
                  blurRadius: 12,
                  spreadRadius: 1,
                )
              ]
            : [],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Time & Live Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isOnAir
                        ? AppTheme.primaryRed
                        : AppTheme.primaryRed.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.access_time_filled_rounded,
                        size: 13,
                        color: isOnAir ? Colors.white : AppTheme.primaryRed,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        program.formattedTimeRange,
                        style: TextStyle(
                          color: isOnAir ? Colors.white : AppTheme.primaryRed,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

                if (isOnAir)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF22C55E).withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF22C55E), width: 1),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.sensors_rounded, color: Color(0xFF22C55E), size: 12),
                        SizedBox(width: 4),
                        Text(
                          'ON AIR NOW',
                          style: TextStyle(
                            color: Color(0xFF22C55E),
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 10),

            // Program Title
            Text(
              program.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                height: 1.25,
              ),
            ),

            if (program.presenter.isNotEmpty) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.person_rounded, size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    program.presenter,
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],

            if (program.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                program.description,
                style: TextStyle(
                  color: AppTheme.textSecondary.withValues(alpha: 0.85),
                  fontSize: 12,
                  height: 1.35,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            // Action Indicators (Call/WhatsApp)
            if (program.enableCall || program.enableWhatsapp) ...[
              const SizedBox(height: 10),
              Row(
                children: [
                  if (program.enableCall)
                    Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.phone_in_talk_rounded, size: 11, color: Color(0xFF22C55E)),
                          SizedBox(width: 4),
                          Text(
                            'Calls Active',
                            style: TextStyle(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),

                  if (program.enableWhatsapp)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.chat_rounded, size: 11, color: Color(0xFF22C55E)),
                          SizedBox(width: 4),
                          Text(
                            'WhatsApp Active',
                            style: TextStyle(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
