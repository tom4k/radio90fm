import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class Contact extends StatelessWidget {
  const Contact({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text("Contact Us")),
        body: Container(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.asset('assets/images/logo2.png'),
              const Text(
                "Station Director",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const Text(
                "Community radio 90 FM",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const Text(
                "Amal Jyothi College of Engineering",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const Text(
                "Kanjirappally, Koovappally P.O",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const Text(
                "Kottayam Dt., Kerala, India",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const Text(
                "Pin: 686518",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              
              const SizedBox(
                height: 10,
              ),
              const Text(
                "Email: radio90@amaljyothi.ac.in",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const SizedBox(
                height: 10,
              ),
              const Text(
                "Program Director - 9496345029",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const SizedBox(
                height: 10,
              ),
              const Text(
                "Assistant Program Director - 9207057969, 8138909064",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const SizedBox(
                height: 10,
              ),
              const Text(
                "Sino Antony(PRO & Marketing Manager) - 9020434574",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
              const SizedBox(
                height: 10,
              ),
              const Text(
                "WhatsApp(Radio 90 FM Offical) - 9048389090",
                style: TextStyle(fontSize: 20),
                textAlign: TextAlign.left,
              ),
            ],
          ),
        ));
  }
}
