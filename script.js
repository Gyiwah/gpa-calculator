const gradePoints = {
  A: 4,
  'B+': 3.5,
  B: 3,
  'C+': 2.5,
  C: 2,
  'D+': 1.5,
  D: 1,
  E: 0
};

const STORAGE_KEY = 'gpa_calculator_semesters';
const gradeOrder = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E'];
const semesterList = document.getElementById('semester-list');
const semesterChart = document.getElementById('semester-chart');
const themeToggle = document.getElementById('theme-toggle');
let targetGpa = 3.5;
let semesters = loadSemesters();
let nextSemesterId = semesters.reduce((next, semester) => Math.max(next, semester.id + 1), 1);

function loadSemesters() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [{ id: 1, courses: [] }];

  try {
    const parsed = JSON.parse(saved);
    const isValid = Array.isArray(parsed) && parsed.every((semester) =>
      Number.isInteger(semester.id) &&
      semester.id > 0 &&
      Array.isArray(semester.courses) &&
      semester.courses.every((course) =>
        typeof course.name === 'string' &&
        Number.isFinite(course.credits) &&
        course.credits >= 0.5 &&
        Object.hasOwn(gradePoints, course.grade)
      )
    );
    if (!isValid) throw new TypeError('Saved semester data has an invalid structure.');
    return parsed;
  } catch (error) {
    console.error('Unable to load the saved GPA data.', error);
    window.alert('Saved GPA data could not be loaded. Your saved data was not changed; a fresh semester is shown for now.');
    return [{ id: 1, courses: [] }];
  }
}

function saveSemesters() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  } catch (error) {
    console.error('Unable to save GPA data.', error);
    window.alert('Your changes are visible, but could not be saved in this browser.');
  }
}

