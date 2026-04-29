# تعليمات لـ Claude Code — منصة تمكين

أنت تعمل على منصة تمكين، نظام إدارة لرحلة الجمعيات الخيرية السعودية بعد الترخيص.

## هيكل المشروع

- `index.html` — الصفحة الرئيسية، تحتوي على HTML للتبويبات الثمانية
- `assets/style.css` — كل التنسيقات (RTL، خطوط Tajawal و IBM Plex Sans Arabic)
- `assets/app.js` — كل التفاعلات (تبويبات، فلاتر، modals، تصدير PDF)
- `data/*.json` — البيانات (متغيرات، لوائح، مهام)
- `netlify.toml` — إعدادات النشر

## التبويبات الثمانية في index.html

1. `panel-dashboard` — لوحة المتابعة
2. `panel-plan` — خطة التأسيس (الأسابيع 1-14)
3. `panel-calendar` — التقويم التنظيمي
4. `panel-regulations` — اللوائح والسياسات (3 sub-panels: vars, reglist, editor)
5. `panel-knowledge` — المكتبة التشريعية
6. `panel-partners` — الشركاء
7. `panel-assess` — التقييم الذاتي
8. `panel-opplan` — الخطة التشغيلية

## قواعد التعديل

1. **اللون والتنسيق**: عدّل `assets/style.css` فقط
2. **بنية HTML**: عدّل `index.html` — كل تبويب في `<section class="panel" id="panel-X">`
3. **التفاعلات**: عدّل `assets/app.js`
4. **البيانات الثابتة**: استخدم `data/*.json`
5. **الخطوط**: مستوردة من Google Fonts في `<head>` — لا تعدّلها بدون سبب

## ألوان المنصة (CSS variables)

- `--ink: #1a1816` — النص الأساسي والخلفيات الداكنة
- `--paper: #f5f1ea` — الخلفية الرئيسية
- `--accent: #8b3a1f` — اللون الترابي العسيري الأساسي
- `--teal: #2d5e5a` — الفيروزي للـ secondary
- `--gold: #a8843e` — الذهبي القديم
- `--good: #3f6b3a` — الأخضر للحالات المكتملة

## أوامر شائعة من المستخدم

- "أضف مهمة في الأسبوع X" → عدّل `panel-plan` في index.html
- "غيّر اسم الجمعية" → عدّل `data/vars.json`
- "أضف لائحة جديدة" → عدّل `panel-regulations` و `data/regulations.json`
- "صدّر PDF يحتوي على X" → عدّل دالة `generatePDF` في app.js
- "أضف تبويباً جديداً" → عدّل شريط التبويبات + أضف `<section>` جديد + style.css

## النشر

كل push على GitHub يُنشر تلقائياً عبر Netlify. لا تحتاج build — الموقع static.

## ملاحظات مهمة

- جميع النصوص بالعربية — استخدم RTL دائماً
- الموقع يدعم localStorage لحفظ التعديلات محلياً
- مكتبات jsPDF و html2canvas مستوردة من CDN في `<head>`
- لا تستخدم npm packages — كل شيء vanilla JS
