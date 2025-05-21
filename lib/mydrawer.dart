import 'package:flutter/material.dart';

import 'package:radio90fm/aboutus.dart';
import 'package:radio90fm/contactus.dart';
import 'package:radio90fm/follow.dart';

class MainDrawer extends StatelessWidget {
  const MainDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Color.fromARGB(255, 67, 4, 0),
      child: Column(children: [
        DrawerHeader(
          child: Image.asset('assets/images/logo.png'),
          padding: const EdgeInsets.all(20),
        ),
        Divider(),
        ListTile(
          leading: Icon(
            Icons.info,
            color: Colors.white,
            size: 30,
          ),
          title: Text(
            "About Us",
            style: TextStyle(color: Colors.white, fontSize: 24),
          ),
          onTap: () {
            Navigator.of(context)
                .push(MaterialPageRoute(builder: ((context) => About())));
          },
        ),
        Divider(),
        ListTile(
          leading: Icon(
            Icons.contact_phone,
            color: Colors.white,
            size: 30,
          ),
          title: Text(
            "Contact Us",
            style: TextStyle(color: Colors.white, fontSize: 24),
          ),
          onTap: () {
            Navigator.of(context)
                .push(MaterialPageRoute(builder: ((context) => Contact())));
          },
        ),
        Divider(),
        Expanded(
          child: SizedBox(
            height: 50,
          ),
        ),
        Follow(),
        SizedBox(
          height: 30,
        ),
      ]),
    );
  }
}
