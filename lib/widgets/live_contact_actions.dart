import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:radio90fm/app/theme.dart';

class LiveContactActions extends StatelessWidget {
  final String phone;
  final String whatsapp;
  final bool enableCall;
  final bool enableWhatsapp;

  const LiveContactActions({
    super.key,
    required this.phone,
    required this.whatsapp,
    required this.enableCall,
    required this.enableWhatsapp,
  });

  Future<void> _makeCall(BuildContext context) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Cannot launch phone dialer for $phone')),
          );
        }
      }
    } catch (_) {}
  }

  Future<void> _openWhatsapp(BuildContext context) async {
    final cleanWhatsapp = whatsapp.replaceAll(RegExp(r'[^0-9]'), '');
    final fullNumber = cleanWhatsapp.startsWith('91') ? cleanWhatsapp : '91$cleanWhatsapp';
    final message = Uri.encodeComponent("Hi Radio 90 FM, I'm listening live!");
    final uri = Uri.parse('https://wa.me/$fullNumber?text=$message');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Cannot open WhatsApp for $whatsapp')),
          );
        }
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (!enableCall && !enableWhatsapp) return const SizedBox.shrink();

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (enableCall && phone.isNotEmpty)
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _makeCall(context),
              icon: const Icon(Icons.phone_in_talk_rounded, color: Colors.white, size: 20),
              label: const Text(
                'CALL LIVE',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryRed,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
              ),
            ),
          ),

        if (enableCall && enableWhatsapp && phone.isNotEmpty && whatsapp.isNotEmpty)
          const SizedBox(width: 12),

        if (enableWhatsapp && whatsapp.isNotEmpty)
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _openWhatsapp(context),
              icon: const FaIcon(FontAwesomeIcons.whatsapp, color: Colors.white, size: 20),
              label: const Text(
                'WHATSAPP LIVE',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
              ),
            ),
          ),
      ],
    );
  }
}
