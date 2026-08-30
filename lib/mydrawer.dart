import 'package:flutter/material.dart';
import 'package:radio90fm/screens/about/about_screen.dart';
import 'package:radio90fm/screens/contact/contact_screen.dart';

class MainDrawer extends StatelessWidget {
  const MainDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
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
            leading: const Icon(Icons.info_outline_rounded, color: Colors.red),
            title: const Text("About Us", style: TextStyle(color: Colors.white, fontSize: 18)),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const AboutScreen()),
              );
            },
          ),
          const Divider(color: Color(0xFF262626)),
          ListTile(
            leading: const Icon(Icons.contact_phone_rounded, color: Colors.red),
            title: const Text("Contact Us", style: TextStyle(color: Colors.white, fontSize: 18)),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const ContactScreen()),
              );
            },
          ),
        ],
      ),
    );
  }
}
