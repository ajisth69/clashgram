const fs = require('fs');
const path = require('path');

const localizationDir = path.join(__dirname, '..', 'src', 'assets', 'localization');

const newTranslations = {
  ru: {
    ClashgramPasscodeUsePrimary: "Использовать основной код-пароль",
    ClashgramPasscodeUseRecovery: "Использовать резервный код-пароль",
    ClashgramPasscodeCurrent: "Текущий код-пароль",
    ClashgramPasscodeNewPrimary: "Новый основной код-пароль",
    ClashgramPasscodeNewRecovery: "Новый резервный код-пароль (резерв)",
    ClashgramPasscodeUpdateSettings: "Обновить настройки код-пароля",
    ClashgramPasscodeForgotDesc: "Забыли основной код-пароль? Введите настроенный резервный код-пароль.",
    ClashgramPasscodeLostBothHeader: "Потеряли и основной, и резервный код-пароли?",
    ClashgramPasscodeLostBothDesc: "Для защиты чатов от несанкционированного доступа локальные блокировки могут быть сброшены только путем завершения текущего сеанса устройства.",
    ClashgramPasscodeLogoutReset: "Выйти и сбросить блокировки устройства",
    ClashgramPasscodeRecoveryVerified: "Резервный пароль подтвержден! Выберите новые основной и резервный код-пароли.",
    ClashgramPasscodeSaveNew: "Сохранить новые настройки безопасности",
    ClashgramPasscodeNoLockedItems: "Нет заблокированных чатов или папок.",
    ClashgramPasscodeManageItemsDesc: "Ниже приведен список папок и приватных чатов, защищенных на этом устройстве. Нажмите Разблокировать, чтобы снять защиту.",
    ClashgramPasscodeManageItemsTip: "Совет: Вы можете заблокировать новые разговоры в любое время, щелкнув правой кнопкой мыши вкладку папки или любой отдельный пункт меню чатов и выбрав «Заблокировать чат/папку».",
    ClashgramPasscodeDisableButton: "Отключить защиту код-паролем",
    ClashgramPasscodeConfirmVerify: "Подтвердите личность, чтобы установить новый основной код-пароль. Вы можете использовать основной или резервный пароль.",
    Unlock: "Разблокировать"
  },
  es: {
    ClashgramPasscodeUsePrimary: "Usar código de acceso principal",
    ClashgramPasscodeUseRecovery: "Usar código de recuperación",
    ClashgramPasscodeCurrent: "Código de acceso actual",
    ClashgramPasscodeNewPrimary: "Nuevo código de acceso principal",
    ClashgramPasscodeNewRecovery: "Nuevo código de recuperación (respaldo)",
    ClashgramPasscodeUpdateSettings: "Actualizar ajustes de código de acceso",
    ClashgramPasscodeForgotDesc: "¿Olvidaste tu código principal? Introduce el código de recuperación configurado.",
    ClashgramPasscodeLostBothHeader: "¿Perdiste tanto el código principal como el de recuperación?",
    ClashgramPasscodeLostBothDesc: "Para proteger tus chats de accesos no autorizados, los bloqueos locales solo se pueden borrar cerrando la sesión actual del dispositivo.",
    ClashgramPasscodeLogoutReset: "Cerrar sesión y restablecer bloqueos",
    ClashgramPasscodeRecoveryVerified: "¡Recuperación verificada! Elige tus nuevos códigos principal y de recuperación.",
    ClashgramPasscodeSaveNew: "Guardar nuevos ajustes de seguridad",
    ClashgramPasscodeNoLockedItems: "No hay chats ni carpetas bloqueadas.",
    ClashgramPasscodeManageItemsDesc: "A continuación se muestra una lista de carpetas y chats privados protegidos en este dispositivo. Haz clic en Desbloquear para quitar la protección.",
    ClashgramPasscodeManageItemsTip: "Consejo: Puedes bloquear nuevas conversaciones en cualquier momento haciendo clic derecho en la pestaña de una carpeta o en cualquier elemento del menú de chats y seleccionando \"Bloquear chat/carpeta\".",
    ClashgramPasscodeDisableButton: "Desactivar protección por código",
    ClashgramPasscodeConfirmVerify: "Confirma tu identidad para establecer un nuevo código principal. Puedes verificar con tu código principal o con el de recuperación.",
    Unlock: "Desbloquear"
  },
  uk: {
    ClashgramPasscodeUsePrimary: "Використовувати основний код-пароль",
    ClashgramPasscodeUseRecovery: "Використовувати резервний код-пароль",
    ClashgramPasscodeCurrent: "Поточний код-пароль",
    ClashgramPasscodeNewPrimary: "Новий основний код-пароль",
    ClashgramPasscodeNewRecovery: "Новий резервний код-пароль (резерв)",
    ClashgramPasscodeUpdateSettings: "Оновити налаштування код-пароля",
    ClashgramPasscodeForgotDesc: "Забули основний код-пароль? Введіть налаштований резервний код-пароль.",
    ClashgramPasscodeLostBothHeader: "Втратили і основний, и резервний код-паролі?",
    ClashgramPasscodeLostBothDesc: "Для захисту чатів від несанкціонованого доступу локальні блокування можуть бути скинуті тільки шляхом завершення поточного сеансу пристрою.",
    ClashgramPasscodeLogoutReset: "Вийти та скинути блокування пристрою",
    ClashgramPasscodeRecoveryVerified: "Резервний пароль підтверджено! Виберіть нові основний та резервний код-паролі.",
    ClashgramPasscodeSaveNew: "Зберегти нові налаштування безпеки",
    ClashgramPasscodeNoLockedItems: "Немає заблокованих чатів або папок.",
    ClashgramPasscodeManageItemsDesc: "Нижче наведено список папок та приватних чатів, захищених на цьому пристрої. Натисніть Розблокувати, щоб зняти захист.",
    ClashgramPasscodeManageItemsTip: "Порада: Ви можете заблокувати нові розмови в будь-який час, клацнувши правою кнопкою миші вкладку папки або будь-який окремий пункт меню чатів та вибравши «Заблокировать чат/папку».",
    ClashgramPasscodeDisableButton: "Вимкнути захист код-паролем",
    ClashgramPasscodeConfirmVerify: "Підтвердьте особу, щоб встановити новий основний код-пароль. Ви можете використовувати основний або резервний пароль.",
    Unlock: "Розблокувати"
  },
  ar: {
    ClashgramPasscodeUsePrimary: "استخدام رمز المرور الأساسي",
    ClashgramPasscodeUseRecovery: "استخدام رمز الاسترداد",
    ClashgramPasscodeCurrent: "رمز المرور الحالي",
    ClashgramPasscodeNewPrimary: "رمز مرور أساسي جديد",
    ClashgramPasscodeNewRecovery: "رمز استرداد جديد (احتياطي)",
    ClashgramPasscodeUpdateSettings: "تحديث إعدادات رمز المرور",
    ClashgramPasscodeForgotDesc: "هل نسيت رمز مرورك الأساسي؟ أدخل رمز الاسترداد الاحتياطي الذي قمت بتكوينه.",
    ClashgramPasscodeLostBothHeader: "هل فقدت كلا رمزي المرور الأساسي والاحتياطي؟",
    ClashgramPasscodeLostBothDesc: "لحماية دردشاتك من الوصول غير المصرح به، لا يمكن مسح الأقفال المحلية إلا بإنهاء جلسة الجهاز النشطة الحالية.",
    ClashgramPasscodeLogoutReset: "تسجيل الخروج وإعادة تعيين أقفال الجهاز",
    ClashgramPasscodeRecoveryVerified: "تم التحقق من الاسترداد! اختر رمزي المرور الجديدين الأساسي والاحتياطي.",
    ClashgramPasscodeSaveNew: "حفظ إعدادات الأمان الجديدة",
    ClashgramPasscodeNoLockedItems: "لا توجد دردشات أو مجلدات مقفلة.",
    ClashgramPasscodeManageItemsDesc: "أدناه قائمة بالمجلدات والدردشات الخاصة المحمية على هذا الجهاز. انقر فوق إلغاء القفل لإزالة الحماية.",
    ClashgramPasscodeManageItemsTip: "نصيحة: يمكنك قفل المحادثات الجديدة في أي وقت بالنقر بزر الماوس الأيمن فوق علامة تبويب مجلد أو أي عنصر في قائمة الدردشات واختيار \"قفل الدردشة/المجلد\".",
    ClashgramPasscodeDisableButton: "إيقاف الحماية رمز المرور",
    ClashgramPasscodeConfirmVerify: "أكد هويتك لتعيين رمز مرور أساسي جديد. يمكنك التحقق باستخدام مفتاحك الأساسي أو الاحتياطي.",
    Unlock: "إلغاء القفل"
  },
  fa: {
    ClashgramPasscodeUsePrimary: "استفاده از گذرواژه اصلی",
    ClashgramPasscodeUseRecovery: "استفاده از گذرواژه پشتیبان",
    ClashgramPasscodeCurrent: "گذرواژه فعلی",
    ClashgramPasscodeNewPrimary: "گذرواژه اصلی جدید",
    ClashgramPasscodeNewRecovery: "گذرواژه پشتیبان جدید (پشتیبان)",
    ClashgramPasscodeUpdateSettings: "بروزرسانی تنظیمات گذرواژه",
    ClashgramPasscodeForgotDesc: "گذرواژه اصلی خود را فراموش کرده‌اید؟ کد پشتیبان تنظیم شده را وارد کنید.",
    ClashgramPasscodeLostBothHeader: "هر دو گذرواژه اصلی و پشتیبان را گم کرده‌اید؟",
    ClashgramPasscodeLostBothDesc: "برای محافظت از گفتگوهای شما در برابر دسترسی‌های غیرمجاز، قفل‌های محلی تنها با خروج از نشست فعال فعلی دستگاه قابل پاکسازی هستند.",
    ClashgramPasscodeLogoutReset: "خروج و بازنشانی قفل‌های دستگاه",
    ClashgramPasscodeRecoveryVerified: "کد پشتیبان تایید شد! گذرواژه‌های اصلی و پشتیبان جدید خود را انتخاب کنید.",
    ClashgramPasscodeSaveNew: "ذخیره تنظیمات امنیتی جدید",
    ClashgramPasscodeNoLockedItems: "هیچ گفتگو یا پوشه‌ای قفل نیست.",
    ClashgramPasscodeManageItemsDesc: "در زیر لیستی از پوشه‌ها و گفتگوهای خصوصی محافظت‌شده در این دستگاه آمده است. برای لغو محافظت، روی قفل‌گشایی کلیک کنید.",
    ClashgramPasscodeManageItemsTip: "نکته: شما می‌توانید گفتگوهای جدید را در هر زمان با راست‌کلیک روی زبانه پوشه یا هر بخش دلخواه در منوی گفتگوها و انتخاب «قفل گفتگو/پوشه» قفل کنید.",
    ClashgramPasscodeDisableButton: "غیرفعال‌سازی حفاظت گذرواژه",
    ClashgramPasscodeConfirmVerify: "هویت خود را برای تنظیم گذرواژه اصلی جدید تأیید کنید. می‌توانید با گذرواژه اصلی یا پشتیبان تأیید کنید.",
    Unlock: "قفل‌گشایی"
  },
  pt: {
    ClashgramPasscodeUsePrimary: "Usar senha principal",
    ClashgramPasscodeUseRecovery: "Usar senha de recuperação",
    ClashgramPasscodeCurrent: "Senha atual",
    ClashgramPasscodeNewPrimary: "Nova senha principal",
    ClashgramPasscodeNewRecovery: "Nova senha de recuperação (backup)",
    ClashgramPasscodeUpdateSettings: "Atualizar configurações de senha",
    ClashgramPasscodeForgotDesc: "Esqueceu sua senha principal? Digite o código de recuperação configurado.",
    ClashgramPasscodeLostBothHeader: "Perdeu a senha principal e a de recuperação?",
    ClashgramPasscodeLostBothDesc: "Para proteger suas conversas de acesso não autorizado, os bloqueos locais só podem ser limpos encerrando a sessão atual do dispositivo.",
    ClashgramPasscodeLogoutReset: "Sair e redefinir bloqueios do dispositivo",
    ClashgramPasscodeRecoveryVerified: "Recuperação verificada! Escolha suas novas senhas principal e de recuperação.",
    ClashgramPasscodeSaveNew: "Salvar novas configurações de segurança",
    ClashgramPasscodeNoLockedItems: "Nenhuma conversa ou pasta está bloqueada.",
    ClashgramPasscodeManageItemsDesc: "Abaixo está uma lista de pastas e conversas privadas protegidas neste dispositivo. Clique em Desbloquear para remover a proteção.",
    ClashgramPasscodeManageItemsTip: "Dica: Você pode bloquear novas conversas a qualquer momento clicando com o botão direito na guia de uma pasta ou em qualquer item do menu de conversas e selecionando \"Bloquear conversa/pasta\".",
    ClashgramPasscodeDisableButton: "Desativar proteção por senha",
    ClashgramPasscodeConfirmVerify: "Confirme a identidade para definir uma nova senha principal. Você pode verificar usando sua senha principal ou a de recuperação.",
    Unlock: "Desbloquear"
  },
  "pt-br": {
    ClashgramPasscodeUsePrimary: "Usar senha principal",
    ClashgramPasscodeUseRecovery: "Usar senha de recuperação",
    ClashgramPasscodeCurrent: "Senha atual",
    ClashgramPasscodeNewPrimary: "Nova senha principal",
    ClashgramPasscodeNewRecovery: "Nova senha de recuperação (backup)",
    ClashgramPasscodeUpdateSettings: "Atualizar configurações de senha",
    ClashgramPasscodeForgotDesc: "Esqueceu sua senha principal? Digite o código de recuperação configurado.",
    ClashgramPasscodeLostBothHeader: "Perdeu a senha principal e a de recuperação?",
    ClashgramPasscodeLostBothDesc: "Para proteger suas conversas de acesso não autorizado, os bloqueos locais só podem ser limpos encerrando a sessão atual do dispositivo.",
    ClashgramPasscodeLogoutReset: "Sair e redefinir bloqueios do dispositivo",
    ClashgramPasscodeRecoveryVerified: "Recuperação verificada! Escolha suas novas senhas principal e de recuperação.",
    ClashgramPasscodeSaveNew: "Salvar novas configurações de segurança",
    ClashgramPasscodeNoLockedItems: "Nenhuma conversa ou pasta está bloqueada.",
    ClashgramPasscodeManageItemsDesc: "Abaixo está uma lista de pastas e conversas privadas protegidas neste dispositivo. Clique em Desbloquear para remover a proteção.",
    ClashgramPasscodeManageItemsTip: "Dica: Você pode bloquear novas conversas a qualquer momento clicando com o botão direito na guia de uma pasta ou em qualquer item do menu de conversas e selecionando \"Bloquear conversa/pasta\".",
    ClashgramPasscodeDisableButton: "Desativar proteção por senha",
    ClashgramPasscodeConfirmVerify: "Confirme a identidade para definir uma nova senha principal. Você pode verificar usando sua senha principal ou a de recuperação.",
    Unlock: "Desbloquear"
  },
  de: {
    ClashgramPasscodeUsePrimary: "Primären Passcode verwenden",
    ClashgramPasscodeUseRecovery: "Wiederherstellungs-Passcode verwenden",
    ClashgramPasscodeCurrent: "Aktueller Passcode",
    ClashgramPasscodeNewPrimary: "Neuer primärer Passcode",
    ClashgramPasscodeNewRecovery: "Neuer Wiederherstellungs-Passcode (Backup)",
    ClashgramPasscodeUpdateSettings: "Passcode-Einstellungen aktualisieren",
    ClashgramPasscodeForgotDesc: "Primären Passcode vergessen? Geben Sie den konfigurierten Wiederherstellungs-Passcode ein.",
    ClashgramPasscodeLostBothHeader: "Sowohl primären als auch Wiederherstellungs-Passcode verloren?",
    ClashgramPasscodeLostBothDesc: "Um Ihre Chats vor unbefugtem Zugriff zu schützen, können die lokalen Sperren nur durch Beenden der aktuellen aktiven Gerätesitzung gelöscht werden.",
    ClashgramPasscodeLogoutReset: "Abmelden & Gerätesperren zurücksetzen",
    ClashgramPasscodeRecoveryVerified: "Wiederherstellung verifiziert! Wählen Sie Ihren neuen primären und Wiederherstellungs-Passcode.",
    ClashgramPasscodeSaveNew: "Neue Sicherheitseinstellungen speichern",
    ClashgramPasscodeNoLockedItems: "Keine Chats oder Ordner gesperrt.",
    ClashgramPasscodeManageItemsDesc: "Unten finden Sie eine Liste der auf diesem Gerät geschützten Ordner und privaten Chats. Klicken Sie auf Entsperren, um den Schutz aufzuheben.",
    ClashgramPasscodeManageItemsTip: "Tipp: Sie können neue Konversationen jederzeit sperren, indem Sie mit der rechten Maustaste auf eine Ordner-Registerkarte oder ein Element im Chats-Menü klicken und „Chat/Ordner sperren“ auswählen.",
    ClashgramPasscodeDisableButton: "Passcode-Schutz deaktivieren",
    ClashgramPasscodeConfirmVerify: "Bestätigen Sie Ihre Identität, um einen neuen primären Passcode festzulegen. Sie können sich mit Ihrem primären oder Wiederherstellungs-Passcode verifizieren.",
    Unlock: "Entsperren"
  },
  fr: {
    ClashgramPasscodeUsePrimary: "Utiliser le code principal",
    ClashgramPasscodeUseRecovery: "Utiliser le code de récupération",
    ClashgramPasscodeCurrent: "Code de verrouillage actuel",
    ClashgramPasscodeNewPrimary: "Nouveau code de verrouillage principal",
    ClashgramPasscodeNewRecovery: "Nouveau code de récupération (secours)",
    ClashgramPasscodeUpdateSettings: "Mettre à jour les paramètres de code",
    ClashgramPasscodeForgotDesc: "Code principal oublié ? Saisissez le code de récupération configuré.",
    ClashgramPasscodeLostBothHeader: "Code principal et code de secours perdus ?",
    ClashgramPasscodeLostBothDesc: "Pour protéger vos échanges d'un accès non autorisé, les verrous locaux ne peuvent être effacés qu'en mettant fin à la session active sur cet appareil.",
    ClashgramPasscodeLogoutReset: "Se déconnecter et réinitialiser les verrous",
    ClashgramPasscodeRecoveryVerified: "Récupération vérifiée ! Choisissez vos nouveaux codes principal et de secours.",
    ClashgramPasscodeSaveNew: "Enregistrer les nouveaux paramètres",
    ClashgramPasscodeNoLockedItems: "Aucun échange ni dossier verrouillé.",
    ClashgramPasscodeManageItemsDesc: "Voici la liste des dossiers et discussions protégés sur cet appareil. Cliquez sur Déverrouiller pour lever la protection.",
    ClashgramPasscodeManageItemsTip: "Astuce : Vous pouvez verrouiller de nouvelles discussions à tout moment en faisant un clic droit sur un onglet de dossier ou sur n'importe quel élément du menu des discussions, puis en choisissant \"Verrouiller la discussion/le dossier\".",
    ClashgramPasscodeDisableButton: "Désactiver la protection par code",
    ClashgramPasscodeConfirmVerify: "Confirmez votre identité pour définir un nouveau code. Vous pouvez vous identifier avec votre code principal ou de secours.",
    Unlock: "Déverrouiller"
  },
  id: {
    ClashgramPasscodeUsePrimary: "Gunakan Sandi Utama",
    ClashgramPasscodeUseRecovery: "Gunakan Sandi Pemulihan",
    ClashgramPasscodeCurrent: "Sandi Kunci Saat Ini",
    ClashgramPasscodeNewPrimary: "Sandi Kunci Utama Baru",
    ClashgramPasscodeNewRecovery: "Sandi Pemulihan Baru (Backup)",
    ClashgramPasscodeUpdateSettings: "Perbarui Pengaturan Sandi Kunci",
    ClashgramPasscodeForgotDesc: "Lupa sandi utama Anda? Masukkan kode pemulihan cadangan yang Anda konfigurasi.",
    ClashgramPasscodeLostBothHeader: "Kehilangan sandi Utama & Pemulihan?",
    ClashgramPasscodeLostBothDesc: "Untuk melindungi obrolan Anda dari akses tidak sah, kunci lokal hanya dapat dihapus dengan mengakhiri sesi perangkat aktif saat ini.",
    ClashgramPasscodeLogoutReset: "Keluar & Reset Kunci Perangkat",
    ClashgramPasscodeRecoveryVerified: "Pemulihan terverifikasi! Pilih sandi utama & pemulihan baru Anda.",
    ClashgramPasscodeSaveNew: "Simpan Pengaturan Keamanan Baru",
    ClashgramPasscodeNoLockedItems: "Tidak ada obrolan atau folder yang terkunci.",
    ClashgramPasscodeManageItemsDesc: "Di bawah ini adalah daftar folder dan obrolan pribadi yang dilindungi di perangkat ini. Klik Buka Kunci untuk menghilangkan perlindungan.",
    ClashgramPasscodeManageItemsTip: "Tips: Anda dapat mengunci obrolan baru kapan saja dengan mengklik kanan tab folder atau item apa pun di menu obrolan dan memilih \"Kunci Obrolan/Folder\".",
    ClashgramPasscodeDisableButton: "Nonaktifkan Perlindungan Sandi",
    ClashgramPasscodeConfirmVerify: "Konfirmasi identitas untuk menetapkan sandi utama baru. Anda dapat memverifikasi dengan kunci utama atau cadangan pemulihan.",
    Unlock: "Buka Kunci"
  },
  tr: {
    ClashgramPasscodeUsePrimary: "Birincil Şifreyi Kullan",
    ClashgramPasscodeUseRecovery: "Kurtarma Şifresini Kullan",
    ClashgramPasscodeCurrent: "Mevcut Şifre",
    ClashgramPasscodeNewPrimary: "Yeni Birincil Şifre",
    ClashgramPasscodeNewRecovery: "Yeni Kurtarma Şifresi (Yedek)",
    ClashgramPasscodeUpdateSettings: "Şifre Ayarlarını Güncelle",
    ClashgramPasscodeForgotDesc: "Birincil şifrenizi mi unuttunuz? Yapılandırdığınız yedek kurtarma şifresini girin.",
    ClashgramPasscodeLostBothHeader: "Hem Birincil Hem de Kurtarma şifresini mi kaybettiniz?",
    ClashgramPasscodeLostBothDesc: "Sohbetlerinizi yetkisiz erişimden korumak için yerel kilitler yalnızca mevcut aktif cihaz oturumu sonlandırılarak temizlenebilir.",
    ClashgramPasscodeLogoutReset: "Çıkış Yap ve Cihaz Kilitlerini Sıfırla",
    ClashgramPasscodeRecoveryVerified: "Kurtarma doğrulandı! Yeni birincil ve kurtarma şifrelerinizi belirleyin.",
    ClashgramPasscodeSaveNew: "Yeni Güvenlik Ayarlarını Kaydet",
    ClashgramPasscodeNoLockedItems: "Hiçbir sohbet veya klasör kilitli değil.",
    ClashgramPasscodeManageItemsDesc: "Aşağıda, bu cihazda korunan klasörlerin ve özel sohbetlerin bir listesi bulunmaktadır. Korumayı kaldırmak için Kilidi Aç seçeneğine tıklayın.",
    ClashgramPasscodeManageItemsTip: "İpucu: Klasör sekmesine veya sohbetler menüsündeki herhangi bir öğeye sağ tıklayıp \"Sohbeti/Klasörü Kilitle\" seçeneğini seçerek yeni konuşmaları istediğiniz zaman kilitleyebilirsiniz.",
    ClashgramPasscodeDisableButton: "Şifre Korumasını Devre Dışı Bırak",
    ClashgramPasscodeConfirmVerify: "Yeni bir birincil şifre belirlemek için kimliğinizi doğrulayın. Birincil veya yedek kurtarma anahtarınızı kullanabilirsiniz.",
    Unlock: "Kilidi Aç"
  },
  it: {
    ClashgramPasscodeUsePrimary: "Usa passcode principale",
    ClashgramPasscodeUseRecovery: "Usa passcode di recupero",
    ClashgramPasscodeCurrent: "Passcode attuale",
    ClashgramPasscodeNewPrimary: "Nuovo passcode principale",
    ClashgramPasscodeNewRecovery: "Nuovo codice di recupero (backup)",
    ClashgramPasscodeUpdateSettings: "Aggiorna impostazioni passcode",
    ClashgramPasscodeForgotDesc: "Hai dimenticato il passcode principale? Inserisci il codice di recupero configurato.",
    ClashgramPasscodeLostBothHeader: "Hai perso sia il passcode principale che quello di recupero?",
    ClashgramPasscodeLostBothDesc: "Per proteggere le tue chat da accessi non autorizzati, i blocchi locali possono essere rimossi solo terminando la sessione del dispositivo attiva.",
    ClashgramPasscodeLogoutReset: "Disconnettiti e ripristina blocchi",
    ClashgramPasscodeRecoveryVerified: "Recupero verificato! Scegli i nuovi passcode principale e di recupero.",
    ClashgramPasscodeSaveNew: "Salva nuove impostazioni di sicurezza",
    ClashgramPasscodeNoLockedItems: "Nessuna chat o cartella bloccata.",
    ClashgramPasscodeManageItemsDesc: "Di seguito è riportato l'elenco delle cartelle e delle chat private protette su questo dispositivo. Fai clic su Sblocca per rimuovere la protezione.",
    ClashgramPasscodeManageItemsTip: "Suggerimento: puoi bloccare nuove conversazioni in qualsiasi momento facendo clic con il tasto destro sulla scheda di una cartella o su qualsiasi elemento nel menu delle chat e selezionando \"Blocca chat/cartella\".",
    ClashgramPasscodeDisableButton: "Disattiva protezione con passcode",
    ClashgramPasscodeConfirmVerify: "Conferma l'identità per impostare un nuovo passcode principale. Puoi verificare usando il passcode principale o di recupero.",
    Unlock: "Sblocca"
  }
};

