/* 黑胶架 · Vinyl Collection Manager
 * 纯前端单页应用，数据保存在 localStorage。零依赖。
 */
(function () {
  'use strict';

  const STORE_KEY = 'vinyl-collection-v1';
  const LAYOUT_KEY = 'vinyl-layout';

  /* ---------------- State ---------------- */
  let records = load();
  let layout = localStorage.getItem(LAYOUT_KEY) || 'grid';
  let editingRating = 0;

  /* ---------------- DOM ---------------- */
  const $ = (sel) => document.querySelector(sel);
  const grid = $('#grid');
  const empty = $('#empty');
  const search = $('#search');
  const filterGenre = $('#filterGenre');
  const filterShelf = $('#filterShelf');
  const sortBy = $('#sortBy');
  const resultCount = $('#resultCount');
  const formModal = $('#formModal');
  const detailModal = $('#detailModal');
  const form = $('#recordForm');

  /* ---------------- Persistence ---------------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('读取本地数据失败', e); }
    return seed();
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(records));
    } catch (e) {
      toast('保存失败：本地存储已满，请删除部分封面图或导出备份');
    }
  }

  function seed() {
    // 首次打开时给两张示例唱片，让界面不为空
    const now = Date.now();
    return [
      {
        id: uid(), artist: 'Pink Floyd', title: 'The Dark Side of the Moon',
        year: 1973, genre: 'Rock', label: 'Harvest', format: 'LP', speed: '33⅓',
        condition: 'NM', purchaseDate: '', price: 320, rating: 5,
        tags: ['经典摇滚', '前卫摇滚'], notes: '示例唱片，可编辑或删除。',
        cover: '', wishlist: false, added: now
      },
      {
        id: uid(), artist: 'Miles Davis', title: 'Kind of Blue',
        year: 1959, genre: 'Jazz', label: 'Columbia', format: 'LP', speed: '33⅓',
        condition: 'VG+', purchaseDate: '', price: 280, rating: 5,
        tags: ['爵士', 'Modal Jazz'], notes: '示例唱片，可编辑或删除。',
        cover: '', wishlist: false, added: now - 1000
      }
    ];
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------- Rendering ---------------- */
  function starsHTML(n) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += `<span class="${i <= n ? '' : 'off'}">★</span>`;
    return `<span class="stars">${s}</span>`;
  }

  function coverHTML(r, big) {
    if (r.cover) return `<img src="${escapeAttr(r.cover)}" alt="${escapeAttr(r.title)} 封面" loading="lazy">`;
    return `<span class="ph">${big ? '◉' : '♪'}</span>`;
  }

  function render() {
    refreshGenreOptions();
    const list = currentList();
    resultCount.textContent = `${list.length} 张`;
    grid.className = 'grid' + (layout === 'list' ? ' list' : '');

    if (records.length === 0) {
      empty.hidden = false; grid.hidden = true; return;
    }
    empty.hidden = true; grid.hidden = false;

    grid.innerHTML = list.map(r => layout === 'list' ? listCard(r) : gridCard(r)).join('');
    grid.querySelectorAll('.card').forEach(el => {
      el.addEventListener('click', () => openDetail(el.dataset.id));
    });
    if (list.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;color:var(--muted);text-align:center;padding:50px">没有符合条件的唱片</div>`;
    }
  }

  function gridCard(r) {
    return `<div class="card" data-id="${r.id}">
      <div class="cover">${r.wishlist ? '<span class="wishtag">心愿单</span>' : ''}${coverHTML(r)}</div>
      <div class="meta">
        <div class="artist">${escapeHTML(r.artist)}</div>
        <div class="title">${escapeHTML(r.title)}</div>
        <div class="sub">
          <span>${r.year || '—'}</span>
          <span>${escapeHTML(r.genre || '未分类')}</span>
        </div>
        <div class="sub" style="margin-top:4px">${starsHTML(r.rating)}</div>
      </div>
    </div>`;
  }

  function listCard(r) {
    return `<div class="card" data-id="${r.id}">
      <div class="cover">${coverHTML(r)}</div>
      <div class="meta">
        <div class="artist">${escapeHTML(r.artist)}${r.wishlist ? ' · <span style="color:var(--accent)">心愿单</span>' : ''}</div>
        <div class="title">${escapeHTML(r.title)}</div>
        <div class="sub">${r.year || '—'} · ${escapeHTML(r.genre || '未分类')} · ${escapeHTML(r.format)} · 品相 ${escapeHTML(r.condition)}</div>
      </div>
      <div class="list-right">
        ${starsHTML(r.rating)}<br>
        ${r.price ? '¥' + fmtMoney(r.price) : ''}
      </div>
    </div>`;
  }

  function currentList() {
    const q = search.value.trim().toLowerCase();
    const g = filterGenre.value;
    const shelf = filterShelf.value;
    let list = records.filter(r => {
      if (g && r.genre !== g) return false;
      if (shelf === 'owned' && r.wishlist) return false;
      if (shelf === 'wishlist' && !r.wishlist) return false;
      if (q) {
        const hay = [r.artist, r.title, r.label, r.genre, (r.tags || []).join(' '), r.notes]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return sortList(list, sortBy.value);
  }

  function sortList(list, mode) {
    const by = {
      'added-desc': (a, b) => b.added - a.added,
      'added-asc': (a, b) => a.added - b.added,
      'artist-asc': (a, b) => cmp(a.artist, b.artist),
      'title-asc': (a, b) => cmp(a.title, b.title),
      'year-desc': (a, b) => (b.year || 0) - (a.year || 0),
      'year-asc': (a, b) => (a.year || 9999) - (b.year || 9999),
      'rating-desc': (a, b) => b.rating - a.rating,
      'price-desc': (a, b) => (b.price || 0) - (a.price || 0)
    };
    return list.slice().sort(by[mode] || by['added-desc']);
  }

  function cmp(a, b) { return (a || '').localeCompare(b || '', 'zh-Hans-CN'); }

  function refreshGenreOptions() {
    const genres = [...new Set(records.map(r => r.genre).filter(Boolean))].sort(cmp);
    const cur = filterGenre.value;
    filterGenre.innerHTML = '<option value="">全部流派</option>' +
      genres.map(g => `<option value="${escapeAttr(g)}">${escapeHTML(g)}</option>`).join('');
    if (genres.includes(cur)) filterGenre.value = cur;
    $('#genreList').innerHTML = genres.map(g => `<option value="${escapeAttr(g)}">`).join('');
  }

  /* ---------------- Detail ---------------- */
  function openDetail(id) {
    const r = records.find(x => x.id === id);
    if (!r) return;
    const row = (k, v) => v ? `<div class="d-row"><span class="k">${k}</span><span class="v">${v}</span></div>` : '';
    $('#detailBody').innerHTML = `
      <div class="detail-cover">${coverHTML(r, true)}</div>
      <div class="detail-info">
        <div class="d-artist">${escapeHTML(r.artist)}</div>
        <h2>${escapeHTML(r.title)} ${r.wishlist ? '<span style="font-size:13px;color:var(--accent)">· 心愿单</span>' : ''}</h2>
        <div>${starsHTML(r.rating)}</div>
        <div class="d-rows">
          ${row('发行年份', r.year)}
          ${row('流派', escapeHTML(r.genre))}
          ${row('厂牌', escapeHTML(r.label))}
          ${row('规格', `${escapeHTML(r.format)} · ${escapeHTML(r.speed)} RPM`)}
          ${row('品相', escapeHTML(condFull(r.condition)))}
          ${row('购入日期', r.purchaseDate)}
          ${row('购入价格', r.price ? '¥' + fmtMoney(r.price) : '')}
        </div>
        ${(r.tags && r.tags.length) ? `<div class="tags">${r.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        ${r.notes ? `<div class="d-notes">${escapeHTML(r.notes)}</div>` : ''}
        <div class="detail-actions">
          <button class="btn primary" id="dEdit">编辑</button>
          <button class="btn danger ghost" id="dDelete">删除</button>
        </div>
      </div>`;
    detailModal.hidden = false;
    $('#dEdit').onclick = () => { detailModal.hidden = true; openForm(r); };
    $('#dDelete').onclick = () => removeRecord(r.id);
  }

  /* ---------------- Form ---------------- */
  function openForm(r) {
    form.reset();
    setCoverPreview('');
    $('#formTitle').textContent = r ? '编辑唱片' : '添加唱片';
    $('#deleteBtn').hidden = !r;
    $('#f-id').value = r ? r.id : '';
    if (r) {
      $('#f-artist').value = r.artist || '';
      $('#f-title').value = r.title || '';
      $('#f-year').value = r.year || '';
      $('#f-genre').value = r.genre || '';
      $('#f-label').value = r.label || '';
      $('#f-format').value = r.format || 'LP';
      $('#f-speed').value = r.speed || '33⅓';
      $('#f-condition').value = r.condition || 'NM';
      $('#f-purchaseDate').value = r.purchaseDate || '';
      $('#f-price').value = r.price || '';
      $('#f-tags').value = (r.tags || []).join(', ');
      $('#f-notes').value = r.notes || '';
      $('#f-wishlist').checked = !!r.wishlist;
      setRating(r.rating || 0);
      setCoverPreview(r.cover || '');
    } else {
      $('#f-format').value = 'LP';
      $('#f-speed').value = '33⅓';
      $('#f-condition').value = 'NM';
      setRating(0);
    }
    formModal.hidden = false;
    $('#f-artist').focus();
  }

  function setRating(n) {
    editingRating = n;
    $('#f-rating').value = n;
    $('#starInput').querySelectorAll('span').forEach(s => {
      s.classList.toggle('on', Number(s.dataset.v) <= n);
    });
  }

  let pendingCover = ''; // base64 or url chosen in the form
  function setCoverPreview(src) {
    pendingCover = src || '';
    const p = $('#coverPreview');
    p.innerHTML = src ? `<img src="${escapeAttr(src)}" alt="封面预览">` : '<span>封面</span>';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = $('#f-id').value;
    const data = {
      artist: $('#f-artist').value.trim(),
      title: $('#f-title').value.trim(),
      year: $('#f-year').value ? Number($('#f-year').value) : null,
      genre: $('#f-genre').value.trim(),
      label: $('#f-label').value.trim(),
      format: $('#f-format').value,
      speed: $('#f-speed').value,
      condition: $('#f-condition').value,
      purchaseDate: $('#f-purchaseDate').value,
      price: $('#f-price').value ? Number($('#f-price').value) : null,
      rating: Number($('#f-rating').value) || 0,
      tags: $('#f-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      notes: $('#f-notes').value.trim(),
      wishlist: $('#f-wishlist').checked,
      cover: pendingCover
    };
    if (!data.artist || !data.title) { toast('请填写艺人和专辑标题'); return; }

    if (id) {
      const i = records.findIndex(x => x.id === id);
      records[i] = Object.assign({}, records[i], data);
      toast('已更新');
    } else {
      data.id = uid();
      data.added = Date.now();
      records.unshift(data);
      toast('已添加到收藏');
    }
    save();
    formModal.hidden = true;
    render();
  });

  function removeRecord(id) {
    const r = records.find(x => x.id === id);
    if (!r) return;
    if (!confirm(`确定删除《${r.title}》吗？此操作不可撤销。`)) return;
    records = records.filter(x => x.id !== id);
    save();
    formModal.hidden = true;
    detailModal.hidden = true;
    render();
    toast('已删除');
  }

  /* ---------------- Stats ---------------- */
  function renderStats() {
    const owned = records.filter(r => !r.wishlist);
    const totalValue = owned.reduce((s, r) => s + (r.price || 0), 0);
    const rated = owned.filter(r => r.rating);
    const avg = rated.length ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length) : 0;
    const wish = records.filter(r => r.wishlist).length;

    $('#statCards').innerHTML = [
      ['已收藏', owned.length + ' 张'],
      ['藏品总值', '¥' + fmtMoney(totalValue)],
      ['平均评分', avg ? avg.toFixed(1) + ' ★' : '—'],
      ['心愿单', wish + ' 张']
    ].map(([l, n]) => `<div class="stat-card"><div class="num">${n}</div><div class="lbl">${l}</div></div>`).join('');

    // by genre
    const gMap = countBy(owned, r => r.genre || '未分类');
    $('#byGenre').innerHTML = barRows(gMap);

    // by decade
    const dMap = countBy(owned.filter(r => r.year), r => Math.floor(r.year / 10) * 10 + 's');
    $('#byDecade').innerHTML = barRows(dMap, true);
  }

  function countBy(arr, fn) {
    const m = {};
    arr.forEach(x => { const k = fn(x); m[k] = (m[k] || 0) + 1; });
    return m;
  }

  function barRows(map, sortByKey) {
    const entries = Object.entries(map);
    if (!entries.length) return '<div style="color:var(--muted);font-size:13px">暂无数据</div>';
    entries.sort(sortByKey ? (a, b) => a[0].localeCompare(b[0]) : (a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map(e => e[1]));
    return entries.map(([k, v]) => `
      <div class="bar-row">
        <span class="name">${escapeHTML(k)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(v / max * 100).toFixed(1)}%"></div></div>
        <span class="val">${v}</span>
      </div>`).join('');
  }

  /* ---------------- Import / Export ---------------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vinyl-collection-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('已导出 ' + records.length + ' 张唱片');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('格式不对');
        const valid = data.filter(r => r && r.artist && r.title).map(r => ({
          id: r.id || uid(), added: r.added || Date.now(),
          artist: r.artist, title: r.title, year: r.year || null,
          genre: r.genre || '', label: r.label || '', format: r.format || 'LP',
          speed: r.speed || '33⅓', condition: r.condition || 'NM',
          purchaseDate: r.purchaseDate || '', price: r.price || null,
          rating: r.rating || 0, tags: Array.isArray(r.tags) ? r.tags : [],
          notes: r.notes || '', wishlist: !!r.wishlist, cover: r.cover || ''
        }));
        if (!valid.length) { toast('文件里没有有效唱片'); return; }
        if (records.length && !confirm(`导入 ${valid.length} 张唱片？\n确定=合并到现有收藏，取消=放弃`)) return;
        const existing = new Set(records.map(r => r.id));
        valid.forEach(r => { if (existing.has(r.id)) r.id = uid(); });
        records = records.concat(valid);
        save();
        render();
        toast('已导入 ' + valid.length + ' 张');
      } catch (e) {
        toast('导入失败：不是有效的 JSON 备份文件');
      }
    };
    reader.readAsText(file);
  }

  /* ---------------- Helpers ---------------- */
  function condFull(c) {
    return ({ M: 'M 全新', NM: 'NM 近全新', 'VG+': 'VG+ 优', VG: 'VG 良', G: 'G 一般', P: 'P 差' })[c] || c;
  }
  function fmtMoney(n) { return Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 }); }
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(s) { return escapeHTML(s); }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* ---------------- View switching ---------------- */
  function switchView(view) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
    $('#view-collection').hidden = view !== 'collection';
    $('#view-stats').hidden = view !== 'stats';
    $('#toolbar').style.display = view === 'collection' ? '' : 'none';
    if (view === 'stats') renderStats();
  }

  /* ---------------- Events ---------------- */
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => switchView(t.dataset.view));

  [search, filterGenre, filterShelf, sortBy].forEach(el =>
    el.addEventListener('input', render));

  document.querySelectorAll('.lt').forEach(b => b.onclick = () => {
    layout = b.dataset.layout;
    localStorage.setItem(LAYOUT_KEY, layout);
    document.querySelectorAll('.lt').forEach(x => x.classList.toggle('active', x === b));
    render();
  });

  $('#addBtn').onclick = () => openForm(null);
  $('#emptyAddBtn').onclick = () => openForm(null);
  $('#formClose').onclick = $('#cancelBtn').onclick = () => formModal.hidden = true;
  $('#detailClose').onclick = () => detailModal.hidden = true;
  $('#deleteBtn').onclick = () => removeRecord($('#f-id').value);

  // close modals on backdrop click / Esc
  [formModal, detailModal].forEach(m => m.addEventListener('click', e => {
    if (e.target === m) m.hidden = true;
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { formModal.hidden = true; detailModal.hidden = true; }
  });

  // star input
  $('#starInput').addEventListener('click', e => {
    if (e.target.dataset.v) {
      const v = Number(e.target.dataset.v);
      setRating(v === editingRating ? 0 : v); // 再次点击同一星 = 清零
    }
  });

  // cover: file upload -> base64
  $('#f-coverFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { toast('图片过大（>1.5MB），请压缩后再上传'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { setCoverPreview(reader.result); $('#f-coverUrl').value = ''; };
    reader.readAsDataURL(file);
  });
  $('#f-coverUrl').addEventListener('input', e => {
    if (e.target.value.trim()) setCoverPreview(e.target.value.trim());
  });
  $('#coverClear').onclick = () => { setCoverPreview(''); $('#f-coverUrl').value = ''; $('#f-coverFile').value = ''; };

  // import / export
  $('#exportBtn').onclick = exportData;
  $('#importBtn').onclick = () => $('#importFile').click();
  $('#importFile').addEventListener('change', e => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  /* ---------------- Init ---------------- */
  document.querySelectorAll('.lt').forEach(x => x.classList.toggle('active', x.dataset.layout === layout));
  render();
})();
