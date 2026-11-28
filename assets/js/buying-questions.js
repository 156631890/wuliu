(() => {
  const page = document.querySelector('[data-buyer-qa]');
  if (!page) return;
  const controls = page.querySelector('[data-qa-controls]');
  const search = controls.querySelector('input');
  const topic = controls.querySelector('[data-topic-filter]');
  const role = controls.querySelector('[data-role-filter]');
  const count = page.querySelector('[data-qa-count]');
  const empty = page.querySelector('[data-qa-empty]');
  const groups = [...page.querySelectorAll('[data-qa-topic]')];
  const normalize = text => text.toLowerCase().normalize('NFKD')
    .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const rows = groups.map(group => ({
    group,
    questions: [...group.querySelectorAll('[data-qa-question]')].map(details => ({
      details,
      text: normalize(details.textContent + ' ' + details.dataset.aliases)
    }))
  }));

  function filter() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    let matches = 0;
    for (const {group, questions} of rows) {
      let groupMatches = 0;
      for (const {details, text} of questions) {
        const show = (!topic.value || topic.value === group.dataset.qaTopic)
          && (!role.value || role.value === details.dataset.qaRole)
          && words.every(word => text.includes(word));
        details.hidden = !show;
        groupMatches += Number(show);
      }
      group.hidden = groupMatches === 0;
      matches += groupMatches;
    }
    count.textContent = count.dataset.label.replace('{n}', String(matches));
    empty.hidden = matches > 0;
  }

  function reset() {
    search.value = '';
    topic.value = '';
    role.value = '';
    filter();
  }

  function reveal(hash) {
    if (!hash || hash.length < 2) return;
    const target = document.getElementById(hash.slice(1));
    if (!target || !page.contains(target)) return;
    const answer = target.closest('details[data-qa-question]');
    if (target.closest('[hidden]')) reset();
    if (answer) answer.open = true;
  }

  search.addEventListener('input', filter);
  topic.addEventListener('change', filter);
  role.addEventListener('change', filter);
  controls.querySelector('button').addEventListener('click', () => {
    reset();
    search.focus();
  });
  page.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) reveal(link.hash);
  });
  window.addEventListener('hashchange', () => reveal(location.hash));
  filter();
  reveal(location.hash);
  controls.hidden = false;
  count.hidden = false;
})();
