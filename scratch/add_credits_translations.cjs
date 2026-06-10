const fs = require('fs');
const path = require('path');

const localizationDir = path.join(__dirname, '..', 'src', 'assets', 'localization');

const newTranslations = {
  ru: {
    ClashgramCredits: "Благодарности",
    ClashgramCreditsEnhancedClient: "Улучшенный клиент Telegram",
    ClashgramCreditsSupportHeader: "Поддержка и обновления",
    ClashgramCreditsBugsTitle: "Баги, обновления и отчеты",
    ClashgramCreditsBugsSub: "Свяжитесь с @letmesolo_her для поддержки",
    ClashgramCreditsChannelTitle: "Официальный канал",
    ClashgramCreditsChannelSub: "Присоединяйтесь к t.me/clashgramclient для обновлений",
    ClashgramCreditsInfoHeader: "Информация о клиенте",
    ClashgramCreditsVersionTitle: "Версия",
    ClashgramCreditsMadeWithLove: "Сделано с любовью",
    ClashgramCreditsThankYou: "Спасибо, что выбрали Clashgram!"
  },
  es: {
    ClashgramCredits: "Créditos",
    ClashgramCreditsEnhancedClient: "Cliente de Telegram mejorado",
    ClashgramCreditsSupportHeader: "Soporte y actualizaciones",
    ClashgramCreditsBugsTitle: "Errores, actualizaciones e informes",
    ClashgramCreditsBugsSub: "Contacta con @letmesolo_her para soporte",
    ClashgramCreditsChannelTitle: "Canal oficial",
    ClashgramCreditsChannelSub: "Únete a t.me/clashgramclient para actualizaciones",
    ClashgramCreditsInfoHeader: "Información del cliente",
    ClashgramCreditsVersionTitle: "Versión",
    ClashgramCreditsMadeWithLove: "Hecho con amor",
    ClashgramCreditsThankYou: "¡Gracias por elegir Clashgram!"
  },
  uk: {
    ClashgramCredits: "Автори",
    ClashgramCreditsEnhancedClient: "Покращений клієнт Telegram",
    ClashgramCreditsSupportHeader: "Підтримка та оновлення",
    ClashgramCreditsBugsTitle: "Баги, оновлення та звіти",
    ClashgramCreditsBugsSub: "Зв'яжіться з @letmesolo_her для підтримки",
    ClashgramCreditsChannelTitle: "Офіційний канал",
    ClashgramCreditsChannelSub: "Приєднуйтесь до t.me/clashgramclient для оновлень",
    ClashgramCreditsInfoHeader: "Інформація про клієнт",
    ClashgramCreditsVersionTitle: "Версія",
    ClashgramCreditsMadeWithLove: "Зроблено з любов'ю",
    ClashgramCreditsThankYou: "Дякуємо, що обрали Clashgram!"
  },
  ar: {
    ClashgramCredits: "المساهمون",
    ClashgramCreditsEnhancedClient: "عميل تيليجرام محسّن",
    ClashgramCreditsSupportHeader: "الدعم والتحديثات",
    ClashgramCreditsBugsTitle: "الأخطاء، التحديثات والتقارير",
    ClashgramCreditsBugsSub: "تواصل مع @letmesolo_her للحصول على الدعم",
    ClashgramCreditsChannelTitle: "القناة الرسمية",
    ClashgramCreditsChannelSub: "انضم إلى t.me/clashgramclient للحصول على التحديثات",
    ClashgramCreditsInfoHeader: "معلومات العميل",
    ClashgramCreditsVersionTitle: "الإصدار",
    ClashgramCreditsMadeWithLove: "صنع بكل حب",
    ClashgramCreditsThankYou: "شكرًا لاختيارك كلاشغرام!"
  },
  fa: {
    ClashgramCredits: "سازندگان",
    ClashgramCreditsEnhancedClient: "نسخه بهبودیافته تلگرام",
    ClashgramCreditsSupportHeader: "پشتیبانی و بروزرسانی‌ها",
    ClashgramCreditsBugsTitle: "خطاها، بروزرسانی‌ها و گزارش‌ها",
    ClashgramCreditsBugsSub: "برای پشتیبانی با @letmesolo_her ارتباط برقرار کنید",
    ClashgramCreditsChannelTitle: "کانال رسمی",
    ClashgramCreditsChannelSub: "برای دریافت بروزرسانی‌ها به t.me/clashgramclient بپیوندید",
    ClashgramCreditsInfoHeader: "اطلاعات برنامه",
    ClashgramCreditsVersionTitle: "نسخه",
    ClashgramCreditsMadeWithLove: "ساخته شده با عشق",
    ClashgramCreditsThankYou: "از اینکه کلش‌گرام را انتخاب کردید متشکریم!"
  },
  pt: {
    ClashgramCredits: "Créditos",
    ClashgramCreditsEnhancedClient: "Cliente Telegram aprimorado",
    ClashgramCreditsSupportHeader: "Suporte e atualizações",
    ClashgramCreditsBugsTitle: "Bugs, atualizações e relatórios",
    ClashgramCreditsBugsSub: "Contate @letmesolo_her para suporte",
    ClashgramCreditsChannelTitle: "Canal oficial",
    ClashgramCreditsChannelSub: "Inscreva-se em t.me/clashgramclient para atualizações",
    ClashgramCreditsInfoHeader: "Informações do cliente",
    ClashgramCreditsVersionTitle: "Versão",
    ClashgramCreditsMadeWithLove: "Feito com amor",
    ClashgramCreditsThankYou: "Obrigado por escolher o Clashgram!"
  },
  "pt-br": {
    ClashgramCredits: "Créditos",
    ClashgramCreditsEnhancedClient: "Cliente Telegram aprimorado",
    ClashgramCreditsSupportHeader: "Suporte e atualizações",
    ClashgramCreditsBugsTitle: "Bugs, atualizações e relatórios",
    ClashgramCreditsBugsSub: "Contate @letmesolo_her para suporte",
    ClashgramCreditsChannelTitle: "Canal oficial",
    ClashgramCreditsChannelSub: "Inscreva-se em t.me/clashgramclient para atualizações",
    ClashgramCreditsInfoHeader: "Informações do cliente",
    ClashgramCreditsVersionTitle: "Versão",
    ClashgramCreditsMadeWithLove: "Feito com amor",
    ClashgramCreditsThankYou: "Obrigado por escolher o Clashgram!"
  },
  de: {
    ClashgramCredits: "Credits",
    ClashgramCreditsEnhancedClient: "Erweiterter Telegram-Client",
    ClashgramCreditsSupportHeader: "Support & Updates",
    ClashgramCreditsBugsTitle: "Fehler, Updates & Berichte",
    ClashgramCreditsBugsSub: "Kontaktieren Sie @letmesolo_her für Support",
    ClashgramCreditsChannelTitle: "Offizieller Kanal",
    ClashgramCreditsChannelSub: "Treten Sie t.me/clashgramclient für Updates bei",
    ClashgramCreditsInfoHeader: "Client-Info",
    ClashgramCreditsVersionTitle: "Version",
    ClashgramCreditsMadeWithLove: "Mit Liebe gemacht",
    ClashgramCreditsThankYou: "Vielen Dank, dass Sie sich für Clashgram entschieden haben!"
  },
  fr: {
    ClashgramCredits: "Crédits",
    ClashgramCreditsEnhancedClient: "Client Telegram amélioré",
    ClashgramCreditsSupportHeader: "Support et mises à jour",
    ClashgramCreditsBugsTitle: "Bugs, mises à jour et rapports",
    ClashgramCreditsBugsSub: "Contactez @letmesolo_her pour obtenir de l'aide",
    ClashgramCreditsChannelTitle: "Canal officiel",
    ClashgramCreditsChannelSub: "Rejoignez t.me/clashgramclient pour les mises à jour",
    ClashgramCreditsInfoHeader: "Informations sur le client",
    ClashgramCreditsVersionTitle: "Version",
    ClashgramCreditsMadeWithLove: "Fait avec amour",
    ClashgramCreditsThankYou: "Merci d'avoir choisi Clashgram !"
  },
  id: {
    ClashgramCredits: "Kredit",
    ClashgramCreditsEnhancedClient: "Klien Telegram yang Ditingkatkan",
    ClashgramCreditsSupportHeader: "Dukungan & Pembaruan",
    ClashgramCreditsBugsTitle: "Bug, Pembaruan & Laporan",
    ClashgramCreditsBugsSub: "Hubungi @letmesolo_her untuk dukungan",
    ClashgramCreditsChannelTitle: "Saluran Resmi",
    ClashgramCreditsChannelSub: "Bergabunglah dengan t.me/clashgramclient untuk pembaruan",
    ClashgramCreditsInfoHeader: "Info Klien",
    ClashgramCreditsVersionTitle: "Versi",
    ClashgramCreditsMadeWithLove: "Dibuat dengan Cinta",
    ClashgramCreditsThankYou: "Terima kasih telah memilih Clashgram!"
  },
  tr: {
    ClashgramCredits: "Emeği Geçenler",
    ClashgramCreditsEnhancedClient: "Geliştirilmiş Telegram İstemcisi",
    ClashgramCreditsSupportHeader: "Destek ve Güncellemeler",
    ClashgramCreditsBugsTitle: "Hatalar, Güncellemeler ve Raporlar",
    ClashgramCreditsBugsSub: "Destek için @letmesolo_her ile iletişime geçin",
    ClashgramCreditsChannelTitle: "Resmi Kanal",
    ClashgramCreditsChannelSub: "Güncellemeler için t.me/clashgramclient adresine katılın",
    ClashgramCreditsInfoHeader: "İstemci Bilgisi",
    ClashgramCreditsVersionTitle: "Sürüm",
    ClashgramCreditsMadeWithLove: "Sevgiyle Yapıldı",
    ClashgramCreditsThankYou: "Clashgram'ı seçtiğiniz için teşekkür ederiz!"
  },
  it: {
    ClashgramCredits: "Crediti",
    ClashgramCreditsEnhancedClient: "Client Telegram migliorato",
    ClashgramCreditsSupportHeader: "Supporto e aggiornamenti",
    ClashgramCreditsBugsTitle: "Bug, aggiornamenti e segnalazioni",
    ClashgramCreditsBugsSub: "Contatta @letmesolo_her per supporto",
    ClashgramCreditsChannelTitle: "Canale ufficiale",
    ClashgramCreditsChannelSub: "Unisciti a t.me/clashgramclient per gli aggiornamenti",
    ClashgramCreditsInfoHeader: "Info sul client",
    ClashgramCreditsVersionTitle: "Versione",
    ClashgramCreditsMadeWithLove: "Fatto con amore",
    ClashgramCreditsThankYou: "Grazie per aver scelto Clashgram!"
  }
};

