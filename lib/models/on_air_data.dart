class OnAirData {
  final bool isLiveOverride;
  final String title;
  final String description;
  final String presenter;
  final String? nextTitle;
  final String? nextPresenter;
  final String phone;
  final String whatsapp;
  final bool enableCall;
  final bool enableWhatsapp;

  OnAirData({
    required this.isLiveOverride,
    required this.title,
    required this.description,
    required this.presenter,
    this.nextTitle,
    this.nextPresenter,
    required this.phone,
    required this.whatsapp,
    required this.enableCall,
    required this.enableWhatsapp,
  });

  factory OnAirData.emergency() {
    return OnAirData(
      isLiveOverride: false,
      title: "Radio 90 FM Live",
      description: "Celebration of Knowledge",
      presenter: "Voice of Amal Jyothi",
      phone: "9496345029",
      whatsapp: "9048389090",
      enableCall: true,
      enableWhatsapp: true,
    );
  }

  factory OnAirData.fromJson(Map<String, dynamic> json) {
    final cur = json['currentProgram'] ?? {};
    final next = json['nextProgram'];
    final contacts = json['contacts'] ?? {};

    return OnAirData(
      isLiveOverride: json['isLiveOverride'] ?? false,
      title: cur['title'] ?? "Radio 90 FM Live",
      description: cur['description'] ?? "Celebration of Knowledge",
      presenter: cur['presenter'] ?? "Voice of Amal Jyothi",
      nextTitle: next != null ? next['title'] : null,
      nextPresenter: next != null ? next['presenter'] : null,
      phone: contacts['phone'] ?? "9496345029",
      whatsapp: contacts['whatsapp'] ?? "9048389090",
      enableCall: contacts['enableCall'] ?? true,
      enableWhatsapp: contacts['enableWhatsapp'] ?? true,
    );
  }
}
