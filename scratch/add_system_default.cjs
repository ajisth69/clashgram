const fs = require('fs');
const path = require('path');

const localizationDir = path.join(__dirname, '..', 'src', 'assets', 'localization');

const systemDefaults = {
  ru: "Системный по умолчанию",
  es: "Predeterminado del sistema",
  uk: "Системний за замовчуванням",
  ar: "افتراضي النظام",
  fa: "پیش‌فرض سیستم",
  pt: "Padrão do sistema",
  "pt-br": "Padrão do sistema",
  de: "Systemstandard",
  fr: "Par défaut du système",
  id: "Default Sistem",
  tr: "Sistem Varsayılanı",
  it: "Predefinito di sistema"
};

// Append to localized files
for (const [locale, translation] of Object.entries(systemDefaults)) {
  const filePath = path.join(localizationDir, `${locale}.strings`);
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, `"SystemDefault" = "${translation}";\n`, 'utf8');
    console.log(`Appended SystemDefault to ${locale}.strings`);
  }
}

// Append to fallback.strings
const fallbackPath = path.join(localizationDir, 'fallback.strings');
if (fs.existsSync(fallbackPath)) {
  fs.appendFileSync(fallbackPath, `"SystemDefault" = "System Default";\n`, 'utf8');
  console.log(`Appended SystemDefault to fallback.strings`);
}
