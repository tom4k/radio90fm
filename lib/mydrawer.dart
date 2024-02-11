import 'package:flutter/material.dart';

class MainDrawer extends StatelessWidget {
  const MainDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color.fromARGB(255, 237, 209, 207),
      child: Column(children: [
        DrawerHeader(
          child: Image.asset('assets/images/logo.png'),
          padding: const EdgeInsets.all(20),
        ),
        
      ]),
    );
  }
}
