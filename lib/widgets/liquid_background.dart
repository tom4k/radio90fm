import 'package:flutter/material.dart';

class LiquidBackground extends StatelessWidget {
  final Widget child;

  const LiquidBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Dark Base Surface
        Positioned.fill(
          child: Container(
            color: const Color(0xFF09090D),
          ),
        ),

        // Glowing Crimson Red Liquid Blob (Top Left)
        Positioned(
          top: -80,
          left: -50,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  const Color(0xFFE50914).withValues(alpha: 0.35),
                  const Color(0xFFE50914).withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Glowing Purple/Indigo Liquid Blob (Middle Right)
        Positioned(
          top: 220,
          right: -90,
          child: Container(
            width: 340,
            height: 340,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  const Color(0xFF7C3AED).withValues(alpha: 0.22),
                  const Color(0xFF7C3AED).withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Glowing Deep Red Blob (Bottom Left)
        Positioned(
          bottom: -100,
          left: -50,
          child: Container(
            width: 320,
            height: 320,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  const Color(0xFF991B1B).withValues(alpha: 0.28),
                  const Color(0xFF991B1B).withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Main Screen Content
        Positioned.fill(child: child),
      ],
    );
  }
}