const englishFallback = {
  ClashgramCredits: "Credits",
  ClashgramCreditsEnhancedClient: "Enhanced Telegram Client",
  ClashgramCreditsSupportHeader: "Support & Updates",
  ClashgramCreditsBugsTitle: "Bugs, Updates & Reports",
  ClashgramCreditsBugsSub: "Contact @letmesolo_her for support",
  ClashgramCreditsChannelTitle: "Official Channel",
  ClashgramCreditsChannelSub: "Join t.me/clashgramclient for updates",
  ClashgramCreditsInfoHeader: "Client Info",
  ClashgramCreditsVersionTitle: "Version",
  ClashgramCreditsMadeWithLove: "Made with Love",
  ClashgramCreditsThankYou: "Thank you for choosing Clashgram!"
};

// Append to localized files
for (const [locale, data] of Object.entries(newTranslations)) {
  const filePath = path.join(localizationDir, `${locale}.strings`);
  if (fs.existsSync(filePath)) {
    let content = '\n';
    for (const [key, value] of Object.entries(data)) {
      const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      content += `"${key}" = "${escapedValue}";\n`;
    }
    fs.appendFileSync(filePath, content, 'utf8');
    console.log(`Appended credits translations to ${locale}.strings`);
  }
}

// Append to fallback.strings
const fallbackPath = path.join(localizationDir, 'fallback.strings');
if (fs.existsSync(fallbackPath)) {
  let content = '\n';
  for (const [key, value] of Object.entries(englishFallback)) {
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    content += `"${key}" = "${escapedValue}";\n`;
  }
  fs.appendFileSync(fallbackPath, content, 'utf8');
  console.log(`Appended credits translations to fallback.strings`);
}
