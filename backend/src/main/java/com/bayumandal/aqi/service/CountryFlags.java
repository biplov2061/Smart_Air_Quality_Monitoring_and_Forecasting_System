package com.bayumandal.aqi.service;

import java.util.Map;

final class CountryFlags {

    private static final String DEFAULT = "🌍";

    private static final Map<String, String> FLAGS = Map.ofEntries(
            Map.entry("Algeria", "🇩🇿"), Map.entry("Angola", "🇦🇴"), Map.entry("Argentina", "🇦🇷"),
            Map.entry("Armenia", "🇦🇲"), Map.entry("Australia", "🇦🇺"), Map.entry("Austria", "🇦🇹"),
            Map.entry("Azerbaijan", "🇦🇿"), Map.entry("Bangladesh", "🇧🇩"), Map.entry("Belarus", "🇧🇾"),
            Map.entry("Belgium", "🇧🇪"), Map.entry("Bolivia", "🇧🇴"), Map.entry("Brazil", "🇧🇷"),
            Map.entry("Bulgaria", "🇧🇬"), Map.entry("Burkina Faso", "🇧🇫"), Map.entry("Canada", "🇨🇦"),
            Map.entry("Chile", "🇨🇱"), Map.entry("China", "🇨🇳"), Map.entry("Colombia", "🇨🇴"),
            Map.entry("Congo", "🇨🇬"), Map.entry("Costa Rica", "🇨🇷"), Map.entry("Croatia", "🇭🇷"),
            Map.entry("Cuba", "🇨🇺"), Map.entry("Czech Republic", "🇨🇿"), Map.entry("DR Congo", "🇨🇩"),
            Map.entry("Denmark", "🇩🇰"), Map.entry("Dominican Republic", "🇩🇴"), Map.entry("Ecuador", "🇪🇨"),
            Map.entry("Egypt", "🇪🇬"), Map.entry("El Salvador", "🇸🇻"), Map.entry("Estonia", "🇪🇪"),
            Map.entry("Ethiopia", "🇪🇹"), Map.entry("Fiji", "🇫🇯"), Map.entry("Finland", "🇫🇮"),
            Map.entry("France", "🇫🇷"), Map.entry("French Guiana", "🇬🇫"), Map.entry("Georgia", "🇬🇪"),
            Map.entry("Germany", "🇩🇪"), Map.entry("Ghana", "🇬🇭"), Map.entry("Greece", "🇬🇷"),
            Map.entry("Guatemala", "🇬🇹"), Map.entry("Honduras", "🇭🇳"), Map.entry("Hungary", "🇭🇺"),
            Map.entry("Iceland", "🇮🇸"), Map.entry("India", "🇮🇳"), Map.entry("Indonesia", "🇮🇩"),
            Map.entry("Iran", "🇮🇷"), Map.entry("Iraq", "🇮🇶"), Map.entry("Ireland", "🇮🇪"),
            Map.entry("Israel", "🇮🇱"), Map.entry("Italy", "🇮🇹"), Map.entry("Ivory Coast", "🇨🇮"),
            Map.entry("Jamaica", "🇯🇲"), Map.entry("Japan", "🇯🇵"), Map.entry("Jordan", "🇯🇴"),
            Map.entry("Kazakhstan", "🇰🇿"), Map.entry("Kenya", "🇰🇪"), Map.entry("Kuwait", "🇰🇼"),
            Map.entry("Latvia", "🇱🇻"), Map.entry("Lebanon", "🇱🇧"), Map.entry("Liberia", "🇱🇷"),
            Map.entry("Libya", "🇱🇾"), Map.entry("Lithuania", "🇱🇹"), Map.entry("Madagascar", "🇲🇬"),
            Map.entry("Malawi", "🇲🇼"), Map.entry("Malaysia", "🇲🇾"), Map.entry("Mali", "🇲🇱"),
            Map.entry("Mexico", "🇲🇽"), Map.entry("Morocco", "🇲🇦"), Map.entry("Mozambique", "🇲🇿"),
            Map.entry("Myanmar", "🇲🇲"), Map.entry("Nepal", "🇳🇵"), Map.entry("Netherlands", "🇳🇱"),
            Map.entry("New Caledonia", "🇳🇨"), Map.entry("New Zealand", "🇳🇿"), Map.entry("Nicaragua", "🇳🇮"),
            Map.entry("Niger", "🇳🇪"), Map.entry("Nigeria", "🇳🇬"), Map.entry("Norway", "🇳🇴"),
            Map.entry("Oman", "🇴🇲"), Map.entry("Pakistan", "🇵🇰"), Map.entry("Panama", "🇵🇦"),
            Map.entry("Papua New Guinea", "🇵🇬"), Map.entry("Paraguay", "🇵🇾"), Map.entry("Peru", "🇵🇪"),
            Map.entry("Philippines", "🇵🇭"), Map.entry("Poland", "🇵🇱"), Map.entry("Portugal", "🇵🇹"),
            Map.entry("Qatar", "🇶🇦"), Map.entry("Romania", "🇷🇴"), Map.entry("Russia", "🇷🇺"),
            Map.entry("Samoa", "🇼🇸"), Map.entry("Saudi Arabia", "🇸🇦"), Map.entry("Senegal", "🇸🇳"),
            Map.entry("Serbia", "🇷🇸"), Map.entry("Sierra Leone", "🇸🇱"), Map.entry("Singapore", "🇸🇬"),
            Map.entry("Slovakia", "🇸🇰"), Map.entry("Slovenia", "🇸🇮"), Map.entry("Somalia", "🇸🇴"),
            Map.entry("South Africa", "🇿🇦"), Map.entry("South Korea", "🇰🇷"), Map.entry("Spain", "🇪🇸"),
            Map.entry("Sri Lanka", "🇱🇰"), Map.entry("Sudan", "🇸🇩"), Map.entry("Sweden", "🇸🇪"),
            Map.entry("Switzerland", "🇨🇭"), Map.entry("Syria", "🇸🇾"), Map.entry("Tanzania", "🇹🇿"),
            Map.entry("Thailand", "🇹🇭"), Map.entry("Tonga", "🇹🇴"), Map.entry("Tunisia", "🇹🇳"),
            Map.entry("Turkey", "🇹🇷"), Map.entry("UAE", "🇦🇪"), Map.entry("UK", "🇬🇧"),
            Map.entry("USA", "🇺🇸"), Map.entry("Uganda", "🇺🇬"), Map.entry("Ukraine", "🇺🇦"),
            Map.entry("Uruguay", "🇺🇾"), Map.entry("Uzbekistan", "🇺🇿"), Map.entry("Venezuela", "🇻🇪"),
            Map.entry("Vietnam", "🇻🇳"), Map.entry("Zambia", "🇿🇲"), Map.entry("Zimbabwe", "🇿🇼")
    );

    private CountryFlags() {
    }

    static String of(String country) {
        return FLAGS.getOrDefault(country, DEFAULT);
    }
}
