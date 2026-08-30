import 'dart:convert';

class Program {
  final String id;
  final String title;
  final String description;
  final String presenter;
  final int dayOfWeek; // 0 = Mon, ..., 6 = Sun
  final int startMinutes; // 0 to 1439
  final int endMinutes; // 0 to 1439
  final String? phoneNumber;
  final String? whatsappNumber;
  final bool enableCall;
  final bool enableWhatsapp;
  final int displayOrder;
  final String? imageUrl;

  Program({
    required this.id,
    required this.title,
    required this.description,
    required this.presenter,
    required this.dayOfWeek,
    required this.startMinutes,
    required this.endMinutes,
    this.phoneNumber,
    this.whatsappNumber,
    required this.enableCall,
    required this.enableWhatsapp,
    required this.displayOrder,
    this.imageUrl,
  });

  String get formattedTimeRange {
    final startH = (startMinutes ~/ 60).toString().padLeft(2, '0');
    final startM = (startMinutes % 60).toString().padLeft(2, '0');
    final endH = (endMinutes ~/ 60).toString().padLeft(2, '0');
    final endM = (endMinutes % 60).toString().padLeft(2, '0');
    return '$startH:$startM - $endH:$endM';
  }

  factory Program.fromJson(Map<String, dynamic> json) {
    return Program(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Radio 90 FM Live',
      description: json['description'] ?? '',
      presenter: json['presenter'] ?? '',
      dayOfWeek: json['dayOfWeek'] ?? 0,
      startMinutes: json['startMinutes'] ?? 0,
      endMinutes: json['endMinutes'] ?? 1440,
      phoneNumber: json['phoneNumber'],
      whatsappNumber: json['whatsappNumber'],
      enableCall: json['enableCall'] ?? true,
      enableWhatsapp: json['enableWhatsapp'] ?? true,
      displayOrder: json['displayOrder'] ?? 0,
      imageUrl: json['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'presenter': presenter,
      'dayOfWeek': dayOfWeek,
      'startMinutes': startMinutes,
      'endMinutes': endMinutes,
      'phoneNumber': phoneNumber,
      'whatsappNumber': whatsappNumber,
      'enableCall': enableCall,
      'enableWhatsapp': enableWhatsapp,
      'displayOrder': displayOrder,
      'imageUrl': imageUrl,
    };
  }

  static String encodeList(List<Program> list) {
    return jsonEncode(list.map((p) => p.toJson()).toList());
  }

  static List<Program> decodeList(String str) {
    try {
      final List<dynamic> jsonList = jsonDecode(str);
      return jsonList.map((j) => Program.fromJson(j)).toList();
    } catch (_) {
      return [];
    }
  }
}
