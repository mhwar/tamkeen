

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
  //  نظام تصدير PDF — مبسَّط بخلفية بيضاء + رفع شعار/غلاف
  // =========================================================
  const pdfState = { logoDataUrl: null, coverDataUrl: null };
  let currentExportId = null;

  function openPdfModal(docId) {
    currentExportId = docId || null;
    const orgName = VARS['اسم_الجمعية'] || 'جمعية خيرية';
    const docTitle = document.getElementById('editor-title')?.textContent || 'وثيقة';
    const docCode = document.getElementById('ed-code')?.value || '';
    const statusMap = { empty:'لم تُضَف', draft:'مسودة', review:'قيد المراجعة', approved:'معتمدة' };
    const status = statusMap[document.getElementById('ed-status')?.value] || 'مسودة';

    const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    set('pdf-org-name', orgName);
    set('pdf-doc-title', docTitle);
    set('pdf-doc-code', docCode);
    set('pdf-year', VARS['السنة_المالية'] ? VARS['السنة_المالية'] + 'م' : new Date().getFullYear() + 'م');
    const statusEl = document.getElementById('pdf-status');
    if(statusEl) statusEl.value = status;

    // إعادة شريط التقدم
    const prog = document.getElementById('pdf-progress');
    if(prog) prog.classList.remove('show');
    const btn = document.getElementById('pdf-download-btn');
    if(btn) { btn.disabled = false; btn.textContent = '⬇ تنزيل PDF'; btn.style.background=''; }

    updateCoverPreview();
    document.getElementById('pdf-export-modal').classList.add('show');
  }

  function closePdfModal() {
    document.getElementById('pdf-export-modal').classList.remove('show');
  }

  // ---- رفع الشعار ----
  function handleLogoUpload(ev) {
    const file = ev.target.files && ev.target.files[0];
    if(!file) return;
    if(file.size > 4*1024*1024) { showToast('حجم الشعار كبير — الحد الأقصى 4 ميجا'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      pdfState.logoDataUrl = e.target.result;
      const img = document.getElementById('cp-logo-img');
      if(img){ img.src = pdfState.logoDataUrl; img.style.display='block'; }
      const card = document.getElementById('logo-upload-card');
      const clear = document.getElementById('logo-clear-btn');
      const title = document.getElementById('logo-upload-title');
      const sub = document.getElementById('logo-upload-sub');
      if(card) card.classList.add('has-file');
      if(clear) clear.style.display='block';
      if(title) title.textContent = 'تم رفع الشعار ✓';
      if(sub) sub.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  function clearLogoUpload(ev) {
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    pdfState.logoDataUrl = null;
    const img = document.getElementById('cp-logo-img');
    if(img){ img.style.display='none'; img.src=''; }
    const card = document.getElementById('logo-upload-card');
    const clear = document.getElementById('logo-clear-btn');
    const title = document.getElementById('logo-upload-title');
    const sub = document.getElementById('logo-upload-sub');
    const input = document.getElementById('pdf-logo-file');
    if(card) card.classList.remove('has-file');
    if(clear) clear.style.display='none';
    if(title) title.textContent = 'رفع شعار الجهة';
    if(sub) sub.textContent = 'PNG / JPG / SVG — مربّع شفاف يفضّل';
    if(input) input.value='';
  }

  // ---- رفع غلاف مخصّص ----
  function handleCoverUpload(ev) {
    const file = ev.target.files && ev.target.files[0];
    if(!file) return;
    if(file.size > 8*1024*1024) { showToast('حجم الغلاف كبير — الحد الأقصى 8 ميجا'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      pdfState.coverDataUrl = e.target.result;
      const img = document.getElementById('cp-custom-img');
      const def = document.getElementById('cp-default-cover');
      if(img && def){ img.src = pdfState.coverDataUrl; img.style.display='block'; def.style.display='none'; }
      const card = document.getElementById('cover-upload-card');
      const clear = document.getElementById('cover-clear-btn');
      const title = document.getElementById('cover-upload-title');
      const sub = document.getElementById('cover-upload-sub');
      if(card) card.classList.add('has-file');
      if(clear) clear.style.display='block';
      if(title) title.textContent = 'تم رفع الغلاف ✓';
      if(sub) sub.textContent = file.name + ' — سيُستخدم بدل الغلاف الافتراضي';
    };
    reader.readAsDataURL(file);
  }

  function clearCoverUpload(ev) {
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    pdfState.coverDataUrl = null;
    const img = document.getElementById('cp-custom-img');
    const def = document.getElementById('cp-default-cover');
    if(img && def){ img.style.display='none'; img.src=''; def.style.display='flex'; }
    const card = document.getElementById('cover-upload-card');
    const clear = document.getElementById('cover-clear-btn');
    const title = document.getElementById('cover-upload-title');
    const sub = document.getElementById('cover-upload-sub');
    const input = document.getElementById('pdf-cover-file');
    if(card) card.classList.remove('has-file');
    if(clear) clear.style.display='none';
    if(title) title.textContent = 'رفع صورة غلاف كاملة';
    if(sub) sub.textContent = 'صورة A4 عمودية 794×1123 بكسل · PNG / JPG';
    if(input) input.value='';
  }

  // ---- تحديث المعاينة الحيّة ----
  function updateCoverPreview() {
    const v = id => document.getElementById(id)?.value || '';
    const org = v('pdf-org-name');
    const title = v('pdf-doc-title');
    const code = v('pdf-doc-code');
    const year = v('pdf-year');
    const status = document.getElementById('pdf-status')?.value || 'مسودة';

    const set = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    set('cp-org-name', org);
    set('cp-doc-title', title);
    set('cp-doc-code', code);
    set('cp-year', year);
    set('cp-status-badge', status);
    const badge = document.getElementById('cp-status-badge');
    if(badge) badge.style.color = status === 'معتمدة' ? 'var(--good)' : status === 'قيد المراجعة' ? 'var(--teal)' : 'var(--gold)';
  }

  function setProgress(pct, msg) {
    const fill = document.getElementById('pdf-progress-fill');
    const msgEl = document.getElementById('pdf-progress-msg');
    const prog = document.getElementById('pdf-progress');
    if(prog) prog.classList.add('show');
    if(fill) fill.style.width = pct + '%';
    if(msgEl) msgEl.textContent = msg;
  }

  // ---- تحويل النص الخام إلى HTML منسّق مع تطبيق المتغيرات ----
  // ---- إعدادات الهوامش (mm) ----
  const MARGIN_PRESETS = {
    narrow: { class: 'm-narrow', topPx: 48, sidePx: 50, bottomPx: 48 },
    normal: { class: 'm-normal', topPx: 70, sidePx: 72, bottomPx: 70 },
    wide:   { class: 'm-wide',   topPx: 96, sidePx: 100, bottomPx: 96 },
  };
  const A4_W_PX = 794;
  const A4_H_PX = 1123;

  // ---- تحويل النص الخام إلى مصفوفة عناصر (لتعبئة الصفحات) ----
  function buildContentBlocks() {
    let rawText = document.getElementById('doc-raw')?.value || '';
    Object.entries(VARS).forEach(([k,val]) => {
      rawText = rawText.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), val || ('{{' + k + '}}'));
    });
    const lines = rawText.split('\n');
    const blocks = [];
    lines.forEach(line => {
      const t = line.trim();
      if(!t){ const sp = document.createElement('div'); sp.style.height='10px'; blocks.push(sp); return; }
      const isHead = /^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً)/.test(t)
        || (t.endsWith(':') && t.length < 65);
      if(isHead){
        const h = document.createElement('h3'); h.className = 'pdoc-h'; h.textContent = t; blocks.push(h);
      } else {
        const p = document.createElement('p'); p.className = 'pdoc-p'; p.textContent = t; blocks.push(p);
      }
    });
    if(!blocks.length){
      const p = document.createElement('p'); p.className = 'pdoc-p';
      p.style.color = '#999';
      p.textContent = 'لا يوجد محتوى. اكتب نص الوثيقة في المحرر أولاً.';
      blocks.push(p);
    }
    return blocks;
  }

  // ---- بناء صفحة الغلاف كـ DOM ----
  function buildCoverNode() {
    const v = id => document.getElementById(id)?.value || '';
    const orgName = v('pdf-org-name') || 'الجهة';
    const docTitle = v('pdf-doc-title') || 'وثيقة';
    const docCode = v('pdf-doc-code') || '';
    const year = v('pdf-year') || (new Date().getFullYear()+'م');
    const status = document.getElementById('pdf-status')?.value || 'مسودة';
    const approveDate = v('pdf-approve-date');

    const wrap = document.createElement('div');
    wrap.className = 'pdf-cover-page';

    if(pdfState.coverDataUrl){
      wrap.classList.add('pdf-cover-custom');
      wrap.innerHTML = `<img src="${pdfState.coverDataUrl}" alt="">`;
      return wrap;
    }

    // الشعار: إذا كان هناك صورة نعرضها، وإلا نخفي القسم تماماً
    const logoArea = pdfState.logoDataUrl
      ? `<div class="pdf-cover-logo-area"><img class="pdf-cover-logo-img" src="${pdfState.logoDataUrl}" alt=""></div>`
      : '';

    wrap.innerHTML = `
      <div class="pdf-cover-top-stripe"></div>
      <div class="pdf-cover-body">
        ${logoArea}
        <div class="pdf-cover-org-name">${escapeHtml(orgName)}</div>
        <div class="pdf-cover-org-sub">منصة تمكين للجمعيات الخيرية السعودية</div>
        <div class="pdf-cover-separator"></div>
        <div class="pdf-cover-doc-type">وثيقة حوكمة مؤسسية</div>
        <div class="pdf-cover-doc-title">${escapeHtml(docTitle)}</div>
        ${docCode ? `<div class="pdf-cover-doc-code-wrap"><span class="pdf-cover-doc-code">${escapeHtml(docCode)}</span></div>` : ''}
        <div class="pdf-cover-meta-row">
          <div class="pdf-cover-meta-item">
            <div class="pdf-cover-meta-label">الحالة</div>
            <div class="pdf-cover-meta-value">${escapeHtml(status)}</div>
          </div>
          <div class="pdf-cover-meta-item">
            <div class="pdf-cover-meta-label">السنة</div>
            <div class="pdf-cover-meta-value">${escapeHtml(year)}</div>
          </div>
          ${approveDate ? `<div class="pdf-cover-meta-item">
            <div class="pdf-cover-meta-label">تاريخ الاعتماد</div>
            <div class="pdf-cover-meta-value">${escapeHtml(approveDate)}</div>
          </div>` : ''}
        </div>
      </div>
      <div class="pdf-cover-bottom">
        <div class="pdf-cover-bottom-left">© ${escapeHtml(year)} ${escapeHtml(orgName)} — جميع الحقوق محفوظة</div>
        <div class="pdf-cover-bottom-right">منصة تمكين</div>
      </div>
      <div class="pdf-cover-bottom-stripe"></div>`;
    return wrap;
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // ---- بناء ترويسة الصفحة ----
  function buildHeaderNode(opts){
    if(!opts.pages) return null;
    const v = id => document.getElementById(id)?.value || '';
    const orgName = v('pdf-org-name') || 'الجهة';
    const docCode = v('pdf-doc-code') || '';
    const status = document.getElementById('pdf-status')?.value || 'مسودة';
    const logoHtml = pdfState.logoDataUrl
      ? `<img src="${pdfState.logoDataUrl}" style="width:36px;height:36px;object-fit:contain">`
      : '';
    const node = document.createElement('div');
    node.className = 'pdf-content-header';
    node.innerHTML = `
      <div class="pdf-content-header-logo">
        ${logoHtml}
        <div>
          <div class="pdf-content-header-org">${escapeHtml(orgName)}</div>
          <div class="pdf-content-header-sub">منصة تمكين</div>
        </div>
      </div>
      <div class="pdf-content-header-meta">${escapeHtml(docCode)}<br>${escapeHtml(status)}</div>`;
    return node;
  }

  // ---- بناء كتلة عنوان الوثيقة ----
  function buildTitleBlock(){
    const v = id => document.getElementById(id)?.value || '';
    const orgName = v('pdf-org-name') || '';
    const docTitle = v('pdf-doc-title') || 'وثيقة';
    const docCode = v('pdf-doc-code') || '';
    const node = document.createElement('div');
    node.innerHTML = `
      <div class="pdf-content-doc-title">${escapeHtml(docTitle)}</div>
      <div class="pdf-content-doc-code">${escapeHtml(docCode)}${docCode && orgName ? ' · ' : ''}${escapeHtml(orgName)}</div>`;
    return node;
  }

  // ---- بناء كتلة التوقيعات ----
  function buildSigBlock(){
    const node = document.createElement('div');
    node.style.cssText = 'display:flex;gap:60px;justify-content:space-between;margin-top:auto;padding-top:30px;border-top:1px dashed #ccc';
    node.innerHTML = `
      <div style="text-align:center;flex:1">
        <div style="height:1px;background:#1a1816;margin-bottom:10px"></div>
        <div style="font-family:Tajawal,sans-serif;font-weight:700;font-size:13px;color:#1a1816">رئيس مجلس الإدارة</div>
        <div style="font-size:12px;color:#6b6259;margin-top:4px">${escapeHtml(VARS['رئيس_المجلس'] || '...........................')}</div>
      </div>
      <div style="text-align:center;flex:1">
        <div style="height:1px;background:#1a1816;margin-bottom:10px"></div>
        <div style="font-family:Tajawal,sans-serif;font-weight:700;font-size:13px;color:#1a1816">المدير التنفيذي</div>
        <div style="font-size:12px;color:#6b6259;margin-top:4px">${escapeHtml(VARS['المدير_التنفيذي'] || '...........................')}</div>
      </div>`;
    return node;
  }

  // ---- إنشاء صفحة محتوى فارغة ----
  function createEmptyContentPage(opts){
    const page = document.createElement('div');
    page.className = 'pdf-content-page ' + (MARGIN_PRESETS[opts.margin] || MARGIN_PRESETS.normal).class;
    page.style.height = A4_H_PX + 'px';
    return page;
  }

  // ---- توزيع المحتوى على عدة صفحات بدون قصّ ----
  function paginateContent(opts) {
    const zone = document.getElementById('pdf-render-zone');
    const margin = MARGIN_PRESETS[opts.margin] || MARGIN_PRESETS.normal;
    const usableH = A4_H_PX - margin.topPx - margin.bottomPx;

    const blocks = buildContentBlocks();
    const sigBlock = opts.sig ? buildSigBlock() : null;
    const pages = [];

    let current = createEmptyContentPage(opts);
    let header = buildHeaderNode(opts);
    if(header) current.appendChild(header.cloneNode(true));
    current.appendChild(buildTitleBlock());
    zone.appendChild(current);

    function startNewPage(){
      pages.push(current);
      current = createEmptyContentPage(opts);
      if(header) current.appendChild(header.cloneNode(true));
      zone.appendChild(current);
    }

    for(const block of blocks){
      current.appendChild(block);
      // قياس فعلي بعد الإلحاق
      if(current.scrollHeight > A4_H_PX + 4){
        // الكتلة لا تتسع — انقلها لصفحة جديدة
        current.removeChild(block);
        // إذا كانت الصفحة الحالية شبه فارغة (فقط ترويسة + عنوان) ولا تتسع للكتلة، اقبل الفائض (كتلة كبيرة جداً)
        if(current.children.length <= (header ? 2 : 1)){
          current.appendChild(block);
          startNewPage();
        } else {
          startNewPage();
          current.appendChild(block);
        }
      }
    }

    // كتلة التوقيعات في آخر صفحة
    if(sigBlock){
      current.appendChild(sigBlock);
      if(current.scrollHeight > A4_H_PX + 4){
        current.removeChild(sigBlock);
        startNewPage();
        // ادفع للأسفل بإضافة spacer flex
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        current.appendChild(spacer);
        current.appendChild(sigBlock);
      }
    }

    pages.push(current);
    return pages;
  }

  // ---- التوليد الفعلي عبر html2canvas + jsPDF ----
  async function generatePDF() {
    const btn = document.getElementById('pdf-download-btn');
    if(btn){ btn.disabled = true; btn.textContent = '⏳ جاري التوليد...'; btn.style.background=''; }

    try {
      if(typeof html2canvas === 'undefined') throw new Error('مكتبة html2canvas غير محملة');
      const { jsPDF } = window.jspdf || {};
      if(!jsPDF) throw new Error('مكتبة jsPDF غير محملة');

      setProgress(8, 'تحميل الخطوط...');
      // مهم جداً للعربية: انتظر تحميل الخطوط قبل الرسم
      if(document.fonts && document.fonts.ready){
        await document.fonts.ready;
      }
      // حمّل الخطوط الفعلية المستخدمة لضمان توفرها
      try {
        await Promise.all([
          document.fonts.load('700 16px "Tajawal"'),
          document.fonts.load('800 16px "Tajawal"'),
          document.fonts.load('400 14px "IBM Plex Sans Arabic"'),
          document.fonts.load('600 14px "IBM Plex Sans Arabic"'),
        ]);
      } catch(_){}

      const opts = {
        sig: !!document.getElementById('opt-sig')?.checked,
        pages: !!document.getElementById('opt-pages')?.checked,
        margin: document.querySelector('input[name="pdf-margin"]:checked')?.value || 'normal',
      };

      setProgress(15, 'تحضير منطقة الرسم...');
      const zone = document.getElementById('pdf-render-zone');
      if(!zone) throw new Error('منطقة الرسم غير موجودة');
      zone.innerHTML = '';

      // ابني الغلاف
      const coverNode = buildCoverNode();
      zone.appendChild(coverNode);

      // ابني صفحات المحتوى
      const contentPages = paginateContent(opts);

      // انتظر تحميل كل الصور
      await waitForImages(zone);
      // مهلة قصيرة لإعطاء المتصفح فرصة لتطبيق الخطوط
      await new Promise(r => setTimeout(r, 120));

      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4', compress:true });
      const pageW_mm = 210, pageH_mm = 297;

      // ---- الغلاف ----
      setProgress(30, 'رسم صفحة الغلاف...');
      const coverCanvas = await html2canvas(coverNode, {
        scale: 2, backgroundColor:'#ffffff', useCORS:true, logging:false,
        width: A4_W_PX, height: A4_H_PX, windowWidth: A4_W_PX, windowHeight: A4_H_PX
      });
      pdf.addImage(coverCanvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, pageW_mm, pageH_mm, undefined, 'FAST');

      // ---- صفحات المحتوى ----
      const totalContent = contentPages.length;
      for(let i = 0; i < totalContent; i++){
        setProgress(45 + (i/totalContent)*40, `رسم صفحة المحتوى ${i+1} / ${totalContent}...`);
        const canvas = await html2canvas(contentPages[i], {
          scale: 2, backgroundColor:'#ffffff', useCORS:true, logging:false,
          width: A4_W_PX, height: A4_H_PX, windowWidth: A4_W_PX, windowHeight: A4_H_PX
        });
        pdf.addPage('a4','p');
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, pageW_mm, pageH_mm, undefined, 'FAST');
      }

      // ---- ترقيم الصفحات (في الأسفل وسط الصفحة) ----
      if(opts.pages){
        const totalPages = pdf.internal.getNumberOfPages();
        for(let i = 2; i <= totalPages; i++){
          pdf.setPage(i);
          pdf.setDrawColor(220, 211, 192);
          pdf.setLineWidth(0.3);
          pdf.line(15, pageH_mm - 12, pageW_mm - 15, pageH_mm - 12);
          pdf.setFont('helvetica','normal');
          pdf.setFontSize(8);
          pdf.setTextColor(138, 128, 118);
          pdf.text((i-1) + ' / ' + (totalPages-1), pageW_mm/2, pageH_mm - 7, {align:'center'});
        }
      }

      setProgress(95, 'حفظ الملف...');
      const orgName = document.getElementById('pdf-org-name')?.value || 'document';
      const docTitle = document.getElementById('pdf-doc-title')?.value || 'doc';
      const safe = s => s.replace(/[^a-zA-Z؀-ۿ\s\-_]/g,'').trim().replace(/\s+/g,'-');
      const fileName = `${safe(orgName)}-${safe(docTitle)}.pdf`;

      pdf.save(fileName);
      setProgress(100, 'تم التنزيل بنجاح ✓');

      zone.innerHTML = '';

      if(btn){ btn.textContent = '✓ تم التنزيل'; btn.style.background = 'var(--good)'; }
      showToast('تم تنزيل "' + fileName + '"');

      setTimeout(() => {
        if(btn){ btn.disabled = false; btn.textContent = '⬇ تنزيل PDF'; btn.style.background=''; }
        const prog = document.getElementById('pdf-progress');
        if(prog) prog.classList.remove('show');
      }, 3500);

    } catch(err){
      console.error('PDF error:', err);
      setProgress(0, 'خطأ: ' + (err.message || 'فشل التوليد'));
      if(btn){ btn.disabled = false; btn.textContent = '⬇ إعادة المحاولة'; btn.style.background = 'var(--accent)'; }
      showToast('خطأ في توليد PDF: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    }
  }

  // مساعد — انتظر تحميل كل <img> داخل عقدة
  function waitForImages(node){
    const imgs = Array.from(node.querySelectorAll('img'));
    if(!imgs.length) return Promise.resolve();
    return Promise.all(imgs.map(img => {
      if(img.complete && img.naturalWidth) return Promise.resolve();
      return new Promise(res => {
        img.onload = () => res();
        img.onerror = () => res();
        setTimeout(res, 3000);
      });
    }));
  }


  
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

  // ============ التقييم الذاتي للحوكمة ============
  // فتح وإغلاق نافذة التقييم
  function openStdAssessment(stdId){
    const modal = document.getElementById('std-modal');
    if(!modal) return;
    // إخفاء جميع الأقسام ثم إظهار القسم المطلوب
    document.querySelectorAll('#std-modal .indicators-section').forEach(s=>s.style.display='none');
    const target = document.getElementById('ind-section-'+stdId);
    if(target) target.style.display='';
    // تحديث رأس النافذة
    const titles = {
      compliance: { title:'معيار الالتزام والامتثال', meta:'9 مؤشرات · 45 ممارسة · 77 سؤالاً', eye:'المعيار الأول · إصدار 2021 V2' },
      transparency: { title:'معيار الشفافية والإفصاح', meta:'14 من 21 عنصر · قيد الإعداد', eye:'المعيار الثاني · إصدار 2021 V2' },
      financial: { title:'معيار السلامة المالية', meta:'16 من 25 عنصر · قيد الإعداد', eye:'المعيار الثالث · قيد الإعداد' }
    };
    const info = titles[stdId] || titles.compliance;
    document.getElementById('std-modal-title').textContent = info.title;
    document.getElementById('std-modal-meta').textContent = info.meta;
    document.getElementById('std-modal-eye').textContent = info.eye;
    // درجة المعيار
    const scoreEl = document.querySelector('[data-std-text="'+stdId+'"]');
    const modalScore = document.getElementById('modal-overall-score');
    if(scoreEl && modalScore) modalScore.textContent = scoreEl.textContent;
    // فتح النافذة (مع إزالة الإخفاء المباشر إن وُجد)
    modal.style.display = '';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    modal.dataset.activeStd = stdId;
  }

  function closeStdAssessment(){
    const modal = document.getElementById('std-modal');
    if(!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // إغلاق بـ Escape
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      const modal = document.getElementById('std-modal');
      if(modal && modal.classList.contains('show')) closeStdAssessment();
    }
  });

  // تحديث المقياس الدائري على البطاقة
  function updateStdRing(stdId, pct){
    const fillCircle = document.querySelector('[data-std-score="'+stdId+'"]');
    const txtSpan = document.querySelector('[data-std-text="'+stdId+'"]');
    if(fillCircle){
      const circumference = 2 * Math.PI * 24;
      fillCircle.setAttribute('stroke-dasharray', circumference.toFixed(2));
      fillCircle.setAttribute('stroke-dashoffset', (circumference * (1 - pct/100)).toFixed(2));
      fillCircle.classList.remove('green','amber','red');
      fillCircle.classList.add(pct >= 75 ? 'green' : pct >= 50 ? 'amber' : 'red');
    }
    if(txtSpan){
      const m = '٠١٢٣٤٥٦٧٨٩';
      txtSpan.textContent = String(pct).split('').map(c=>m[+c]||c).join('') + '٪';
    }
  }

  function toggleIndicator(headEl){
    const card = headEl.closest('.ind-card');
    card.classList.toggle('expanded');
  }

  function expandAllIndicators(expand){
    document.querySelectorAll('#panel-assess .ind-card').forEach(c=>{
      if(expand) c.classList.add('expanded');
      else c.classList.remove('expanded');
    });
  }

  function startNewAssessment(){
    if(!confirm('هل تريد بدء تقييم جديد؟ سيُعاد ضبط جميع الإجابات الحالية.')) return;
    document.querySelectorAll('#panel-assess .qrow').forEach(qr=>{
      qr.classList.remove('answered-yes','answered-no','answered-na');
      qr.querySelectorAll('.qpill').forEach(p=>p.classList.remove('active'));
    });
    recalcAllScores();
  }

  // الإجابة على سؤال (نعم/لا/غير منطبق)
  function answerQ(btn,val){
    const qrow = btn.closest('.qrow');
    if(!qrow) return;
    qrow.classList.remove('answered-yes','answered-no','answered-na');
    qrow.querySelectorAll('.qpill').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    qrow.classList.add('answered-'+val);
    recalcAllScores();
  }

  function arNum(n){
    const m = '٠١٢٣٤٥٦٧٨٩';
    return String(n).split('').map(c=>m[+c]||c).join('');
  }

  // إعادة حساب الدرجات لكل معيار وكل مؤشر
  function recalcAllScores(){
    const stdScores = { compliance: {t:0, y:0}, transparency: {t:0, y:0}, financial: {t:0, y:0} };
    let allTotal = 0, allYes = 0;

    // تكرار على كل قسم معيار على حدة
    ['compliance','transparency','financial'].forEach(stdId=>{
      const section = document.getElementById('ind-section-'+stdId);
      if(!section) return;
      section.querySelectorAll('.ind-card').forEach(card=>{
        let total = 0, yes = 0;
        card.querySelectorAll('.qrow').forEach(qr=>{
          if(qr.classList.contains('answered-yes')){ total++; yes++; }
          else if(qr.classList.contains('answered-no')){ total++; }
        });
        const pct = total>0 ? Math.round((yes/total)*100) : 0;
        const gauge = card.querySelector('.ind-gauge');
        if(gauge){
          const circle = gauge.querySelector('.gauge-fill');
          const text = gauge.querySelector('.gauge-text');
          if(circle){
            // حساب نصف الدائرة من القيمة المسجّلة في dashArray (تتراوح حسب حجم svg)
            const dashAttr = circle.getAttribute('stroke-dasharray');
            const circumference = dashAttr ? parseFloat(dashAttr) : 2 * Math.PI * 20;
            const offset = circumference * (1 - pct/100);
            circle.setAttribute('stroke-dashoffset', offset.toFixed(2));
            circle.classList.remove('green','amber','red');
            circle.classList.add(pct >= 75 ? 'green' : pct >= 50 ? 'amber' : 'red');
          }
          if(text) text.textContent = arNum(pct) + '٪';
        }
        stdScores[stdId].t += total;
        stdScores[stdId].y += yes;
      });
      allTotal += stdScores[stdId].t;
      allYes += stdScores[stdId].y;
    });

    // تحديث بطاقات المعايير الثلاث (الحلقات الدائرية على البطاقة)
    ['compliance','transparency','financial'].forEach(stdId=>{
      const s = stdScores[stdId];
      const pct = s.t>0 ? Math.round((s.y/s.t)*100) : 0;
      updateStdRing(stdId, pct);
      // تحديث رقم الدرجة في رأس النافذة المنبثقة إن كانت مفتوحة على هذا المعيار
      const modal = document.getElementById('std-modal');
      const modalScore = document.getElementById('modal-overall-score');
      if(modalScore && modal && modal.dataset.activeStd === stdId){
        modalScore.textContent = arNum(pct) + '٪';
      }
    });

    // الدرجة الإجمالية
    if(allTotal>0){
      const overall = Math.round((allYes/allTotal)*100);
      const el = document.getElementById('overall-score');
      const barCompliance = document.getElementById('bar-compliance');
      const valCompliance = document.getElementById('val-compliance');
      const cPct = stdScores.compliance.t>0 ? Math.round((stdScores.compliance.y/stdScores.compliance.t)*100) : 0;
      if(el) el.textContent = overall;
      if(barCompliance) barCompliance.style.width = cPct+'%';
      if(valCompliance) valCompliance.textContent = cPct+'%';
    }
  }

  function exportAssessment(){
    let report = 'تقرير التقييم الذاتي للحوكمة\n';
    report += '='.repeat(40) + '\n\n';
    let totalAll=0, yesAll=0;
    document.querySelectorAll('#panel-assess .ind-card').forEach(card=>{
      const name = card.querySelector('.ind-name').textContent;
      const weight = card.querySelector('.ind-weight').textContent;
      let total=0, yes=0, no=0, na=0;
      card.querySelectorAll('.qrow').forEach(qr=>{
        if(qr.classList.contains('answered-yes')){ total++; yes++; totalAll++; yesAll++; }
        else if(qr.classList.contains('answered-no')){ total++; no++; totalAll++; }
        else if(qr.classList.contains('answered-na')){ na++; }
      });
      const pct = total>0 ? Math.round((yes/total)*100) : 0;
      report += name + ' (' + weight + ')\n';
      report += '  الدرجة: ' + pct + '% — نعم: ' + yes + ', لا: ' + no + ', غير منطبق: ' + na + '\n\n';
    });
    const overall = totalAll>0 ? Math.round((yesAll/totalAll)*100) : 0;
    report += '='.repeat(40) + '\n';
    report += 'الدرجة الإجمالية لمعيار الامتثال: ' + overall + '%\n';

    const blob = new Blob([report], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'تقرير-التقييم-الذاتي-للحوكمة.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function goToReg(target){
    const tab = document.querySelector('[data-tab="regulations"]');
    if(tab) tab.click();
    setTimeout(()=>{
      const reglistTab = document.querySelector('.snav-tab[onclick*="reglist"]');
      if(reglistTab) reglistTab.click();
    },200);
  }

  // احتساب أولي عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function(){
    if(document.querySelector('#panel-assess .ind-card')){
      recalcAllScores();
    }
  });