function applyTheme(theme, persist = false) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  const nextThemeLabel = `Switch to ${isDark ? 'light' : 'dark'} mode`;
  themeToggle.setAttribute('aria-label', nextThemeLabel);
  themeToggle.title = nextThemeLabel;
  themeToggle.querySelector('.theme-label').textContent = `${isDark ? 'Light' : 'Dark'} mode`;
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#0f172a' : '#f8fafc';
  if (persist) localStorage.setItem('acad_theme', theme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('acad_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : systemPrefersDark
      ? 'dark'
      : 'light';
  applyTheme(theme);
}

function averageGradePoints(courses) {
  const totalCredits = courses.reduce((total, course) => total + course.credits, 0);
  if (totalCredits === 0) return null;

  const weightedPoints = courses.reduce(
    (total, course) => total + gradePoints[course.grade] * course.credits,
    0
  );
  return weightedPoints / totalCredits;
}

function getClassOfHonour(gpa) {
  if (gpa >= 3.5) return 'First Class Honours';
  if (gpa >= 3) return 'Second Class Honours (Upper Division)';
  if (gpa >= 2.5) return 'Second Class Honours (Lower Division)';
  if (gpa >= 2) return 'Third Class Honours';
  return 'Pass';
}

function createTableCell(text, className) {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = text;
  return cell;
}

function createIconButton(action, label, path, semesterId, courseIndex) {
  const button = document.createElement('button');
  button.className = 'icon-button row-action-button';
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.semesterId = semesterId;
  button.setAttribute('aria-label', label);
  button.title = label;
  if (courseIndex !== undefined) button.dataset.courseIndex = courseIndex;

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('aria-hidden', 'true');
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('d', path);
  iconPath.setAttribute('stroke', 'currentColor');
  iconPath.setAttribute('stroke-width', '1.7');
  iconPath.setAttribute('stroke-linecap', 'round');
  iconPath.setAttribute('stroke-linejoin', 'round');
  icon.append(iconPath);
  button.append(icon);
  return button;
}

function renderSemesters() {
  semesterList.replaceChildren();

  if (semesters.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'history-empty';
    empty.textContent = 'No semesters yet. Add a semester to start tracking your courses.';
    semesterList.append(empty);
    return;
  }

  semesters.forEach((semester, semesterIndex) => {
    const card = document.createElement('article');
    card.className = 'semester-card panel';
    card.setAttribute('aria-labelledby', `semester-title-${semester.id}`);

    const header = document.createElement('header');
    header.className = 'semester-card-header';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'semester-card-title';
    const icon = document.createElement('span');
    icon.className = 'semester-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M7.5 3.5v3M16.5 3.5v3M4 9.5h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    const titleContent = document.createElement('div');
    const title = document.createElement('h3');
    title.id = `semester-title-${semester.id}`;
    title.textContent = `Semester ${semesterIndex + 1}`;
    const details = document.createElement('span');
    details.dataset.role = 'semester-details';
    const credits = semester.courses.reduce((total, course) => total + course.credits, 0);
    details.textContent = `${semester.courses.length} ${semester.courses.length === 1 ? 'course' : 'courses'} · ${credits} ${credits === 1 ? 'credit' : 'credits'}`;
    titleContent.append(title, details);
    titleWrap.append(icon, titleContent);

    const actions = document.createElement('div');
    actions.className = 'semester-card-actions';
    const average = averageGradePoints(semester.courses);
    const gpaBadge = document.createElement('span');
    gpaBadge.className = 'semester-gpa-badge';
    gpaBadge.dataset.role = 'semester-gpa';
    gpaBadge.append('SGPA ');
    const gpaValue = document.createElement('strong');
    gpaValue.textContent = average === null ? '—' : average.toFixed(2);
    gpaBadge.append(gpaValue);
    const addCourse = document.createElement('button');
    addCourse.className = 'header-button add-course-button';
    addCourse.type = 'button';
    addCourse.dataset.action = 'add-course';
    addCourse.dataset.semesterId = semester.id;
    addCourse.innerHTML = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4v12m6-6H4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Add course</span>';
    const removeSemester = createIconButton(
      'remove-semester',
      `Delete semester ${semesterIndex + 1}`,
      'M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3',
      semester.id
    );
    removeSemester.classList.add('delete-semester-button');
    actions.append(gpaBadge, addCourse, removeSemester);
    header.append(titleWrap, actions);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'course-table-wrap';
    const table = document.createElement('table');
    table.className = 'course-table';
    const tableHead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Course title / code', 'Credits', 'Grade', 'Quality points', ''].forEach((label) => {
      const heading = document.createElement('th');
      heading.scope = 'col';
      heading.textContent = label;
      headRow.append(heading);
    });
    tableHead.append(headRow);
    const body = document.createElement('tbody');

    if (semester.courses.length === 0) {
      const row = document.createElement('tr');
      row.className = 'empty-row';
      const message = document.createElement('td');
      message.colSpan = 5;
      message.textContent = 'Add a course to start calculating this semester GPA.';
      row.append(message);
      body.append(row);
    } else {
      semester.courses.forEach((course, courseIndex) => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.dataset.label = 'Course title / code';
        const nameInput = document.createElement('input');
        nameInput.className = 'course-name-input';
        nameInput.type = 'text';
        nameInput.maxLength = 100;
        nameInput.value = course.name;
        nameInput.dataset.field = 'name';
        nameInput.dataset.semesterId = semester.id;
        nameInput.dataset.courseIndex = courseIndex;
        nameInput.setAttribute('aria-label', `Course name, semester ${semesterIndex + 1}, course ${courseIndex + 1}`);
        nameCell.append(nameInput);

        const creditCell = document.createElement('td');
        creditCell.dataset.label = 'Credits';
        const creditInput = document.createElement('input');
        creditInput.className = 'credit-input';
        creditInput.type = 'number';
        creditInput.min = '0.5';
        creditInput.step = '0.5';
        creditInput.value = course.credits;
        creditInput.dataset.field = 'credits';
        creditInput.dataset.semesterId = semester.id;
        creditInput.dataset.courseIndex = courseIndex;
        creditInput.setAttribute('aria-label', `Credit hours for ${course.name}`);
        creditCell.append(creditInput);

        const gradeCell = document.createElement('td');
        gradeCell.dataset.label = 'Grade';
        const gradeSelect = document.createElement('select');
        gradeSelect.className = 'grade-select';
        gradeSelect.dataset.field = 'grade';
        gradeSelect.dataset.semesterId = semester.id;
        gradeSelect.dataset.courseIndex = courseIndex;
        gradeSelect.setAttribute('aria-label', `Grade for ${course.name}`);
        gradeOrder.forEach((grade) => {
          const option = document.createElement('option');
          option.value = grade;
          option.textContent = `${grade} (${gradePoints[grade].toFixed(1)})`;
          option.selected = grade === course.grade;
          gradeSelect.append(option);
        });
        gradeCell.append(gradeSelect);

        const qualityPoints = gradePoints[course.grade] * course.credits;
        const pointsCell = createTableCell(qualityPoints.toFixed(2), 'quality-points-cell');
        pointsCell.dataset.label = 'Quality points';
        const removeCell = document.createElement('td');
        removeCell.className = 'course-remove-cell';
        removeCell.append(createIconButton(
          'remove-course',
          `Remove ${course.name}`,
          'M6 6l12 12M18 6 6 18',
          semester.id,
          courseIndex
        ));
        row.append(nameCell, creditCell, gradeCell, pointsCell, removeCell);
        body.append(row);
      });
    }

    table.append(tableHead, body);
    tableWrap.append(table);
    card.append(header, tableWrap);
    semesterList.append(card);
  });
}

