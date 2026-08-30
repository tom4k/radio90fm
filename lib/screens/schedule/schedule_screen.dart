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

  final List<String> _days = [
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN',
  ];

  @override
  void initState() {
    super.initState();
    // Default to current day of week (0 = Monday, ..., 6 = Sunday)
    final now = DateTime.now();
    _selectedDay = (now.weekday - 1) % 7;
  }

  @override
  Widget build(BuildContext context) {
    final scheduleAsync = ref.watch(weeklyScheduleProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Weekly Schedule'),
      ),
      body: Column(
        children: [
          // Day Tab Selector
          Container(
            height: 54,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _days.length,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) {
                final isSelected = _selectedDay == index;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(
                      _days[index],
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppTheme.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppTheme.primaryRed,
                    backgroundColor: AppTheme.cardBackground,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedDay = index;
                        });
                      }
                    },
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
                final dayPrograms = programs
                    .where((p) => p.dayOfWeek == _selectedDay)
                    .toList();

                if (dayPrograms.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.calendar_today_rounded,
                          size: 48,
                          color: AppTheme.textSecondary.withOpacity(0.5),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'No scheduled programs for this day',
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: dayPrograms.length,
                  itemBuilder: (context, index) {
                    final program = dayPrograms[index];
                    return _buildProgramCard(program);
                  },
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppTheme.primaryRed),
              ),
              error: (err, _) => Center(
                child: Text(
                  'Unable to load schedule',
                  style: TextStyle(color: AppTheme.textSecondary),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgramCard(Program program) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Time Column
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.primaryRed.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                program.formattedTimeRange,
                style: const TextStyle(
                  color: AppTheme.primaryRed,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(width: 16),

            // Program Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    program.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (program.presenter.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Presenter: ${program.presenter}',
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                  if (program.description.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      program.description,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
