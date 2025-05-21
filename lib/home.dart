import 'dart:io';

import 'package:flutter/material.dart';
import 'package:radio90fm/mydrawer.dart';
import 'package:radio90fm/player.dart';

import 'package:share_plus/share_plus.dart';

class Home extends StatelessWidget {
  const Home({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var scaffoldKey = GlobalKey<ScaffoldState>();
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        key: scaffoldKey,
        endDrawerEnableOpenDragGesture: false,
        drawer: const MainDrawer(),
        body: Stack(children: [
          Container(
            padding: const EdgeInsetsDirectional.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.black, Color.fromARGB(255, 67, 4, 0)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Header(),
                Footer(),
              ],
            ),
          ),
          Positioned(
            top: 50,
            left: 10,
            child: IconButton(
              icon: Icon(
                Icons.menu,
                size: 40,
                color: Colors.white,
              ),
              onPressed: () {
                scaffoldKey.currentState!.openDrawer();
              },
            ),
          ),
          Positioned(
            top: 50,
            right: 10,
            child: IconButton(
              icon: Icon(
                Icons.share,
                size: 40,
                color: Colors.white,
              ),
              onPressed: () {
                Share.share('Click Here to install Radio 90 Fm App to your mobile. \n https://onelink.to/243uae');
              },
            ),
          ),
        ]),
      ),
    );
  }
}

class Footer extends StatelessWidget {
  const Footer({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Center(
          child: Text(
            "Radio 90 FM",
            style: TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Center(
          child: Text(
            "Celebration of Knowledge",
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w200,
            ),
          ),
        ),
      ],
    );
  }
}

class Header extends StatelessWidget {
  const Header({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(
        top: 45,
      ),
      margin: const EdgeInsets.only(bottom: 0),
      child: Column(
        children: [
          Center(
            child: Image.asset(
              "assets/images/icon.png",
              fit: BoxFit.contain,
              width: 300,
            ),
          ),
          const Player(),
        ],
      ),
    );
  }
}
