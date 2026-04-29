

  // ============================================================
  //  نظام اللوائح والسياسات
  // ============================================================

  // قاموس المتغيرات العالمية
  const VARS = {
    'اسم_الجمعية': 'جمعية أنموذج الخيرية',
    'رقم_الترخيص': '700-1234-5678',
    'تاريخ_الترخيص': '1447/01/01 هـ',
    'المنطقة': 'منطقة عسير',
    'المقر': 'أبها',
    'البريد_الرسمي': 'info@jam3iya.org.sa',
    'الموقع': 'www.jam3iya.org.sa',
    'العنوان_الوطني': '',
    'السنة_المالية': '2025',
    'رئيس_المجلس': '',
    'نائب_رئيس_المجلس': '',
    'المدير_التنفيذي': '',
    'المدير_المالي': '',
    'أمين_السر': '',
    'عدد_أعضاء_المجلس': '7',
    'مدة_الدورة': '3',
    'موعد_المجلس': 'الأحد الأول من كل شهر',
    'حد_صرف_MD': '50,000 ريال',
    'حد_صرف_مزدوج': '250,000 ريال',
    'البنك': 'بنك الراجحي',
    'IBAN': '',
    'المراجع_الخارجي': '',
    'حد_العروض': '10,000 ريال',
    'رقم_GOSI': '',
    'رقم_ZATCA': '',
  };

  // التبويبات الفرعية
  function openSubPanel(id, btn) {
    document.querySelectorAll('.snav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const el = document.getElementById('sub-' + id);
    if(el) el.classList.add('active');
    if(id === 'editor') buildVarsChipList();
  }

  // تحديث متغير
  function varChanged(input) {
    const key = input.dataset.var;
    if(key) {
      VARS[key] = input.value;
      updatePendingCount();
    }
  }

  function updatePendingCount() {
    const empty = Object.values(VARS).filter(v => !v || v.trim() === '').length;
    const el = document.getElementById('pending-count');
    if(el) el.textContent = empty;
  }

  function saveVarGroup(group) {
    showToast('تم حفظ المتغيرات وتحديث الوثائق المرتبطة ✓');
  }

  function applyVarsToAll() {
    applyVarsToEditor();
    showToast('تم تطبيق المتغيرات على جميع الوثائق (' + Object.keys(VARS).length + ' متغير) ✓');
  }

  function exportVars() {
    let csv = 'المتغير,القيمة\n';
    Object.entries(VARS).forEach(([k,v]) => { csv += '"{{' + k + '}}","' + v + '"\n'; });
    const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'متغيرات_الجمعية.csv'; a.click();
  }

  function addCustomVar() {
    const key = prompt('اسم المتغير (بالعربية بلا مسافات، مثال: رقم_المبنى)');
    if(!key || !key.trim()) return;
    const val = prompt('القيمة الافتراضية (يمكن تركها فارغة)') || '';
    VARS[key.trim()] = val;
    const grid = document.getElementById('vars-custom');
    if(!grid) return;
    const field = document.createElement('div');
    field.className = 'var-field';
    field.innerHTML = `
      <div class="var-field-head"><span class="lbl">${key}</span><span class="tag">{{${key}}}</span></div>
      <input type="text" value="${val}" data-var="${key}" oninput="varChanged(this)" placeholder="القيمة...">
      <div class="var-field-usage">متغير مخصَّص جديد</div>`;
    grid.insertBefore(field, grid.lastElementChild);
    updatePendingCount();
    showToast('تمت إضافة المتغير {{' + key + '}} ✓');
  }

  function showVarPreview() {
    openEditor('r02');
    document.querySelector('.snav-tab:nth-child(3)').click();
  }

  // فلترة اللوائح
  function filterRegs(filter, btn) {
    document.querySelectorAll('.rf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.reg-card').forEach(card => {
      const status = card.dataset.status || '';
      const group = card.dataset.group || '';
      let show = true;
      if(['approved','draft','empty','review'].includes(filter)) show = status === filter;
      else if(filter !== 'all') show = group.includes(filter);
      card.style.display = show ? '' : 'none';
    });
    // إخفاء المجموعات الفارغة
    document.querySelectorAll('.reg-group').forEach(g => {
      const visible = g.querySelectorAll('.reg-card:not([style*="display: none"])').length;
      g.style.display = visible ? '' : 'none';
    });
  }

  // فتح المحرر
  function openEditor(id) {
    // الانتقال لتبويب المحرر
    document.querySelectorAll('.snav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    const editorTab = document.querySelector('.snav-tab:nth-child(3)');
    if(editorTab) editorTab.classList.add('active');
    const editorPanel = document.getElementById('sub-editor');
    if(editorPanel) editorPanel.classList.add('active');

    // بيانات وثيقة نموذجية
    const docs = {
      'r02': { name: 'اللائحة المالية ومصفوفة الصلاحيات', code: 'GOV-02', status: 'draft' },
      'r05': { name: 'لائحة المشتريات والتعاقدات', code: 'GOV-05', status: 'draft' },
      'r08': { name: 'ميثاق مجلس الإدارة', code: 'GOV-08', status: 'draft' },
    };
    const doc = docs[id] || { name: 'وثيقة جديدة', code: id.toUpperCase(), status: 'empty' };

    const titleEl = document.getElementById('editor-title');
    const nameEl = document.getElementById('ed-name');
    const codeEl = document.getElementById('ed-code');
    const statusEl = document.getElementById('ed-status');
    const badgeEl = document.getElementById('editor-status-badge');

    if(titleEl) titleEl.textContent = doc.name;
    if(nameEl) nameEl.value = doc.name;
    if(codeEl) codeEl.value = doc.code;
    if(statusEl) statusEl.value = doc.status;
    if(badgeEl) {
      badgeEl.textContent = { empty:'لم تُضَف', draft:'مسودة', review:'قيد المراجعة', approved:'معتمدة' }[doc.status] || '';
      badgeEl.className = 'et-status ' + doc.status;
    }
    buildVarsChipList();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // بناء قائمة المتغيرات في الشريط الجانبي
  function buildVarsChipList() {
    const list = document.getElementById('vars-chip-list');
    if(!list) return;
    list.innerHTML = Object.entries(VARS).map(([k,v]) =>
      `<div class="var-chip" onclick="insertVar('${k}')" title="اضغط للإدراج">
        <span class="vc-key">{{${k}}}</span>
        <span class="vc-val">${v || '—'}</span>
        <span class="vc-ins">إدراج ←</span>
      </div>`
    ).join('');
  }

  // إدراج متغير في المحرر
  function insertVar(key) {
    const ta = document.getElementById('doc-raw');
    if(!ta) return;
    const tag = '{{' + key + '}}';
    const start = ta.selectionStart, end = ta.selectionEnd;
    ta.value = ta.value.slice(0,start) + tag + ta.value.slice(end);
    ta.selectionStart = ta.selectionEnd = start + tag.length;
    ta.focus();
    showToast('تم إدراج ' + tag);
  }

  // تطبيق المتغيرات على المحرر (معاينة)
  let editorMode = 'raw';
  function applyVarsToEditor() {
    const raw = document.getElementById('doc-raw');
    const preview = document.getElementById('doc-preview');
    if(!raw || !preview) return;
    let text = raw.value;
    Object.entries(VARS).forEach(([k,v]) => {
      const re = new RegExp('\\{\\{' + k + '\\}\\}', 'g');
      text = text.replace(re, v ? `<span class="var-highlight" title="${k}">${v}</span>` : `<span style="background:#f3d4ce;color:#8a3325;padding:1px 4px;border-radius:2px;font-family:JetBrains Mono;font-size:11px">{{${k}}}</span>`);
    });
    // تحويل نص عادي إلى HTML
    const lines = text.split('\n');
    let html = '';
    lines.forEach(line => {
      if(line.trim() === '') { html += '<br>'; return; }
      if(!line.startsWith(' ') && line.endsWith(':')) html += `<h3>${line}</h3>`;
      else if(line.match(/^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً)/)) html += `<h3>${line}</h3>`;
      else html += `<p>${line}</p>`;
    });
    preview.innerHTML = html;
    showToast('تم تطبيق ' + Object.keys(VARS).length + ' متغير ✓');
  }

  function toggleEditorMode() {
    const raw = document.getElementById('doc-raw');
    const preview = document.getElementById('doc-preview');
    const btn = document.querySelector('.ebtn:first-child');
    if(!raw || !preview) return;
    if(editorMode === 'raw') {
      applyVarsToEditor();
      raw.style.display = 'none';
      preview.style.display = 'block';
      editorMode = 'preview';
      if(btn) btn.textContent = '✎ تحرير';
    } else {
      raw.style.display = 'block';
      preview.style.display = 'none';
      editorMode = 'raw';
      if(btn) btn.textContent = '◎ معاينة';
    }
  }

  
  // =========================================================
  //  نظام تصدير PDF
  // =========================================================
  const pdfOpts = { cover:true, content:true, sig:true, stamp:false, header:true, footer:true };
  let currentExportId = null;

  function toggleOpt(el, key) {
    pdfOpts[key] = !pdfOpts[key];
    el.classList.toggle('active', pdfOpts[key]);
  }

  function openPdfModal(docId) {
    currentExportId = docId || null;
    // ملء القيم من المتغيرات
    const orgName = VARS['اسم_الجمعية'] || 'جمعية خيرية';
    const orgLetter = orgName.charAt(0) || 'ج';
    const docTitle = document.getElementById('editor-title')?.textContent || 'وثيقة';
    const docCode = document.getElementById('ed-code')?.value || '';
    const statusMap = { empty:'لم تُضَف', draft:'مسودة', review:'قيد المراجعة', approved:'معتمدة' };
    const status = statusMap[document.getElementById('ed-status')?.value] || 'مسودة';

    const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    set('pdf-org-name', orgName);
    set('pdf-org-letter', orgLetter);
    set('pdf-doc-title', docTitle);
    set('pdf-doc-code', docCode);
    set('pdf-year', VARS['السنة_المالية'] ? VARS['السنة_المالية'] + 'م' : new Date().getFullYear() + 'م');
    const statusEl = document.getElementById('pdf-status');
    if(statusEl) statusEl.value = status;
    set('pdf-preparer', VARS['المدير_التنفيذي'] || '');

    // إعادة شريط التقدم
    const prog = document.getElementById('pdf-progress');
    if(prog) prog.classList.remove('show');
    const btn = document.getElementById('pdf-download-btn');
    if(btn) { btn.disabled = false; btn.textContent = '⬇ تنزيل PDF'; }

    updateCoverPreview();
    document.getElementById('pdf-export-modal').classList.add('show');
  }

  function closePdfModal() {
    document.getElementById('pdf-export-modal').classList.remove('show');
  }

  function updateCoverPreview() {
    const v = id => document.getElementById(id)?.value || '';
    const org = v('pdf-org-name');
    const letter = v('pdf-org-letter') || (org.charAt(0)) || 'ج';
    const title = v('pdf-doc-title');
    const code = v('pdf-doc-code');
    const year = v('pdf-year');
    const status = document.getElementById('pdf-status')?.value || 'مسودة';

    const set = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    set('cp-letter', letter);
    set('cp-org-name', org);
    set('cp-doc-title', title);
    set('cp-doc-code', code);
    set('cp-year', year);
    set('cp-status-badge', status);
    const badge = document.getElementById('cp-status-badge');
    if(badge) badge.style.color = status === 'معتمدة' ? '#3f6b3a' : status === 'قيد المراجعة' ? '#2d5e5a' : '#a8843e';
  }

  function setProgress(pct, msg) {
    const fill = document.getElementById('pdf-progress-fill');
    const msgEl = document.getElementById('pdf-progress-msg');
    const prog = document.getElementById('pdf-progress');
    if(prog) prog.classList.add('show');
    if(fill) fill.style.width = pct + '%';
    if(msgEl) msgEl.textContent = msg;
  }

  // بناء HTML الوثيقة الكاملة
  function buildDocumentHTML(opts) {
    const v = id => document.getElementById(id)?.value || '';
    const orgName = v('pdf-org-name');
    const orgLetter = v('pdf-org-letter') || orgName.charAt(0) || 'ج';
    const docTitle = v('pdf-doc-title');
    const docCode = v('pdf-doc-code');
    const year = v('pdf-year');
    const status = document.getElementById('pdf-status')?.value || 'مسودة';
    const preparer = v('pdf-preparer');
    const approveDate = v('pdf-approve-date');
    const desc = v('pdf-doc-desc');

    // تطبيق المتغيرات على نص الوثيقة
    let rawText = document.getElementById('doc-raw')?.value || '';
    Object.entries(VARS).forEach(([k,val]) => {
      rawText = rawText.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), val || ('{{' + k + '}}'));
    });

    // تحويل النص إلى HTML منسّق
    function textToHtml(text) {
      const lines = text.split('\n');
      let out = '';
      lines.forEach(line => {
        const t = line.trim();
        if(!t) { out += '<br>'; return; }
        if(t.match(/^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً)/) || (t.endsWith(':') && t.length < 60 && !t.startsWith(' '))) {
          out += `<h3>${t}</h3>`;
        } else {
          out += `<p>${t}</p>`;
        }
      });
      return out;
    }

    const now = new Date().toLocaleDateString('ar-SA');

    // صفحة الغلاف
    let coverHTML = '';
    if(opts.cover) {
      coverHTML = `
      <div class="pdf-cover-page">
        <div class="pdf-cover-top-stripe"></div>
        <div class="pdf-cover-body">
          <div class="pdf-cover-watermark">ت</div>
          <div class="pdf-cover-logo-ring">
            <span class="pdf-cover-logo-letter">${orgLetter}</span>
          </div>
          <div class="pdf-cover-org-name">${orgName}</div>
          <div class="pdf-cover-org-sub">${desc || 'منصة تمكين للجمعيات الخيرية'}</div>
          <div class="pdf-cover-separator"></div>
          <div class="pdf-cover-doc-type">وثيقة حوكمة مؤسسية</div>
          <div class="pdf-cover-doc-title">${docTitle}</div>
          <div class="pdf-cover-doc-code">${docCode}</div>
          <div class="pdf-cover-meta-row">
            <div class="pdf-cover-meta-item">
              <div class="pdf-cover-meta-label">الحالة</div>
              <div class="pdf-cover-meta-value">${status}</div>
            </div>
            <div class="pdf-cover-meta-item">
              <div class="pdf-cover-meta-label">السنة</div>
              <div class="pdf-cover-meta-value">${year}</div>
            </div>
            ${approveDate ? `<div class="pdf-cover-meta-item">
              <div class="pdf-cover-meta-label">تاريخ الاعتماد</div>
              <div class="pdf-cover-meta-value">${approveDate}</div>
            </div>` : ''}
          </div>
        </div>
        <div class="pdf-cover-bottom">
          <div class="pdf-cover-bottom-left">© ${year} ${orgName} · جميع الحقوق محفوظة</div>
          <div class="pdf-cover-bottom-right">منصة تمكين</div>
        </div>
        <div class="pdf-cover-bottom-stripe"></div>
      </div>`;
    }

    // ختم الاعتماد
    const stampHTML = (opts.stamp && status === 'معتمدة') ? `
      <div class="pdf-approved-stamp">
        <div class="pdf-approved-stamp-text">معتمدة<br>${approveDate || year}</div>
      </div>` : '';

    // ترويسة وتذييل صفحة المحتوى
    const headerHTML = opts.header ? `
      <div class="pdf-content-header">
        <div class="pdf-content-header-logo">
          <div class="pdf-content-header-letter">${orgLetter}</div>
          <div>
            <div class="pdf-content-header-org">${orgName}</div>
            <div class="pdf-content-header-sub">منصة تمكين للجمعيات الخيرية</div>
          </div>
        </div>
        <div class="pdf-content-header-meta">
          ${docCode}<br>
          ${status}<br>
          ${now}
        </div>
      </div>` : '';

    const footerHTML = opts.footer ? `
      <div class="pdf-content-footer">
        <div class="pdf-content-footer-right">
          <div class="pdf-content-footer-dot"></div>
          <span>${orgName}</span>
          <div class="pdf-content-footer-dot"></div>
          <span>${docCode}</span>
        </div>
        <div>وثيقة سرية للاستخدام الداخلي · منصة تمكين</div>
      </div>` : '';

    // خانات التوقيع
    const sigHTML = opts.sig ? `
      <div class="pdf-content-sig-block">
        <div class="pdf-content-sig-item">
          <div class="pdf-content-sig-line"></div>
          <div class="pdf-content-sig-role">رئيس مجلس الإدارة</div>
          <div class="pdf-content-sig-name">${VARS['رئيس_المجلس'] || '.....................'}</div>
        </div>
        <div class="pdf-content-sig-item">
          <div class="pdf-content-sig-line"></div>
          <div class="pdf-content-sig-role">المدير التنفيذي</div>
          <div class="pdf-content-sig-name">${VARS['المدير_التنفيذي'] || '.....................'}</div>
        </div>
      </div>` : '';

    // صفحة المحتوى
    let contentHTML = '';
    if(opts.content) {
      contentHTML = `
      <div class="pdf-content-page">
        ${stampHTML}
        ${headerHTML}
        <div class="pdf-content-doc-title">${docTitle}</div>
        <div class="pdf-content-doc-code">${docCode} · ${orgName}</div>
        <div class="pdf-content-body">${textToHtml(rawText)}</div>
        ${sigHTML}
        ${footerHTML}
      </div>`;
    }

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{background:#fff;direction:rtl;font-family:'IBM Plex Sans Arabic',sans-serif}
  ${pdf_css_value}
</style>
</head>
<body>
${coverHTML}
${contentHTML}
</body></html>`;
  }

  // الدالة الرئيسية لتوليد PDF
  async function generatePDF() {
    const btn = document.getElementById('pdf-download-btn');
    if(btn) { btn.disabled = true; btn.textContent = '⏳ جاري التوليد...'; }

    try {
      setProgress(10, 'تحضير مكتبة jsPDF...');
      await new Promise(r => setTimeout(r, 150));

      const { jsPDF } = window.jspdf;
      if(!jsPDF) throw new Error('مكتبة jsPDF غير محملة');

      const docTitle = document.getElementById('pdf-doc-title')?.value || 'وثيقة';
      const orgName = document.getElementById('pdf-org-name')?.value || 'جمعية';
      const status = document.getElementById('pdf-status')?.value || 'مسودة';

      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4', compress:true });
      const pageW = 210, pageH = 297;

      setProgress(20, 'بناء محتوى الوثيقة...');

      // ----- صفحة الغلاف بالرسم المباشر -----
      if(pdfOpts.cover) {
        setProgress(30, 'رسم صفحة الغلاف...');

        // الخلفية الداكنة
        pdf.setFillColor(26, 24, 22);
        pdf.rect(0, 0, pageW, pageH, 'F');

        // شريط لوني علوي
        const grad = (x, y, w, h) => {
          pdf.setFillColor(139, 58, 31); pdf.rect(x, y, w/2, h, 'F');
          pdf.setFillColor(168, 132, 62); pdf.rect(x+w/2, y, w/2, h, 'F');
        };
        grad(0, 0, pageW, 10);

        // دائرة الشعار
        const cx = pageW/2, cy = 105;
        pdf.setDrawColor(168, 132, 62); pdf.setLineWidth(0.8);
        pdf.circle(cx, cy, 20, 'S');

        // حرف الجمعية في الدائرة
        const orgLetter = (document.getElementById('pdf-org-letter')?.value || orgName.charAt(0) || 'ج').charAt(0);
        pdf.setTextColor(168, 132, 62);
        pdf.setFont('helvetica','bold'); pdf.setFontSize(22);
        pdf.text(orgLetter, cx, cy + 5, {align:'center'});

        // اسم الجمعية
        pdf.setTextColor(245, 241, 234);
        pdf.setFont('helvetica','bold'); pdf.setFontSize(16);
        const orgLines = pdf.splitTextToSize(orgName, 140);
        pdf.text(orgLines, cx, cy + 38, {align:'center', lineHeightFactor:1.5});

        // الفاصل الذهبي
        pdf.setDrawColor(168, 132, 62); pdf.setLineWidth(0.5);
        pdf.line(cx-25, cy+54, cx+25, cy+54);

        // نوع الوثيقة
        pdf.setTextColor(168, 132, 62); pdf.setFont('helvetica','normal'); pdf.setFontSize(10);
        pdf.text('GOVERNANCE DOCUMENT', cx, cy + 66, {align:'center'});

        // عنوان الوثيقة
        pdf.setTextColor(245, 241, 234); pdf.setFont('helvetica','bold'); pdf.setFontSize(18);
        const titleLines = pdf.splitTextToSize(docTitle, 150);
        pdf.text(titleLines, cx, cy + 82, {align:'center', lineHeightFactor:1.6});

        // الرمز
        const docCode = document.getElementById('pdf-doc-code')?.value || '';
        pdf.setTextColor(168, 132, 62); pdf.setFont('helvetica','normal'); pdf.setFontSize(11);
        pdf.text(docCode, cx, cy + 82 + (titleLines.length * 11) + 8, {align:'center'});

        // بيانات التذييل
        pdf.setFillColor(245, 241, 234, 0.08);
        pdf.setDrawColor(245, 241, 234, 0.1); pdf.setLineWidth(0.3);
        pdf.line(20, pageH - 30, pageW - 20, pageH - 30);

        pdf.setTextColor(150, 140, 130); pdf.setFont('helvetica','normal'); pdf.setFontSize(9);
        const year = document.getElementById('pdf-year')?.value || new Date().getFullYear()+'م';
        pdf.text('© ' + year + ' ' + orgName, 20, pageH - 20);
        pdf.text(status, pageW - 20, pageH - 20, {align:'right'});

        // شريط لوني سفلي
        grad(0, pageH - 8, pageW, 8);

        setProgress(50, 'صفحة الغلاف جاهزة...');
      }

      // ----- صفحة المحتوى -----
      if(pdfOpts.content) {
        pdf.addPage('a4','p');
        setProgress(60, 'تنسيق محتوى الوثيقة...');

        const margin = 18, contentWidth = pageW - margin*2;
        let y = margin;

        // ترويسة
        if(pdfOpts.header) {
          pdf.setFillColor(245, 241, 234);
          pdf.rect(margin, y, contentWidth, 18, 'F');
          pdf.setFillColor(26, 24, 22);
          pdf.rect(margin, y, 12, 18, 'F');
          pdf.setTextColor(245, 241, 234);
          pdf.setFont('helvetica','bold'); pdf.setFontSize(10);
          pdf.text(orgLetter, margin+6, y+12, {align:'center'});
          pdf.setTextColor(26, 24, 22);
          pdf.setFont('helvetica','bold'); pdf.setFontSize(11);
          pdf.text(orgName, margin+16, y+8);
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(107, 98, 89);
          pdf.text('\u0645\u0646\u0635\u0629 \u062a\u0645\u0643\u064a\u0646', margin+16, y+14);
          // جانب أيسر
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(107, 98, 89);
          const docCode2 = document.getElementById('pdf-doc-code')?.value || '';
          pdf.text(docCode2 + ' · ' + status, pageW - margin, y+12, {align:'right'});
          y += 24;
        }

        // ختم اعتماد
        if(pdfOpts.stamp && status === 'معتمدة') {
          pdf.setDrawColor(63, 107, 58); pdf.setLineWidth(0.8);
          pdf.circle(margin + 14, y + 14, 12, 'S');
          pdf.setTextColor(63, 107, 58); pdf.setFont('helvetica','bold'); pdf.setFontSize(7);
          pdf.text('\u0645\u0639\u062a\u0645\u062f\u0629', margin + 14, y + 12, {align:'center'});
          const ad = document.getElementById('pdf-approve-date')?.value || '';
          pdf.setFontSize(6);
          pdf.text(ad || year, margin + 14, y + 16, {align:'center'});
        }

        // عنوان الوثيقة
        pdf.setTextColor(26, 24, 22); pdf.setFont('helvetica','bold'); pdf.setFontSize(20);
        const titleLines2 = pdf.splitTextToSize(docTitle, contentWidth);
        pdf.text(titleLines2, pageW - margin, y, {align:'right'});
        y += titleLines2.length * 9 + 2;

        const docCode3 = document.getElementById('pdf-doc-code')?.value || '';
        pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(139, 58, 31);
        pdf.text(docCode3 + ' · ' + orgName, pageW - margin, y, {align:'right'});
        y += 8;

        // فاصل
        pdf.setDrawColor(220, 211, 192); pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageW - margin, y); y += 8;

        // نص الوثيقة
        setProgress(72, 'معالجة نص الوثيقة...');
        let rawText = document.getElementById('doc-raw')?.value || '';
        Object.entries(VARS).forEach(([k,val]) => {
          rawText = rawText.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), val || '');
        });

        const lines = rawText.split('\n');
        pdf.setFont('helvetica','normal'); pdf.setFontSize(12); pdf.setTextColor(26, 24, 22);

        for(const line of lines) {
          const t = line.trim();
          if(!t) { y += 4; continue; }
          const isH = t.match(/^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً)/) || (t.endsWith(':') && t.length < 60);

          if(isH) {
            if(y > pageH - 50) { pdf.addPage('a4','p'); y = margin + 10; }
            y += 6;
            pdf.setFillColor(245, 241, 234);
            pdf.rect(margin, y-4, contentWidth, 10, 'F');
            pdf.setFont('helvetica','bold'); pdf.setFontSize(13); pdf.setTextColor(26, 24, 22);
            const hl = pdf.splitTextToSize(t, contentWidth - 4);
            pdf.text(hl, pageW - margin - 2, y + 3, {align:'right'});
            y += hl.length * 6 + 6;
          } else {
            pdf.setFont('helvetica','normal'); pdf.setFontSize(11); pdf.setTextColor(45, 41, 37);
            const pl = pdf.splitTextToSize(t, contentWidth);
            if(y + pl.length * 6 > pageH - (pdfOpts.footer ? 24 : 14)) {
              pdf.addPage('a4','p'); y = margin + (pdfOpts.header ? 28 : 10);
            }
            pdf.text(pl, pageW - margin, y, {align:'right', lineHeightFactor:1.7});
            y += pl.length * 7 + 3;
          }
        }

        // خانات التوقيع
        if(pdfOpts.sig) {
          setProgress(84, 'إضافة خانات التوقيع...');
          if(y > pageH - 70) { pdf.addPage('a4','p'); y = margin + 10; }
          y += 16;
          pdf.setDrawColor(200,200,200); pdf.setLineWidth(0.4);
          pdf.line(margin, y, margin+8, y);
          const sigY = y + 5;
          const halfW = (contentWidth - 20) / 2;

          // رئيس المجلس (يمين)
          const sLine1X = pageW - margin - halfW;
          pdf.setLineWidth(0.5); pdf.setDrawColor(26,24,22);
          pdf.line(sLine1X, sigY, pageW - margin, sigY);
          pdf.setFont('helvetica','bold'); pdf.setFontSize(11); pdf.setTextColor(26,24,22);
          pdf.text('\u0631\u0626\u064a\u0633 \u0645\u062c\u0644\u0633 \u0627\u0644\u0625\u062f\u0627\u0631\u0629', pageW - margin - halfW/2, sigY + 6, {align:'center'});
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(107,98,89);
          pdf.text(VARS['\u0631\u0626\u064a\u0633_\u0627\u0644\u0645\u062c\u0644\u0633'] || '...........', pageW - margin - halfW/2, sigY + 11, {align:'center'});

          // المدير التنفيذي (يسار)
          pdf.setLineWidth(0.5); pdf.setDrawColor(26,24,22);
          pdf.line(margin, sigY, margin + halfW, sigY);
          pdf.setFont('helvetica','bold'); pdf.setFontSize(11); pdf.setTextColor(26,24,22);
          pdf.text('\u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a', margin + halfW/2, sigY + 6, {align:'center'});
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(107,98,89);
          pdf.text(VARS['\u0627\u0644\u0645\u062f\u064a\u0631_\u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a'] || '...........', margin + halfW/2, sigY + 11, {align:'center'});
        }

        // تذييل كل الصفحات
        if(pdfOpts.footer) {
          setProgress(92, 'إضافة الترقيم والتذييل...');
          const totalPages = pdf.internal.getNumberOfPages();
          for(let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            if(i === 1 && pdfOpts.cover) continue;
            pdf.setDrawColor(220, 211, 192); pdf.setLineWidth(0.4);
            pdf.line(margin, pageH - 14, pageW - margin, pageH - 14);
            pdf.setFont('helvetica','normal'); pdf.setFontSize(8); pdf.setTextColor(138, 128, 118);
            pdf.text(orgName + ' · ' + docCode3 + ' · \u0648\u062b\u064a\u0642\u0629 \u062f\u0627\u062e\u0644\u064a\u0629', margin, pageH - 9);
            pdf.text('\u0635\u0641\u062d\u0629 ' + i + ' \u0645\u0646 ' + totalPages, pageW - margin, pageH - 9, {align:'right'});
          }
        }
      }

      setProgress(98, 'حفظ الملف...');
      await new Promise(r => setTimeout(r, 200));

      // اسم الملف
      const safeTitle = docTitle.replace(/[^a-zA-Z\u0600-\u06FF\s]/g,'').trim().replace(/\s+/g,'-');
      const safeOrg = orgName.replace(/[^a-zA-Z\u0600-\u06FF]/g,'');
      const fileName = safeOrg + '-' + safeTitle + '.pdf';

      pdf.save(fileName);
      setProgress(100, 'تم التنزيل بنجاح ✓');

      if(btn) { btn.textContent = '✓ تم التنزيل'; btn.style.background = 'var(--good)'; }
      showToast('تم تنزيل "' + fileName + '" بنجاح ✓');

      setTimeout(() => {
        if(btn) { btn.disabled = false; btn.textContent = '⬇ تنزيل PDF'; btn.style.background = ''; }
        const prog = document.getElementById('pdf-progress');
        if(prog) prog.classList.remove('show');
      }, 3500);

    } catch(err) {
      console.error('PDF error:', err);
      setProgress(0, 'خطأ: ' + (err.message || 'فشل التوليد'));
      if(btn) { btn.disabled = false; btn.textContent = '⬇ إعادة المحاولة'; btn.style.background = 'var(--accent)'; }
      showToast('خطأ في توليد PDF: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    }
  }

  // معاينة في نافذة جديدة
  async function previewPdfOnly() {
    showToast('⏳ جاري فتح المعاينة...');
    try {
      const { jsPDF } = window.jspdf;
      if(!jsPDF) throw new Error('المكتبة غير محملة');
      // نفس generatePDF لكن بـ output('bloburl') للمعاينة
      await generatePDF();
    } catch(e) {
      showToast('خطأ في المعاينة');
    }
  }

  // أضف css_value placeholder
  const pdf_css_value = '';

  
  // =========================================================
  //  قاعدة بيانات المهام وحالاتها
  // =========================================================
  const TASK_DB = {};

  function getTask(id) {
    if (!TASK_DB[id]) {
      const card = document.querySelector(`.tcard[data-id="${id}"]`);
      const titleEl = card?.querySelector('.tcard-title');
      const statusEl = card?.querySelector('.status-badge');
      TASK_DB[id] = {
        id,
        title: titleEl?.textContent?.trim() || '',
        status: card?.dataset.status || 'not-started',
        owner: card?.querySelector('.tinfo-card .ti-val')?.textContent?.trim() || '',
        reviewer: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        duration: '',
        cats: Array.from(card?.querySelectorAll('.tpill') || [])
                  .map(p => p.className.match(/cat-(\w+)/)?.[1]).filter(Boolean),
        substeps: Array.from(card?.querySelectorAll('.substep') || []).map((s, i) => ({
          id: i,
          text: s.querySelector('.ss-text')?.textContent?.trim() || '',
          date: s.querySelector('.ss-meta')?.textContent?.trim() || '',
          done: s.querySelector('.ss-check')?.classList.contains('done') || false
        })),
        quickNote: '',
        notes: '',
        blockReason: '',
        requests: [],
        history: []
      };
    }
    return TASK_DB[id];
  }

  let currentTaskId = null;
  let currentRequestType = null;

  // =========================================================
  //  فتح وإغلاق المحرر
  // =========================================================
  function openTaskEditor(event, taskId) {
    event.stopPropagation();
    if (!taskId) return;
    currentTaskId = taskId;
    const task = getTask(taskId);

    // ملء الحقول
    const card = document.querySelector(`.tcard[data-id="${taskId}"]`);
    const taskNum = card?.querySelector('.tcard-id')?.textContent || taskId;

    document.getElementById('tep-task-id').textContent = 'المهمة ' + taskNum;
    document.getElementById('tep-task-title').textContent = task.title;
    document.getElementById('tep-title-input').value = task.title;
    document.getElementById('tep-owner').value = task.owner;
    document.getElementById('tep-reviewer').value = task.reviewer || '';
    document.getElementById('tep-start-date').value = task.startDate || '';
    document.getElementById('tep-end-date').value = task.endDate || '';
    document.getElementById('tep-duration').value = task.duration || '';
    document.getElementById('tep-quick-note').value = task.quickNote || '';
    document.getElementById('tep-notes').value = task.notes || '';
    document.getElementById('tep-block-reason').value = task.blockReason || '';

    const prioEl = document.getElementById('tep-priority');
    if (prioEl) prioEl.value = task.priority || 'medium';

    // الحالة
    document.querySelectorAll('.ss-opt').forEach(b => b.classList.remove('active'));
    const activeStatus = document.querySelector(`.ss-opt[data-status="${task.status}"]`);
    if (activeStatus) activeStatus.classList.add('active');

    // التصنيفات
    document.querySelectorAll('.cat-chip').forEach(c => {
      const cat = c.dataset.cat;
      c.className = 'cat-chip';
      if (task.cats.includes(cat)) c.classList.add('active-' + cat);
    });

    // الخطوات الفرعية
    buildEditableSubsteps(task.substeps);

    // إخفاء نموذج الطلب
    document.getElementById('request-form')?.classList.remove('show');
    document.querySelectorAll('.pr-card').forEach(c => c.classList.remove('selected'));
    currentRequestType = null;

    document.getElementById('task-edit-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeTaskEditor() {
    document.getElementById('task-edit-modal')?.classList.remove('show');
    document.body.style.overflow = '';
    currentTaskId = null;
  }

  // إغلاق بـ Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeTaskEditor();
  });

  // =========================================================
  //  الخطوات الفرعية القابلة للتعديل
  // =========================================================
  function buildEditableSubsteps(substeps) {
    const container = document.getElementById('editable-substeps');
    if (!container) return;
    container.innerHTML = '';
    substeps.forEach((s, i) => renderSubstep(container, s, i));
  }

  function renderSubstep(container, s, idx) {
    const div = document.createElement('div');
    div.className = 'es-item';
    div.dataset.idx = idx;
    div.innerHTML = `
      <div class="es-check ${s.done ? 'done' : ''}" onclick="toggleSubstepCheck(this, ${idx})"></div>
      <span class="es-num">${idx + 1}</span>
      <input class="es-text" type="text" value="${s.text || ''}" placeholder="نص الخطوة..." oninput="updateSubstep(${idx},'text',this.value)">
      <input class="es-date" type="text" value="${s.date || ''}" placeholder="الموعد" oninput="updateSubstep(${idx},'date',this.value)">
      <button class="es-del" onclick="deleteSubstep(${idx})" title="حذف">×</button>`;
    container.appendChild(div);
  }

  function addSubstep() {
    if (!currentTaskId) return;
    const task = getTask(currentTaskId);
    const newStep = { id: task.substeps.length, text: '', date: '', done: false };
    task.substeps.push(newStep);
    const container = document.getElementById('editable-substeps');
    renderSubstep(container, newStep, task.substeps.length - 1);
    container.lastElementChild?.querySelector('.es-text')?.focus();
  }

  function deleteSubstep(idx) {
    if (!currentTaskId) return;
    const task = getTask(currentTaskId);
    task.substeps.splice(idx, 1);
    buildEditableSubsteps(task.substeps);
  }

  function updateSubstep(idx, field, val) {
    if (!currentTaskId) return;
    const task = getTask(currentTaskId);
    if (task.substeps[idx]) task.substeps[idx][field] = val;
  }

  function toggleSubstepCheck(el, idx) {
    if (!currentTaskId) return;
    const task = getTask(currentTaskId);
    el.classList.toggle('done');
    if (task.substeps[idx]) task.substeps[idx].done = el.classList.contains('done');
  }

  // =========================================================
  //  تبديل الـ sections داخل الـ modal
  // =========================================================
  function toggleTepSection(headEl) {
    headEl.closest('.tep-section').classList.toggle('open');
  }

  // =========================================================
  //  تحديد الحالة
  // =========================================================
  function setTaskStatus(status, btn) {
    document.querySelectorAll('.ss-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (currentTaskId) getTask(currentTaskId).status = status;
  }

  // =========================================================
  //  تصنيفات المهمة
  // =========================================================
  function toggleCatChip(chip) {
    const cat = chip.dataset.cat;
    const activeClass = 'active-' + cat;
    if (chip.classList.contains(activeClass)) {
      chip.classList.remove(activeClass);
      if (currentTaskId) {
        const task = getTask(currentTaskId);
        task.cats = task.cats.filter(c => c !== cat);
      }
    } else {
      chip.classList.add(activeClass);
      if (currentTaskId) {
        const task = getTask(currentTaskId);
        if (!task.cats.includes(cat)) task.cats.push(cat);
      }
    }
  }

  // =========================================================
  //  طلبات الخدمة والاستشارة
  // =========================================================
  const requestTitles = {
    platform: 'تفاصيل طلب الخدمة من المنصة',
    consult: 'تفاصيل طلب الاستشارة',
    outsource: 'تفاصيل طلب الإسناد لمزوّد',
    template: 'تفاصيل طلب القالب'
  };

  function selectRequest(type) {
    currentRequestType = type;
    document.querySelectorAll('.pr-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('pr-' + type)?.classList.add('selected');
    const form = document.getElementById('request-form');
    const title = document.getElementById('request-form-title');
    if (form) form.classList.add('show');
    if (title) title.textContent = requestTitles[type] || 'تفاصيل الطلب';
    form?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setReqPriority(btn) {
    document.querySelectorAll('.req-p-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function submitServiceRequest() {
    if (!currentTaskId) return;
    const task = getTask(currentTaskId);
    const desc = document.getElementById('req-description')?.value?.trim();
    if (!desc) { showToast('يرجى وصف ما تحتاجه'); return; }

    const priority = document.querySelector('.req-p-opt.active')?.textContent || 'عادي';
    const contact = document.getElementById('req-contact')?.value || '';
    const reqEntry = {
      type: currentRequestType,
      desc,
      priority,
      contact,
      time: new Date().toLocaleString('ar-SA'),
      status: 'مُرسَل'
    };
    task.requests.push(reqEntry);

    const msgs = {
      platform: '✓ تم إرسال طلب خدمة المنصة — سيظهر في لوحة الطلبات خلال دقائق',
      consult: '✓ تم إرسال طلب الاستشارة — سيتواصل معك متخصّص خلال 24-48 ساعة',
      outsource: '✓ تم إرسال طلب الإسناد — سنرشّح مزوّدين مناسبين خلال يوم عمل',
      template: '✓ تم إرسال طلب القالب — سيُتاح القالب في مكتبة اللوائح'
    };
    showToast(msgs[currentRequestType] || '✓ تم إرسال الطلب بنجاح');

    // إعادة تعيين النموذج
    document.getElementById('req-description').value = '';
    document.getElementById('req-contact').value = '';
    document.getElementById('request-form')?.classList.remove('show');
    document.querySelectorAll('.pr-card').forEach(c => c.classList.remove('selected'));

    addHistoryEntry(currentTaskId, `طلب ${requestTitles[currentRequestType] || 'خدمة'}: "${desc.slice(0,40)}..."`);
  }

  // =========================================================
  //  حفظ التعديلات وتطبيقها على البطاقة
  // =========================================================
  function saveTaskEdits() {
    if (!currentTaskId) return;
    const task = getTask(currentTaskId);

    // تحديث البيانات من الحقول
    task.title = document.getElementById('tep-title-input')?.value || task.title;
    task.owner = document.getElementById('tep-owner')?.value || '';
    task.reviewer = document.getElementById('tep-reviewer')?.value || '';
    task.startDate = document.getElementById('tep-start-date')?.value || '';
    task.endDate = document.getElementById('tep-end-date')?.value || '';
    task.priority = document.getElementById('tep-priority')?.value || 'medium';
    task.duration = document.getElementById('tep-duration')?.value || '';
    task.quickNote = document.getElementById('tep-quick-note')?.value || '';
    task.notes = document.getElementById('tep-notes')?.value || '';
    task.blockReason = document.getElementById('tep-block-reason')?.value || '';

    // الحالة من الـ selector
    const activeStatus = document.querySelector('.ss-opt.active');
    if (activeStatus) task.status = activeStatus.dataset.status;

    // تطبيق التغييرات على البطاقة
    applyTaskToCard(currentTaskId, task);

    addHistoryEntry(currentTaskId, 'تم تحديث بيانات المهمة');
    showToast('✓ تم حفظ تعديلات المهمة');
    closeTaskEditor();
  }

  function applyTaskToCard(id, task) {
    const card = document.querySelector(`.tcard[data-id="${id}"]`);
    if (!card) return;

    // تحديث الحالة
    card.dataset.status = task.status;
    const statusClasses = { done:'done', cancelled:'cancelled' };
    card.classList.toggle('done', task.status === 'done');

    // تحديث عنوان البطاقة
    const titleEl = card.querySelector('.tcard-title');
    if (titleEl && task.title) titleEl.textContent = task.title;

    // تحديث pills الحالة
    const pillsEl = card.querySelector('.tcard-pills');
    if (pillsEl) {
      // إزالة pill الحالة القديمة وإضافة الجديدة
      pillsEl.querySelectorAll('.status-pill').forEach(p => p.remove());
      const statusLabels = {
        'not-started': ['لم تبدأ', 'not-started'],
        'in-progress': ['قيد التنفيذ', 'in-progress'],
        'blocked': ['متوقفة', 'blocked'],
        'done': ['مكتملة', 'done'],
        'cancelled': ['ملغاة', 'cancelled']
      };
      const [label, cls] = statusLabels[task.status] || ['', ''];
      if (label) {
        const pill = document.createElement('button');
        pill.className = `status-badge ${cls} status-pill`;
        pill.textContent = label;
        pill.onclick = (e) => { e.stopPropagation(); openTaskEditor(e, id); };
        pillsEl.prepend(pill);
      }
    }

    // تحديث المسؤول في الـ aside
    const ownerEl = card.querySelector('.tinfo-card .ti-val');
    if (ownerEl && task.owner) ownerEl.textContent = task.owner;

    // تحديث الملاحظة السريعة
    const noteStrip = card.querySelector('.tcard-note-strip');
    if (noteStrip) {
      if (task.quickNote) {
        noteStrip.textContent = task.quickNote;
        noteStrip.classList.add('visible');
        noteStrip.style.display = 'flex';
      } else {
        noteStrip.classList.remove('visible');
        noteStrip.style.display = 'none';
      }
    }

    // تحديث الخطوات الفرعية المرئية
    const substepsEl = card.querySelector('.substeps');
    if (substepsEl && task.substeps.length) {
      substepsEl.innerHTML = task.substeps.map((s, i) => `
        <div class="substep">
          <div class="ss-check ${s.done ? 'done' : ''}"></div>
          <div class="ss-num">${i + 1}</div>
          <div class="ss-text">${s.text}</div>
          <div class="ss-meta">${s.date || ''}</div>
        </div>`).join('');
    }

    // تأثير الحفظ
    card.classList.add('just-saved');
    setTimeout(() => card.classList.remove('just-saved'), 1000);

    // تحديث إحصاء أسبوع التقدم
    updateWeekProgress(card.closest('.week-block-v2'));
  }

  function updateWeekProgress(weekBlock) {
    if (!weekBlock) return;
    const cards = weekBlock.querySelectorAll('.tcard');
    const done = weekBlock.querySelectorAll('.tcard[data-status="done"]').length;
    const total = cards.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const metaEl = weekBlock.querySelector('.week-progress-v2 span:first-child');
    const fillEl = weekBlock.querySelector('.week-progress-bar .fill');
    const pctEl = weekBlock.querySelector('.week-progress-v2 span:last-child');
    if (metaEl) metaEl.textContent = done + '/' + total;
    if (fillEl) fillEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (done === total && total > 0) weekBlock.classList.add('done');
  }

  // =========================================================
  //  سجل التاريخ
  // =========================================================
  function addHistoryEntry(taskId, action) {
    const task = getTask(taskId);
    task.history = task.history || [];
    task.history.unshift({
      action,
      time: new Date().toLocaleString('ar-SA', { hour:'2-digit', minute:'2-digit', hour12:false }),
      date: new Date().toLocaleDateString('ar-SA')
    });
    // تحديث عرض التاريخ
    const histEl = document.getElementById('tep-history');
    if (histEl) {
      histEl.innerHTML = task.history.slice(0, 10).map(h =>
        `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line-soft)">
          <span style="font-family:'JetBrains Mono';font-size:10px;color:var(--muted-soft);min-width:80px">${h.date} · ${h.time}</span>
          <span style="font-size:12px;color:var(--ink-soft)">${h.action}</span>
        </div>`
      ).join('');
    }
  }


  // =========================================================
  //  التعديل المباشر — نسخة مُصلَحة بالكامل
  // =========================================================

  // الفكرة: tcard-head لا يُغلق البطاقة كلياً —
  // الفتح/الإغلاق يتم فقط بالضغط على العنوان أو زر الـ toggle

  function toggleTask(headEl) {
    // headEl هو العنصر الذي ضُغط عليه داخل head
    const card = headEl.closest('.tcard');
    if (!card) return;
    const wasExpanded = card.classList.contains('expanded');
    card.classList.toggle('expanded');
    if (!wasExpanded) {
      // فُتحت للتو — نحقن المحررات
      injectInlineEditors(card);
    }
  }

  // نربط toggle بعد تحميل الصفحة
  document.addEventListener('DOMContentLoaded', () => {
    // ربط الـ click لكل tcard-head — فقط على العنوان والـ toggle
    document.querySelectorAll('.tcard-head').forEach(head => {
      // الـ id والعنوان والـ toggle فقط
      const titleEl = head.querySelector('.tcard-title');
      const idEl    = head.querySelector('.tcard-id');
      const toggleEl= head.querySelector('.tcard-toggle');

      [titleEl, idEl, toggleEl].forEach(el => {
        if (el) el.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTask(el);
        });
      });

      // منع باقي العناصر من الإغلاق
      head.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // كذلك tcard-body يمنع كل propagation
    document.querySelectorAll('.tcard-body').forEach(body => {
      body.addEventListener('click', e => e.stopPropagation());
      body.addEventListener('mousedown', e => e.stopPropagation());
    });

    // طيّ/فتح أسابيع
    setupWeekCollapse();
  });

  function setupWeekCollapse() {
    document.querySelectorAll('.week-head-v2').forEach(head => {
      if (head.dataset.collapseReady) return;
      head.dataset.collapseReady = '1';
      if (!head.querySelector('.week-collapse-ico')) {
        const ico = document.createElement('span');
        ico.className = 'week-collapse-ico';
        ico.textContent = '▼';
        ico.style.cssText = 'font-size:10px;color:var(--muted);transition:transform 0.2s;flex-shrink:0;margin-right:auto';
        head.appendChild(ico);
      }
      head.addEventListener('click', () => {
        const block = head.closest('.week-block-v2');
        block.classList.toggle('collapsed');
        const ico = head.querySelector('.week-collapse-ico');
        if (ico) ico.style.transform = block.classList.contains('collapsed') ? 'rotate(-90deg)' : '';
      });
    });
  }

  // =========================================================
  //  حقن المحررات داخل البطاقة
  // =========================================================
  function injectInlineEditors(card) {
    const body = card.querySelector('.tcard-body');
    if (!body || body.querySelector('.inline-status-bar')) return;

    const id   = card.dataset.id;
    const task = getTask(id);

    // ── 1. شريط الحالة ──
    const statusBar = document.createElement('div');
    statusBar.className = 'inline-status-bar';
    const statuses = [
      ['not-started','لم تبدأ'],
      ['in-progress','قيد التنفيذ'],
      ['blocked','متوقفة'],
      ['done','مكتملة'],
      ['cancelled','ملغاة']
    ];
    statusBar.innerHTML =
      '<span class="isb-lbl">الحالة:</span>' +
      statuses.map(([s,lbl]) =>
        `<button class="isb-opt s-${s}${task.status===s?' active':''}"
          data-status="${s}">${lbl}</button>`
      ).join('');
    // ربط الأحداث بعد الإنشاء (لا inline onclick)
    statusBar.querySelectorAll('.isb-opt').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const s = btn.dataset.status;
        task.status = s;
        statusBar.querySelectorAll('.isb-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        card.dataset.status = s;
        card.classList.toggle('done', s === 'done');
        updateStatusBadgeOnCard(card, s);
        updateWeekProgress(card.closest('.week-block-v2'));
        showToast('الحالة: ' + btn.textContent.trim() + ' ✓');
      });
    });
    body.insertBefore(statusBar, body.firstChild);

    // ── 2. المسؤول والمراجع ──
    const row1 = makeFieldsRow('inline-fields-row', [
      { lbl:'المسؤول', key:'owner', val:task.owner, ph:'المسؤول عن التنفيذ...' },
      { lbl:'المشارك / المراجع', key:'reviewer', val:task.reviewer, ph:'من يراجع التنفيذ...' }
    ], id);
    body.insertBefore(row1, statusBar.nextSibling);

    // ── 3. الأولوية والتواريخ ──
    const prioEl = document.createElement('div');
    prioEl.className = 'inline-fields-row-3';
    prioEl.innerHTML = `
      <div class="inline-field">
        <span class="inline-field-lbl">الأولوية</span>
        <select class="inline-input" style="font-size:12px;cursor:pointer">
          <option value="critical" ${task.priority==='critical'?'selected':''}>🔴 حرجة</option>
          <option value="high"     ${task.priority==='high'?'selected':''}>🟠 عالية</option>
          <option value="medium"   ${task.priority==='medium'||!task.priority?'selected':''}>🟡 متوسطة</option>
          <option value="low"      ${task.priority==='low'?'selected':''}>🟢 منخفضة</option>
        </select>
      </div>
      <div class="inline-field">
        <span class="inline-field-lbl">تاريخ البدء</span>
        <input class="inline-input" type="date" value="${task.startDate||''}">
      </div>
      <div class="inline-field">
        <span class="inline-field-lbl">تاريخ الانتهاء</span>
        <input class="inline-input" type="date" value="${task.endDate||''}">
      </div>`;
    prioEl.querySelector('select').addEventListener('change', e => {
      e.stopPropagation(); task.priority = e.target.value;
    });
    const dates = prioEl.querySelectorAll('input[type=date]');
    dates[0].addEventListener('change', e => { e.stopPropagation(); task.startDate = e.target.value; });
    dates[1].addEventListener('change', e => { e.stopPropagation(); task.endDate = e.target.value; });
    prioEl.addEventListener('click', e => e.stopPropagation());
    body.insertBefore(prioEl, row1.nextSibling);

    // ── 4. الخطوات الفرعية ──
    const existingSubsteps = body.querySelector('.substeps');
    const liveWrap = document.createElement('div');
    liveWrap.className = 'live-substeps';
    liveWrap.dataset.taskId = id;
    if (existingSubsteps) {
      existingSubsteps.parentNode.replaceChild(liveWrap, existingSubsteps);
    } else {
      // إضافة قسم جديد إذا لم يكن هناك خطوات
      const sec = document.createElement('div');
      sec.className = 'tbody-section';
      sec.innerHTML = '<h5>الخطوات الفرعية</h5>';
      sec.appendChild(liveWrap);
      body.querySelector('.tbody-grid > div')?.appendChild(sec);
    }
    renderLiveSubsteps(liveWrap, task.substeps, id);
    liveWrap.addEventListener('click', e => e.stopPropagation());

    // ── 5. منطقة الملاحظة ──
    const noteArea = document.createElement('div');
    noteArea.className = 'live-note-area';
    const noteLabel = document.createElement('div');
    noteLabel.className = 'live-note-label';
    noteLabel.textContent = 'ملاحظة سريعة';
    const noteTA = document.createElement('textarea');
    noteTA.className = 'live-note-input';
    noteTA.rows = 2;
    noteTA.placeholder = 'اكتب ملاحظة تظهر على بطاقة المهمة...';
    noteTA.value = task.quickNote || '';
    noteTA.addEventListener('input', e => {
      e.stopPropagation();
      task.quickNote = e.target.value;
      updateNoteStrip(id, e.target.value);
    });
    noteTA.addEventListener('click', e => e.stopPropagation());
    noteTA.addEventListener('keydown', e => e.stopPropagation());
    noteArea.appendChild(noteLabel);
    noteArea.appendChild(noteTA);
    noteArea.addEventListener('click', e => e.stopPropagation());
    body.appendChild(noteArea);

    // منع propagation من كل الـ body
    body.addEventListener('click', e => e.stopPropagation());
    body.addEventListener('mousedown', e => e.stopPropagation());
    body.addEventListener('keydown', e => e.stopPropagation());
  }

  function makeFieldsRow(cls, fields, taskId) {
    const row = document.createElement('div');
    row.className = cls;
    fields.forEach(({lbl,key,val,ph}) => {
      const wrap = document.createElement('div');
      wrap.className = 'inline-field';
      const label = document.createElement('span');
      label.className = 'inline-field-lbl';
      label.textContent = lbl;
      const input = document.createElement('input');
      input.className = 'inline-input';
      input.type = 'text';
      input.value = val || '';
      input.placeholder = ph || '';
      input.addEventListener('input', e => {
        e.stopPropagation();
        getTask(taskId)[key] = e.target.value;
        if (key === 'owner') {
          const card = document.querySelector(`.tcard[data-id="${taskId}"]`);
          const ownerEl = card?.querySelector('.tinfo-card .ti-val');
          if (ownerEl) ownerEl.textContent = e.target.value;
        }
      });
      input.addEventListener('click', e => e.stopPropagation());
      input.addEventListener('keydown', e => e.stopPropagation());
      wrap.appendChild(label);
      wrap.appendChild(input);
      row.appendChild(wrap);
    });
    row.addEventListener('click', e => e.stopPropagation());
    return row;
  }

  // =========================================================
  //  الخطوات الفرعية
  // =========================================================
  function renderLiveSubsteps(wrap, substeps, taskId) {
    wrap.innerHTML = '';

    substeps.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'lss-item';
      item.dataset.idx = i;

      // drag handle
      const drag = document.createElement('span');
      drag.className = 'lss-drag';
      drag.textContent = '⠿';

      // checkbox
      const chk = document.createElement('div');
      chk.className = 'lss-chk' + (s.done ? ' done' : '');
      chk.addEventListener('click', e => {
        e.stopPropagation();
        s.done = !s.done;
        chk.classList.toggle('done', s.done);
        textInput.classList.toggle('done-text', s.done);
      });

      // text input
      const textInput = document.createElement('input');
      textInput.className = 'lss-text' + (s.done ? ' done-text' : '');
      textInput.type = 'text';
      textInput.value = s.text || '';
      textInput.placeholder = 'نص الخطوة...';
      textInput.addEventListener('input', e => { e.stopPropagation(); s.text = e.target.value; });
      textInput.addEventListener('click', e => e.stopPropagation());
      textInput.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); lssAdd(taskId); }
      });

      // date
      const dateInput = document.createElement('input');
      dateInput.className = 'lss-date';
      dateInput.type = 'text';
      dateInput.value = s.date || '';
      dateInput.placeholder = 'الموعد';
      dateInput.addEventListener('input', e => { e.stopPropagation(); s.date = e.target.value; });
      dateInput.addEventListener('click', e => e.stopPropagation());

      // delete
      const del = document.createElement('button');
      del.className = 'lss-del';
      del.innerHTML = '×';
      del.title = 'حذف';
      del.addEventListener('click', e => {
        e.stopPropagation();
        substeps.splice(i, 1);
        renderLiveSubsteps(wrap, substeps, taskId);
      });

      item.append(drag, chk, textInput, dateInput, del);
      wrap.appendChild(item);
    });

    // زر الإضافة
    const addBtn = document.createElement('button');
    addBtn.className = 'lss-add';
    addBtn.textContent = 'إضافة خطوة فرعية';
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      substeps.push({ text:'', date:'', done:false });
      renderLiveSubsteps(wrap, substeps, taskId);
      const items = wrap.querySelectorAll('.lss-item');
      items[items.length - 1]?.querySelector('.lss-text')?.focus();
    });
    wrap.appendChild(addBtn);
  }

  function lssAdd(taskId) {
    const task = getTask(taskId);
    task.substeps.push({ text:'', date:'', done:false });
    const wrap = document.querySelector(`.live-substeps[data-task-id="${taskId}"]`);
    if (wrap) {
      renderLiveSubsteps(wrap, task.substeps, taskId);
      const items = wrap.querySelectorAll('.lss-item');
      items[items.length - 1]?.querySelector('.lss-text')?.focus();
    }
  }

  // =========================================================
  //  دوال مساعدة
  // =========================================================
  function updateNoteStrip(taskId, val) {
    const card = document.querySelector(`.tcard[data-id="${taskId}"]`);
    const strip = card?.querySelector('.tcard-note-strip');
    if (!strip) return;
    if (val && val.trim()) {
      strip.textContent = val.trim();
      strip.classList.add('visible');
    } else {
      strip.classList.remove('visible');
    }
  }

  function updateStatusBadgeOnCard(card, status) {
    card.querySelectorAll('.status-badge.status-pill').forEach(p => p.remove());
    const lMap = {
      'in-progress':['قيد التنفيذ','in-progress'],
      'blocked':['متوقفة','blocked'],
      'done':['مكتملة','done'],
      'cancelled':['ملغاة','cancelled']
    };
    const [lbl,cls] = lMap[status] || [];
    if (lbl) {
      const pill = document.createElement('span');
      pill.className = `status-badge ${cls} status-pill`;
      pill.textContent = lbl;
      card.querySelector('.tcard-pills')?.prepend(pill);
    }
  }

  function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

    // =========================================================
  //  طيّ/فتح أسابيع بالضغط على العنوان
  // =========================================================
// week collapse setup moved to DOMContentLoaded above

  
  function setAxis(axis, el) {
    document.querySelectorAll('.op-axis-item').forEach(i => i.classList.remove('active'));
    if(el) el.classList.add('active');
    document.querySelectorAll('.op-axis-section').forEach(s => {
      s.style.display = s.dataset.axis === axis ? 'block' : 'none';
    });
    const d = { founding:{ico:'تأ',title:'التأسيس والامتثال — مرتبط بخطة التأسيس',color:'var(--accent)'},
      programs:{ico:'بر',title:'البرامج والخدمات',color:'var(--teal)'},
      resources:{ico:'مو',title:'الموارد والتمويل',color:'var(--gold)'},
      governance:{ico:'حو',title:'الحوكمة والإدارة',color:'var(--olive)'},
      comms:{ico:'تو',title:'التواصل والهوية',color:'var(--ink-soft)'} }[axis] || {};
    const ico=document.getElementById('axis-ico'),title=document.getElementById('axis-title');
    if(ico){ico.textContent=d.ico;ico.style.background=d.color;}
    if(title)title.textContent=d.title;
  }

  function setOpQuarter(q, el) {
    document.querySelectorAll('.op-q').forEach(b => b.classList.remove('active'));
    if(el) el.classList.add('active');
    const kpiSets = {
      1:[{lbl:'منصات حكومية',val:'9',of:'/12',pct:75,color:'var(--teal)',sub:'مستهدف الربع: 12'},
         {lbl:'لوائح مكتملة',val:'5',of:'/8',pct:62,color:'var(--gold)',sub:'3 لوائح متبقية'},
         {lbl:'درجة الحوكمة',val:'71',of:'%',pct:71,color:'var(--accent)',sub:'مستهدف Q1: 70%+ ✓'}],
      2:[{lbl:'مبادرات البرامج',val:'0',of:'/2',pct:0,color:'var(--teal)',sub:'تبدأ هذا الربع'},
         {lbl:'التمويل المُؤمَّن',val:'62',of:'%',pct:62,color:'var(--good)',sub:'هدف Q2: 80%'},
         {lbl:'المستفيدون التجريبيون',val:'0',of:'/50',pct:0,color:'var(--gold)',sub:'إطلاق تجريبي'}],
      3:[{lbl:'المستفيدون المسجَّلون',val:'0',of:'/50',pct:0,color:'var(--teal)',sub:'هدف الربع'},
         {lbl:'الجمعية العمومية',val:'0',of:'/1',pct:0,color:'var(--accent)',sub:'إلزامية'},
         {lbl:'تقرير نصف السنة',val:'0',of:'/1',pct:0,color:'var(--gold)',sub:'للمركز الوطني'}],
      4:[{lbl:'مستفيدو السنة كاملة',val:'0',of:'/100',pct:0,color:'var(--teal)',sub:'هدف السنة'},
         {lbl:'الإيرادات المحقَّقة',val:'0',of:'/380K',pct:0,color:'var(--good)',sub:'من الموازنة'},
         {lbl:'التقرير السنوي الأول',val:'0',of:'/1',pct:0,color:'var(--accent)',sub:'إطلاق علني'}]
    };
    const kpis = kpiSets[q]||kpiSets[1];
    const c=document.getElementById('op-kpis');
    if(c) c.innerHTML=kpis.map(k=>`<div class="op-kpi"><div class="kpi-lbl">${k.lbl}</div><div class="kpi-val">${k.val}<small>${k.of}</small></div><div class="kpi-bar"><div class="kpi-bar-fill" style="width:${k.pct}%;background:${k.color}"></div></div><div class="kpi-sub">${k.sub}</div></div>`).join('');
  }

  function openOpModal() { document.getElementById('op-add-modal')?.classList.add('show'); }
  function closeOpModal() { document.getElementById('op-add-modal')?.classList.remove('show'); }

  function submitOpInit() {
    const title=document.getElementById('op-init-title')?.value?.trim();
    if(!title){showToast('يرجى إدخال عنوان المبادرة');return;}
    const axis=document.getElementById('op-init-axis')?.value||'programs';
    const quarter=document.getElementById('op-init-quarter')?.value||'q1';
    const budget=document.getElementById('op-init-budget')?.value||'0';
    const owner=document.getElementById('op-init-owner')?.value||'';
    const desc=document.getElementById('op-init-desc')?.value||'';
    const kpi=document.getElementById('op-init-kpi')?.value||'';
    const qLabels={q1:'الربع 1',q2:'الربع 2',q3:'الربع 3',q4:'الربع 4'};
    const section=document.querySelector(`.op-axis-section[data-axis="${axis}"]`);
    if(section){
      const div=document.createElement('div');div.className='op-initiative';
      div.innerHTML=`<div class="op-init-head"><div class="op-init-title">${title}</div><div class="op-init-pills"><span class="op-pill ${quarter}">${qLabels[quarter]}</span>${parseInt(budget)>0?`<span class="op-pill budget">${parseInt(budget).toLocaleString('ar')} ر.س</span>`:''}</div></div>${desc?`<div class="op-init-desc">${desc}</div>`:''}<div class="op-init-meta">${owner?`<span class="im">المسؤول: <strong>${owner}</strong></span>`:''} ${kpi?`<span class="im">المؤشر: <strong>${kpi}</strong></span>`:''}<span class="im">الحالة: <strong style="color:var(--muted)">لم تبدأ</strong></span></div>`;
      section.appendChild(div);
      const axItem=document.querySelector(`.op-axis-item[onclick*="${axis}"]`);
      if(axis!==document.getElementById('axis-ico')?.closest('.op-axis-content')?.dataset?.axis) setAxis(axis,axItem);
    }
    closeOpModal();
    showToast('✓ تمت إضافة المبادرة للخطة التشغيلية');
    ['op-init-title','op-init-desc','op-init-budget','op-init-owner','op-init-kpi'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  }

  function saveDocument() {
    showToast('تم حفظ الوثيقة بنجاح ✓');
  }

  function submitForApprovalEditor() {
    const badge = document.getElementById('editor-status-badge');
    if(badge) { badge.textContent = 'قيد المراجعة'; badge.className = 'et-status review'; }
    showToast('تم رفع الوثيقة للاعتماد ✓');
  }

  function submitForApproval(id) { showToast('تم رفع الوثيقة ' + id + ' للاعتماد ✓'); }
  function previewReg(id) { openEditor(id); }

  // Modal إضافة لائحة جديدة
  function openAddRegModal() {
    const modal = document.getElementById('add-reg-modal');
    if(modal) modal.classList.add('show');
  }
  function closeAddRegModal() {
    const modal = document.getElementById('add-reg-modal');
    if(modal) modal.classList.remove('show');
  }
  function submitAddReg() {
    const name = document.getElementById('new-reg-name')?.value;
    if(!name) { alert('يرجى إدخال اسم الوثيقة'); return; }
    showToast('تم إضافة "' + name + '" بنجاح ✓');
    closeAddRegModal();
  }

  // رسالة التوفير المؤقتة
  function showToast(msg) {
    let toast = document.getElementById('save-toast');
    if(!toast) {
      toast = document.createElement('div');
      toast.id = 'save-toast';
      toast.className = 'save-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '✓ ' + msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // تهيئة عند التحميل
  document.addEventListener('DOMContentLoaded', () => {
    updatePendingCount();
    buildVarsChipList();
    // تحديث تعريف goTab لدعم التبويب الجديد
  });

  // ============ Tab switching ============
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(t=>t.addEventListener('click',()=>{
    const target = t.dataset.tab;
    tabs.forEach(x=>x.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('panel-'+target).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }));

  function goTab(name){
    tabs.forEach(x=>x.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    document.querySelector(`[data-tab="${name}"]`).classList.add('active');
    document.getElementById('panel-'+name).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // ============ Task check toggle ============
  document.querySelectorAll('.task-check').forEach(c=>{
    c.addEventListener('click',e=>{
      e.stopPropagation();
      c.classList.toggle('done');
      c.closest('.task').classList.toggle('done');
    });
  });

  // ============ Filter tasks by category ============
  function filterTasks(cat,btn){
    document.querySelectorAll('.fpill').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#panel-plan .tcard').forEach(t=>{
      if(cat==='all' || t.dataset.cat===cat){t.style.display=''}
      else{t.style.display='none'}
    });
    // إخفاء/إظهار بلوكات الأسابيع وفق وجود مهام مرئية
    document.querySelectorAll('#panel-plan .week-block-v2').forEach(wb=>{
      const visibleTasks = Array.from(wb.querySelectorAll('.tcard')).filter(t=>t.style.display!=='none');
      wb.style.display = visibleTasks.length ? '' : 'none';
    });
  }
  
// toggleTask defined above
  
  function toggleCheck(e,checkEl){
    e.stopPropagation();
    checkEl.classList.toggle('done');
    const card = checkEl.closest('.tcard');
    card.classList.toggle('done');
  }
  
  function expandAll(expand){
    document.querySelectorAll('.view-toggle button').forEach(b=>b.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('#panel-plan .tcard').forEach(t=>{
      if(expand) t.classList.add('expanded');
      else t.classList.remove('expanded');
    });
  }

  // ============ Filter partners ============
  function filterPartners(cat,btn){
    document.querySelectorAll('.cat-tab').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.partner-card').forEach(card=>{
      const cats = card.dataset.cat || '';
      if(cat==='all' || cats.includes(cat)){card.style.display=''}
      else{card.style.display='none'}
    });
  }

  // ============ Partner Modal ============
  const partnerSuggestions = {
    'منصة':{
      title:'خدمات المنصة المتاحة',
      intro:'منصة تمكين تُقدّم مجموعة من الأدوات والقوالب الجاهزة التي تتولى تنفيذ هذه المهمة كلياً أو جزئياً، دون الحاجة لإسناد خارجي.',
      partners:[
        {nm:'القوالب والنماذج الجاهزة',ds:'مكتبة قوالب اللوائح، نماذج المحاضر، مصفوفات الصلاحيات، قابلة للتخصيص',cta:'مجاني'},
        {nm:'المعالجات الموجَّهة (Wizards)',ds:'دليل تفاعلي خطوة-بخطوة للتسجيلات الحكومية وفتح الحسابات',cta:'مجاني'},
        {nm:'الأدوات التحليلية',ds:'أداة التقييم الذاتي · لوحة المؤشرات · سجل الإفصاحات · معالج WPS',cta:'مدمج'},
        {nm:'التكامل مع المنصات الحكومية',ds:'ربط API مع إحسان · ZATCA · قوى · مدد لاستيراد البيانات تلقائياً',cta:'متاح'}
      ]
    },
    'حوكمة':{
      title:'شركاء مقترحون · الحوكمة',
      intro:'استشاريون متخصّصون في صياغة اللوائح الداخلية وتشكيل اللجان وتأهيل المجلس وفق قواعد المركز الوطني.',
      partners:[
        {nm:'مكاتب الاستشارات الحوكمية المتخصّصة',ds:'DAL · أثر · مزُن — تجربة في القطاع غير الربحي السعودي',cta:'٤ مرشّحين'},
        {nm:'الذراع الاستشارية في Big-4',ds:'PwC · Deloitte · EY · KPMG — مناسبة للجمعيات الكبرى',cta:'متاح'},
        {nm:'برامج المركز الوطني المجانية',ds:'بناء قدرات الحوكمة عبر منصة المركز',cta:'موصى به'}
      ]
    },
    'محاسبة':{
      title:'شركاء مقترحون · المحاسبة والمراجعة',
      intro:'مكاتب المراجعة المرخَّصة من سوكبا، إضافة إلى مزوّدي البرامج المحاسبية المعتمدة من ZATCA للمرحلة الثانية.',
      partners:[
        {nm:'مكاتب المراجعة الكبرى',ds:'PwC · Deloitte · EY · KPMG · BDO · Crowe',cta:'سنوي'},
        {nm:'مكاتب وطنية متخصّصة',ds:'عبدالله البصيلي · عيسى الرواف · الدار',cta:'متاح'},
        {nm:'برامج محاسبية معتمدة',ds:'قيود · دفترة · أصل · Zoho · Odoo',cta:'تجربة مجانية'}
      ]
    },
    'بنوك':{
      title:'شركاء مقترحون · البنوك والمدفوعات',
      intro:'بنوك تقدّم خدمات متخصّصة للقطاع غير الربحي، تتضمّن حسابات بصلاحية مزدوجة، وأدوات الربط مع منصات إحسان ومدد.',
      partners:[
        {nm:'بنك الراجحي · القطاع غير الربحي',ds:'منصة رقمية مخصّصة للجمعيات والأوقاف والمؤسسات الأهلية',cta:'الأوسع تطوّراً'},
        {nm:'البنك الأهلي السعودي SNB',ds:'وحدة القطاع العام — حسابات الجمعيات والأوقاف',cta:'متاح'},
        {nm:'بنك الرياض · الإنماء · البلاد',ds:'خدمات للقطاع غير الربحي مع ربط ZATCA ومدد',cta:'متاح'}
      ]
    },
    'قانوني':{
      title:'شركاء مقترحون · الاستشارات القانونية',
      intro:'مكاتب قانونية تُقدِّم خدمات متخصّصة للقطاع الأهلي، خصوصاً في صياغة اللوائح وتوثيق الأوقاف وعقود الشراكات.',
      partners:[
        {nm:'مكتب الفقيه · Khoshaim · الزامل',ds:'مكاتب راسخة في القطاع غير الربحي',cta:'٣ مرشّحين'},
        {nm:'عبدالعزيز القاسم · شورى',ds:'متخصّصون في القانون الأهلي والشريعة',cta:'متاح'},
        {nm:'مستشارون قانونيون مستقلون',ds:'عقود إطار شهرية بتكلفة مناسبة للجمعيات الناشئة',cta:'مرن'}
      ]
    },
    'تقنية':{
      title:'شركاء مقترحون · التقنية والأنظمة',
      intro:'أنظمة CRM وERP متخصّصة في إدارة الجمعيات، إضافة إلى برامج الفوترة الإلكترونية المعتمدة من ZATCA.',
      partners:[
        {nm:'أنظمة سعودية متخصّصة',ds:'خير · رافد · RESOOS ERP · لوتس برو · مداد ERP',cta:'٥ مرشّحين'},
        {nm:'برامج محاسبية سحابية',ds:'قيود · دفترة · أصل · Zoho NonProfit',cta:'تجربة مجانية'},
        {nm:'حلول مؤسسية',ds:'Microsoft Dynamics 365 · SAP · Oracle NetSuite',cta:'للجمعيات الكبرى'}
      ]
    },
    'حماية البيانات':{
      title:'شركاء مقترحون · حماية البيانات الشخصية',
      intro:'مكاتب متخصّصة في تقييم أثر حماية البيانات وفق نظام PDPL السعودي وتعيين مسؤول حماية البيانات (DPO).',
      partners:[
        {nm:'مكاتب الأمن السيبراني المرخّصة من NCA',ds:'تقييم PDPL، DPO خارجي، اختبار اختراق',cta:'٣ مرشّحين'},
        {nm:'PwC Cyber · Deloitte Cyber Risk',ds:'منهجية معتمدة للقطاع غير الربحي',cta:'متاح'},
        {nm:'OneTrust · TrustArc',ds:'منصات إدارة الامتثال لحماية البيانات',cta:'اشتراك سنوي'}
      ]
    },
    'موارد بشرية':{
      title:'شركاء مقترحون · الموارد البشرية',
      intro:'شركات إسناد متخصّصة في إدارة الرواتب وWPS والاستقدام والامتثال لنظام العمل ونطاقات والتأمينات.',
      partners:[
        {nm:'شركات الإسناد الكبرى',ds:'TASC · PMS · Penny · Smart HR',cta:'متاح'},
        {nm:'أنظمة الموارد البشرية',ds:'ZenHR · Bayzat · Jisr · GoHR',cta:'اشتراك سنوي'},
        {nm:'استشاريو نظام العمل',ds:'تحديث لائحة تنظيم العمل، تطبيق التعديلات الجديدة',cta:'عرضي'}
      ]
    },
    'مراجعة':{
      title:'شركاء مقترحون · المراجعة الخارجية',
      intro:'مكاتب مراجعة مرخّصة من الهيئة السعودية للمراجعين والمحاسبين (سوكبا)، يتم ترشيحها من لجنة المراجعة واعتمادها من الجمعية العمومية.',
      partners:[
        {nm:'Big-4',ds:'PwC · Deloitte · EY · KPMG — للجمعيات الكبرى ومتلقّية المنح الدولية',cta:'٤ مرشّحين'},
        {nm:'الصف الثاني',ds:'BDO · Crowe · PKF · RSM Albazie — توازن جودة وتكلفة',cta:'موصى به'},
        {nm:'مكاتب وطنية',ds:'عبدالله البصيلي · عيسى الرواف · الدار',cta:'تكلفة منافسة'}
      ]
    },
    'برامج':{
      title:'شركاء مقترحون · قياس الأثر',
      intro:'استشاريون في صياغة نظرية التغيير ومنهجيات قياس الأثر الاجتماعي، أبرزهم برنامج "ممارس الأثر" من مؤسسة الملك خالد.',
      partners:[
        {nm:'مؤسسة الملك خالد · IMPACT Pro',ds:'ممارسون مؤهَّلون في قياس الأثر — معتمد محلياً',cta:'موصى به'},
        {nm:'GIIN · IRIS+ Practitioners',ds:'إطار IRIS+ للاستثمار ذي الأثر',cta:'متاح'},
        {nm:'مستشارو SROI',ds:'حساب العائد الاجتماعي على الاستثمار',cta:'متخصّص'}
      ]
    },
    'تسويق':{
      title:'شركاء مقترحون · التسويق والهوية',
      intro:'وكالات إبداعية متخصّصة في القطاع غير الربحي السعودي، لبناء الهوية والموقع وقنوات التواصل وحملات جمع التبرعات.',
      partners:[
        {nm:'وكالات إبداعية متخصّصة في NPO',ds:'تجربة في حملات جمع التبرعات الرقمية',cta:'٤ مرشّحين'},
        {nm:'مسرّعات Misk Hub',ds:'برامج تسويقية مخفّضة للجمعيات الناشئة',cta:'مدعوم'},
        {nm:'مستقلّون من Bahr',ds:'حلول مرنة للهوية البصرية والمحتوى',cta:'مرن'}
      ]
    }
  };

  function openPartnerModal(cat){
    const data = partnerSuggestions[cat] || partnerSuggestions['حوكمة'];
    document.getElementById('modalTitle').innerText = data.title;
    let html = `<h4>السياق</h4><p>${data.intro}</p><h4>المرشّحون</h4><div class="modal-partners-list">`;
    data.partners.forEach(p=>{
      html += `<div class="mp-item"><div class="mp-info"><div class="nm">${p.nm}</div><div class="ds">${p.ds}</div></div><span class="mp-cta">${p.cta} ←</span></div>`;
    });
    html += `</div><h4>الخطوات التالية</h4><p>اطلب من ٣ مرشّحين عروض RFP، قارن وفق معايير المنصة الرباعية: التأهيل النظامي، الخبرة في القطاع غير الربحي، التوافق مع متطلبات المركز، التوثيق ثنائي اللغة.</p>`;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('partnerModal').classList.add('show');
  }

  function closeModal(){
    document.getElementById('partnerModal').classList.remove('show');
  }

  document.getElementById('partnerModal').addEventListener('click',e=>{
    if(e.target.id==='partnerModal') closeModal();
  });

  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal();});
