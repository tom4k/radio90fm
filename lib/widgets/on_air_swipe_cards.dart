import 'package:flutter/material.dart';
import 'package:radio90fm/app/theme.dart';
import 'package:radio90fm/models/on_air_data.dart';
import 'package:radio90fm/widgets/liquid_glass_card.dart';
import 'package:radio90fm/widgets/live_contact_actions.dart';

class OnAirSwipeCards extends StatefulWidget {
  final OnAirData onAir;

  const OnAirSwipeCards({super.key, required this.onAir});

  @override
  State<OnAirSwipeCards> createState() => _OnAirSwipeCardsState();
}

class _OnAirSwipeCardsState extends State<OnAirSwipeCards> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final onAir = widget.onAir;
    final hasNext = onAir.nextTitle != null && onAir.nextTitle!.isNotEmpty;

    return Column(
      children: [
        if (!onAir.isNetworkAvailable) ...[
          LiquidGlassCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            borderColor: Colors.amber.withValues(alpha: 0.6),
            backgroundColor: Colors.amber.withValues(alpha: 0.12),
            child: const Row(
              children: [
                Icon(Icons.wifi_off_rounded, color: Colors.amber, size: 22),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'No Network Connection',
                        style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Please check your internet connection.',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        if (!hasNext)
          _buildLiveCard(onAir)
        else ...[
          SizedBox(
            height: 195,
            child: PageView(
              controller: _pageController,
              onPageChanged: (page) {
                setState(() {
                  _currentPage = page;
                });
              },
              children: [
                _buildLiveCard(onAir),
                _buildUpNextCard(onAir),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Page Indicator Dots
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildDot(0, 'LIVE NOW'),
              const SizedBox(width: 8),
              _buildDot(1, 'UP NEXT'),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildDot(int index, String label) {
    final isSelected = _currentPage == index;
    return GestureDetector(
      onTap: () {
        _pageController.animateToPage(
          index,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryRed.withValues(alpha: 0.9)
              : Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primaryRed : Colors.white12,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: isSelected ? Colors.white : Colors.white38,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.white60,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveCard(OnAirData onAir) {
    return LiquidGlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderColor: !onAir.isNetworkAvailable
          ? Colors.amber.withValues(alpha: 0.5)
          : onAir.isLiveOverride
              ? AppTheme.primaryRed
              : Colors.white.withValues(alpha: 0.18),
      borderWidth: onAir.isLiveOverride ? 1.5 : 1.0,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Live / Offline Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: !onAir.isNetworkAvailable
                      ? Colors.amber
                      : onAir.isLiveOverride
                          ? Colors.amber
                          : AppTheme.primaryRed,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                !onAir.isNetworkAvailable
                    ? '● OFFLINE'
                    : onAir.isLiveOverride
                        ? 'SPECIAL LIVE OVERRIDE'
                        : '● LIVE NOW',
                style: TextStyle(
                  color: !onAir.isNetworkAvailable
                      ? Colors.amber
                      : onAir.isLiveOverride
                          ? Colors.amber
                          : AppTheme.primaryRed,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Program Title
          Text(
            onAir.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),

          if (onAir.presenter.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'Presenter: ${onAir.presenter}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 13,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          const SizedBox(height: 14),

          // Live Communication Buttons
          LiveContactActions(
            phone: onAir.phone,
            whatsapp: onAir.whatsapp,
            enableCall: onAir.enableCall,
            enableWhatsapp: onAir.enableWhatsapp,
          ),
        ],
      ),
    );
  }

  Widget _buildUpNextCard(OnAirData onAir) {
    return LiquidGlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderColor: Colors.white.withValues(alpha: 0.18),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.skip_next_rounded, color: AppTheme.primaryRed, size: 16),
              const SizedBox(width: 6),
              Text(
                'UP NEXT PROGRAM',
                style: TextStyle(
                  color: AppTheme.primaryRed.withValues(alpha: 0.9),
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Text(
            onAir.nextTitle ?? '',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),

          if (onAir.nextPresenter != null && onAir.nextPresenter!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Presenter: ${onAir.nextPresenter}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 13,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Starts following current show',
              style: TextStyle(color: Colors.white60, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}