function updateSummary() {
  const allCourses = semesters.flatMap((semester) => semester.courses);
  const totalCredits = allCourses.reduce((total, course) => total + course.credits, 0);
  const totalQualityPoints = allCourses.reduce(
    (total, course) => total + gradePoints[course.grade] * course.credits,
    0
  );
  const cumulativeAverage = averageGradePoints(allCourses);

  document.getElementById('total-credits').textContent = totalCredits;
  document.getElementById('total-points').textContent = totalQualityPoints.toFixed(2);
  document.getElementById('semester-count').textContent = semesters.length;
  document.getElementById('course-count').textContent = allCourses.length;
  document.getElementById('cgpa').textContent =
    cumulativeAverage === null ? '—' : cumulativeAverage.toFixed(2);
  document.getElementById('score-progress').style.width =
    `${cumulativeAverage === null ? 0 : (cumulativeAverage / 4) * 100}%`;

  const honour = cumulativeAverage === null ? 'Awaiting grades' : getClassOfHonour(cumulativeAverage);
  const honourBadge = document.getElementById('class-of-honour');
  honourBadge.textContent = honour;
  honourBadge.classList.toggle('summary-badge-active', cumulativeAverage !== null);
}

function appendSvgElement(parent, tagName, attributes = {}, text = '') {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  if (text) element.textContent = text;
  parent.append(element);
  return element;
}