const englishFallback = {
  ClashgramPasscodeUsePrimary: "Use Primary Passcode",
  ClashgramPasscodeUseRecovery: "Use Recovery Passcode",
  ClashgramPasscodeCurrent: "Current Passcode",
  ClashgramPasscodeNewPrimary: "New Primary Passcode",
  ClashgramPasscodeNewRecovery: "New Recovery Passcode (Backup)",
  ClashgramPasscodeUpdateSettings: "Update Passcode Settings",
  ClashgramPasscodeForgotDesc: "Forgot your primary passcode? Enter the backup recovery code you configured.",
  ClashgramPasscodeLostBothHeader: "Lost both Primary & Recovery passcodes?",
  ClashgramPasscodeLostBothDesc: "To protect your chats from unauthorized access, the local locks can only be wiped by terminating the current active device session.",
  ClashgramPasscodeLogoutReset: "Logout & Reset Device Locks",
  ClashgramPasscodeRecoveryVerified: "Recovery verified! Choose your new primary & recovery passcodes.",
  ClashgramPasscodeSaveNew: "Save New Security Settings",
  ClashgramPasscodeNoLockedItems: "No chats or folders are locked.",
  ClashgramPasscodeManageItemsDesc: "Below is a list of folders and private chats protected on this device. Click Unlock to lift protection.",
  ClashgramPasscodeManageItemsTip: "Tip: You can lock new conversations at any time by right-clicking a folder tab or any individual item in your chats menu and selecting \"Lock Chat/Folder\".",
  ClashgramPasscodeDisableButton: "Disable Passcode Protection",
  ClashgramPasscodeConfirmVerify: "Confirm identity to set a new primary passcode. You can verify using either your primary or recovery backup key.",
  Unlock: "Unlock"
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
    console.log(`Appended passcode translations to ${locale}.strings`);
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
  console.log(`Appended passcode translations to fallback.strings`);
}
