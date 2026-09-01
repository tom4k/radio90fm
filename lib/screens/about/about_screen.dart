import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:radio90fm/app/theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch $urlString');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('About Radio 90 FM'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Logo & Station Header Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1F0505), Color(0xFF141414)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primaryRed.withOpacity(0.4), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryRed.withOpacity(0.15),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    height: 90,
                    width: 90,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryRed, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryRed.withOpacity(0.3),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/logo.png',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Radio 90 FM',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Voice of Amal Jyothi • 90.0 MHz',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryRed,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Celebration of Knowledge',
                    style: TextStyle(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 2. Our Vision Card
            _buildInfoCard(
              title: 'Our Vision',
              icon: Icons.visibility_rounded,
              content:
                  'Provide a platform to become the voice of the common man by giving importance to the concept of education and agriculture and aiming at the overall uplift of society through infotainment and edutainment.',
            ),

            const SizedBox(height: 18),

            // 3. Our Mission Card
            _buildInfoCard(
              title: 'Our Mission',
              icon: Icons.flag_rounded,
              content:
                  'To be one of the leading radio services (Radio 90 FM) by providing infotainment, and edutainment to the people and bringing the world closer.',
            ),

            const SizedBox(height: 24),

            // 4. Contact & Address Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.location_on_rounded, color: AppTheme.primaryRed, size: 22),
                      SizedBox(width: 10),
                      Text(
                        'Contact Us',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Station Master, Radio 90 FM',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Amal Jyothi College of Engineering\nKanjirappally, Koovappally P.O.\nKottayam Dt., Kerala, India - 686518',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFF2E2E2E)),
                  const SizedBox(height: 10),

                  // Phone: Advertisements
                  _buildContactTile(
                    icon: Icons.phone_rounded,
                    label: 'Advertisements: +91 8139090358',
                    onTap: () => _launchUrl('tel:+918139090358'),
                  ),
                  const SizedBox(height: 10),

                  // Phone: Suggestions
                  _buildContactTile(
                    icon: Icons.support_agent_rounded,
                    label: 'Suggestions: +91 9207057969',
                    onTap: () => _launchUrl('tel:+919207057969'),
                  ),
                  const SizedBox(height: 10),

                  // Email
                  _buildContactTile(
                    icon: Icons.email_rounded,
                    label: 'radio90@amaljyothi.ac.in',
                    onTap: () => _launchUrl('mailto:radio90@amaljyothi.ac.in'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 5. App Stores & Social Links
            const Text(
              'Connect With Us',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 14),

            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: [
                _buildSocialButton(
                  icon: Icons.android_rounded,
                  label: 'Google Play',
                  color: const Color(0xFF01875F),
                  onTap: () => _launchUrl(
                    'https://play.google.com/store/apps/details?id=com.radio90fm',
                  ),
                ),
                _buildSocialButton(
                  icon: Icons.apple_rounded,
                  label: 'App Store',
                  color: const Color(0xFF007AFF),
                  onTap: () => _launchUrl(
                    'https://apps.apple.com/in/app/radio-90-fm/id6477734699',
                  ),
                ),
                _buildSocialButton(
                  icon: Icons.camera_alt_rounded,
                  label: 'Instagram',
                  color: const Color(0xFFE1306C),
                  onTap: () => _launchUrl('https://www.instagram.com/radio90fm_official'),
                ),
                _buildSocialButton(
                  icon: Icons.play_circle_fill_rounded,
                  label: 'YouTube',
                  color: const Color(0xFFFF0000),
                  onTap: () => _launchUrl('https://youtube.com/@radio90fmajce'),
                ),
                _buildSocialButton(
                  icon: Icons.language_rounded,
                  label: 'Official Website',
                  color: const Color(0xFF888888),
                  onTap: () => _launchUrl('https://radio90.in'),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // 6. Copyright Footer
            Center(
              child: Column(
                children: [
                  Text(
                    '© 2026 Amal Jyothi College of Engineering',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Radio 90 FM • All Rights Reserved',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required String title,
    required IconData icon,
    required String content,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primaryRed.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppTheme.primaryRed, size: 22),
              const SizedBox(width: 10),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryRed,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactTile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          children: [
            Icon(icon, color: AppTheme.primaryRed, size: 18),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.3), size: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            border: Border.all(color: color.withOpacity(0.4)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 18),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.bold,
                  color: color == const Color(0xFF888888) ? Colors.white : color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