function renderChart() {
  const chartSemesters = semesters
    .map((semester, index) => ({
      semester: index + 1,
      gpa: averageGradePoints(semester.courses)
    }))
    .filter((semester) => semester.gpa !== null);
  const width = Math.max(320, document.getElementById('chart-wrap').clientWidth);
  const height = 286;
  const left = 48;
  const right = width - 20;
  const top = 24;
  const bottom = 218;
  const plotHeight = bottom - top;
  const xForIndex = (index) => chartSemesters.length === 1
    ? (left + right) / 2
    : left + (index / (chartSemesters.length - 1)) * (right - left);
  const yForGpa = (gpa) => bottom - (gpa / 4) * plotHeight;

  semesterChart.replaceChildren();
  semesterChart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  semesterChart.setAttribute('aria-label', `Semester GPA trend with a target GPA of ${targetGpa.toFixed(1)}.`);
  semesterChart.style.minWidth = '0';

  const defs = appendSvgElement(semesterChart, 'defs');
  const gradient = appendSvgElement(defs, 'linearGradient', {
    id: 'area-gradient',
    x1: '0',
    x2: '0',
    y1: '0',
    y2: '1'
  });
  appendSvgElement(gradient, 'stop', { offset: '0%', 'stop-color': '#3b82f6', 'stop-opacity': '0.16' });
  appendSvgElement(gradient, 'stop', { offset: '100%', 'stop-color': '#3b82f6', 'stop-opacity': '0.01' });

  for (let value = 0; value <= 4; value += 1) {
    const y = yForGpa(value);
    appendSvgElement(semesterChart, 'line', {
      class: 'chart-gridline',
      x1: left,
      x2: right,
      y1: y,
      y2: y
    });
    appendSvgElement(semesterChart, 'text', {
      class: 'chart-axis-label',
      x: left - 14,
      y: y + 4,
      'text-anchor': 'end'
    }, value.toFixed(1));
  }

  const targetY = yForGpa(targetGpa);
  appendSvgElement(semesterChart, 'line', {
    class: 'chart-target-line',
    x1: left,
    x2: right,
    y1: targetY,
    y2: targetY
  });
  appendSvgElement(semesterChart, 'text', {
    class: 'chart-target-label',
    x: right - 2,
    y: targetY - 7,
    'text-anchor': 'end'
  }, `TARGET ${targetGpa.toFixed(1)}`);

  const description = document.getElementById('chart-description');
  if (chartSemesters.length === 0) {
    appendSvgElement(semesterChart, 'text', {
      class: 'chart-empty-label',
      x: (left + right) / 2,
      y: 126,
      'text-anchor': 'middle'
    }, 'Add course grades to compare semester performance');
    description.textContent = `No semester GPAs yet. Target GPA is ${targetGpa.toFixed(1)}.`;
    return;
  }

  const coordinates = chartSemesters.map((semester, index) => ({
    x: xForIndex(index),
    y: yForGpa(semester.gpa)
  }));
  const linePath = coordinates.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${bottom} L ${coordinates[0].x} ${bottom} Z`;
  appendSvgElement(semesterChart, 'path', { class: 'chart-area', d: areaPath });
  appendSvgElement(semesterChart, 'path', { class: 'chart-line', d: linePath });

  chartSemesters.forEach((semester, index) => {
    const { x, y } = coordinates[index];
    const point = appendSvgElement(semesterChart, 'g', {
      class: 'chart-point-group',
      tabindex: '0',
      role: 'img',
      'aria-label': `Semester ${semester.semester} GPA ${semester.gpa.toFixed(2)}`
    });
    appendSvgElement(point, 'circle', { class: 'chart-point-halo', cx: x, cy: y, r: 7 });
    appendSvgElement(point, 'circle', { class: 'chart-point', cx: x, cy: y, r: 4 });
    appendSvgElement(semesterChart, 'text', {
      class: 'chart-value-label',
      x,
      y: y - 12,
      'text-anchor': 'middle'
    }, semester.gpa.toFixed(2));
    appendSvgElement(semesterChart, 'text', {
      class: 'chart-semester-label',
      x,
      y: bottom + 25,
      'text-anchor': 'middle'
    }, `S${semester.semester}`);
  });

  const first = chartSemesters[0];
  const latest = chartSemesters[chartSemesters.length - 1];
  if (chartSemesters.length === 1) {
    description.textContent =
      `1 semester with a GPA of ${first.gpa.toFixed(2)}. Target GPA ${targetGpa.toFixed(1)}.`;
    return;
  }

  const change = latest.gpa - first.gpa;
  const trend = change > 0
    ? `increased by ${change.toFixed(2)}`
    : change < 0
      ? `decreased by ${Math.abs(change).toFixed(2)}`
      : 'remained unchanged';
  description.textContent =
    `${chartSemesters.length} semester GPAs. GPA ${trend} from ${first.gpa.toFixed(2)} in semester ${first.semester} to ${latest.gpa.toFixed(2)} in semester ${latest.semester}. Target GPA ${targetGpa.toFixed(1)}.`;
}

function render() {
  renderSemesters();
  updateSummary();
  renderChart();
}

function updateSemesterCardSummaries() {
  semesters.forEach((semester, index) => {
    const card = semesterList.children[index];
    if (!card) return;
    const credits = semester.courses.reduce((total, course) => total + course.credits, 0);
    card.querySelector('[data-role="semester-details"]').textContent =
      `${semester.courses.length} ${semester.courses.length === 1 ? 'course' : 'courses'} · ${credits} ${credits === 1 ? 'credit' : 'credits'}`;
    const average = averageGradePoints(semester.courses);
    card.querySelector('[data-role="semester-gpa"] strong').textContent =
      average === null ? '—' : average.toFixed(2);
  });
}

function getSemesterById(id) {
  return semesters.find((semester) => semester.id === Number(id));
}

document.getElementById('add-semester').addEventListener('click', () => {
  semesters.push({ id: nextSemesterId++, courses: [] });
  saveSemesters();
  render();
});

document.getElementById('reset-data').addEventListener('click', () => {
  if (!window.confirm('Remove all semesters and courses? This cannot be undone.')) return;
  semesters = [];
  nextSemesterId = 1;
  saveSemesters();
  render();
});

semesterList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const semester = getSemesterById(button.dataset.semesterId);
  if (!semester) return;

  if (button.dataset.action === 'add-course') {
    semester.courses.push({
      name: `Course ${semester.courses.length + 1}`,
      credits: 3,
      grade: 'A'
    });
    saveSemesters();
    render();
    semesterList.querySelector(`input[data-semester-id="${semester.id}"][data-course-index="${semester.courses.length - 1}"]`)?.focus();
    return;
  }

  if (button.dataset.action === 'remove-course') {
    semester.courses.splice(Number(button.dataset.courseIndex), 1);
  } else if (button.dataset.action === 'remove-semester') {
    semesters = semesters.filter((item) => item.id !== semester.id);
  } else {
    return;
  }

  saveSemesters();
  updateSemesterCardSummaries();
  updateSummary();
  renderChart();
});

semesterList.addEventListener('input', (event) => {
  const input = event.target;
  const field = input.dataset.field;
  if (field !== 'name' && field !== 'credits') return;

  const semester = getSemesterById(input.dataset.semesterId);
  const course = semester?.courses[Number(input.dataset.courseIndex)];
  if (!course) return;

  if (field === 'name') {
    course.name = input.value;
    const row = input.closest('tr');
    const courseNumber = Number(input.dataset.courseIndex) + 1;
    row.querySelector('.credit-input').setAttribute('aria-label', `Credit hours for ${course.name || `course ${courseNumber}`}`);
    row.querySelector('.grade-select').setAttribute('aria-label', `Grade for ${course.name || `course ${courseNumber}`}`);
    const removeButton = row.querySelector('.course-remove-cell button');
    const removeLabel = `Remove ${course.name || `course ${courseNumber}`}`;
    removeButton.setAttribute('aria-label', removeLabel);
    removeButton.title = removeLabel;
  } else {
    const credits = input.valueAsNumber;
    if (!Number.isFinite(credits) || credits < 0.5 || credits * 2 % 1 !== 0) return;
    course.credits = credits;
    input.closest('tr').querySelector('.quality-points-cell').textContent =
      (gradePoints[course.grade] * course.credits).toFixed(2);
  }

  saveSemesters();
  render();
});

semesterList.addEventListener('change', (event) => {
  const input = event.target;
  const field = input.dataset.field;
  if (field !== 'grade' && field !== 'credits') return;

  const semester = getSemesterById(input.dataset.semesterId);
  const course = semester?.courses[Number(input.dataset.courseIndex)];
  if (!course) return;

  if (field === 'grade' && Object.hasOwn(gradePoints, input.value)) {
    course.grade = input.value;
  } else if (field === 'credits') {
    const credits = input.valueAsNumber;
    if (!Number.isFinite(credits) || credits < 0.5 || credits * 2 % 1 !== 0) {
      input.value = course.credits;
      input.reportValidity();
      return;
    }
    course.credits = credits;
  }

  saveSemesters();
  render();
});

document.getElementById('target-gpa').addEventListener('input', (event) => {
  const value = event.target.valueAsNumber;
  if (!Number.isFinite(value) || value < 0 || value > 4) return;
  targetGpa = value;
  renderChart();
});

document.getElementById('target-gpa').addEventListener('change', (event) => {
  const input = event.target;
  const value = input.valueAsNumber;
  if (!Number.isFinite(value) || value < 0 || value > 4) {
    input.value = targetGpa;
    return;
  }
  input.value = targetGpa;
});

document.getElementById('export').addEventListener('click', () => {
  const rows = [['Semester', 'Course', 'Grade', 'Credits', 'Quality Points']];
  semesters.forEach((semester, semesterIndex) => {
    semester.courses.forEach((course) => {
      rows.push([
        semesterIndex + 1,
        course.name,
        course.grade,
        course.credits,
        (gradePoints[course.grade] * course.credits).toFixed(2)
      ]);
    });
  });

  const csv = rows.map((row) => row.map((value) => {
    const text = String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gpa-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.getElementById('print').addEventListener('click', () => window.print());
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(theme, true);
  renderChart();
});
window.addEventListener('resize', renderChart);

initializeTheme();
render();
