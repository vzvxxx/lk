/* app.js — КТО разносит данные по странице.
   Сам значений не хранит: берёт их у data.js через функцию getProfile(). */


/* ---------- ПРОКРУТКОЙ РАСПОРЯЖАЕМСЯ МЫ ---------- */

/* Браузер сам запоминает, на каком месте страницы был человек,
   и возвращает туда при обновлении и при "назад".
   Обычно это удобно, но у нас разделы должны открываться сверху.

   "manual" ("вручную") — "прокруткой распоряжаюсь я сам, не вмешивайся".
   После этого единственное, что двигает страницу, — наш window.scrollTo. */

history.scrollRestoration = "manual";


/* async ("асинхронная") — эта функция умеет ждать ответа.
   showProfile ("показать профиль") — имя, которое мы придумали сами. */

async function showProfile() {

  /* await ("подожди") — подожди, пока getProfile() принесёт ответ,
     и только потом иди дальше.
     const p — коробка, в которую кладём принесённый объект. */
  const p = await getProfile();

  /* Дальше всё знакомое: найти элемент по метке и положить в него текст.
     Точка в p.fullName читается так же, как везде: "у него" —
     у объекта p взять поле fullName. */
  document.getElementById("quote").textContent            = p.quote;
  document.getElementById("profile-name").textContent      = p.fullName;
  document.getElementById("profile-institute").textContent = p.institute;
  document.getElementById("profile-program").textContent   = p.program;
  document.getElementById("profile-group").textContent     = p.group;
  document.getElementById("profile-year").textContent      = p.year;

  /* Пустое поле — строку не показываем вовсе.
     У второго курса мехмата кафедры ещё нет, и строка "Направление: —"
     была бы враньём. Приём тот же, что с кнопкой почты в решении 9. */
  document.getElementById("row-program").hidden = (p.program === "");
}

/* Функцию мало написать — её надо вызвать. Вот вызов: */
showProfile();


/* ---------- ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ---------- */

/* showSection ("показать раздел") — прячет все разделы и показывает один.
   id — метка нужного раздела. Её передают в скобках при вызове:
   showSection("section-schedule")

   querySelectorAll ("найти все по признаку") — родственник getElementById,
   но возвращает СПИСОК всех подходящих элементов, а не один.

   for (... of ...) — цикл: "для каждого элемента из списка".
   Строки внутри выполняются столько раз, сколько элементов в списке.

   true / false — "да" / "нет". hidden = true — спрятан, false — показан. */

function showSection(id) {
  const sections = document.querySelectorAll("section");   // все разделы

  for (const section of sections) {
    section.hidden = true;                                 // спрятать каждый
  }

  document.getElementById(id).hidden = false;              // показать нужный

  /* То же самое с подсветкой меню: снять ярлык со всех пунктов
     и повесить на нужный. Пункт находим по метке "menu-" + метка раздела. */
  const items = document.querySelectorAll("nav li");

  for (const item of items) {
    item.classList.remove("active");
  }

  /* Защитная проверка: getElementById может вернуть null.
     Раздел без пункта в меню — законная ситуация: пункт могли убрать,
     а сам раздел оставить. Тогда подсвечивать просто нечего. */
  const menuItem = document.getElementById("menu-" + id);

  if (menuItem !== null) {
    menuItem.classList.add("active");
  }

  /* Выбрали раздел — меню закрывается. На телефоне иначе оно так и висит. */
  document.querySelector("nav").classList.remove("open");

  /* Запомнить раздел в адресе страницы: index.html#schedule

     В адрес кладём метку БЕЗ "section-", а у коробки метка с ним.
     Совпадения нет — и якорю некуда вести, прокрутка не случается.
     Это важно при ОБНОВЛЕНИИ страницы: там переход настоящий,
     и якорь отработал бы по-честному, уведя шапку за верхний край.

     Почему pushState, а не location.hash = ...:
     присваивание хвоста адреса — это переход по якорю со всеми
     последствиями. pushState просто переписывает строку адреса.
     "Назад" и "вперёд" работают по-прежнему: при них браузер
     сообщает об изменении адреса, и openFromAddress вызывается.

     Проверка на совпадение — чтобы повторные нажатия на один и тот же
     пункт не засоряли историю одинаковыми записями. */
  const metka = id.replace("section-", "");

  if (location.hash !== "#" + metka) {
    history.pushState(null, "", "#" + metka);
  }

  /* Открывать раздел с начала страницы.
     Нужно и после pushState: если пролистать длинный раздел вниз
     и выбрать короткий, страница осталась бы отмотанной. */
  window.scrollTo(0, 0);
}


/* toggleMenu ("переключить меню") — открыть список, если закрыт,
   и закрыть, если открыт.

   querySelector (без All) — найти ПЕРВЫЙ подходящий элемент, а не список.
   classList.toggle ("переключить") — снять ярлык, если он есть,
   и повесить, если его нет. */

function toggleMenu() {
  document.querySelector("nav").classList.toggle("open");
}


/* toggleGroup ("переключить группу") — свернуть или развернуть группу меню.
   heading — сама подпись, по которой щёлкнули (её передаёт this).

   Всё остальное делает CSS: увидит ярлык collapsed — спрячет соседний
   список и повернёт треугольник. */

function toggleGroup(heading) {
  heading.classList.toggle("collapsed");
}


/* openFromAddress ("открыть из адреса") — какой раздел показать при загрузке.

   location.hash — хвост адреса после решётки: "#schedule".
   .replace("#", "") — заменить решётку на пустоту, остаётся метка.

   В адресе метка короткая, у коробки — с приставкой "section-".
   Здесь приставку возвращаем: "schedule" -> "section-schedule".
   Расходятся они нарочно, чтобы не срабатывал якорь, — см. showSection.

   if / else — развилка: "если ... иначе".
   === — "в точности равно" (одинарное = означало бы "положи").
   null — "ничего": так getElementById отвечает, когда не нашёл.

   Проверка ловит два случая сразу: адрес пустой (зашли впервые)
   и адрес с опечаткой. В обоих открываем расписание. */

function openFromAddress() {
  const metka = location.hash.replace("#", "");
  const id    = "section-" + metka;

  if (document.getElementById(id) === null) {
    showSection("section-schedule");
  } else {
    showSection(id);
  }
}


/* ---------- РАСПИСАНИЕ ---------- */

/* Какую неделю смотрим: 0 — текущая, -1 — прошлая, +1 — следующая. */
let weekOffset = 0;


/* Порядок дней внутри недели. Нужен, чтобы по названию дня узнать,
   сколько суток прибавить к понедельнику и получить его дату. */
const weekOrder = ["Понедельник", "Вторник", "Среда",
                   "Четверг", "Пятница", "Суббота", "Воскресенье"];


/* mondayOf ("понедельник для") — найти понедельник той недели,
   в которую попадает переданная дата.

   getDay() отдаёт 0 для воскресенья и 1 для понедельника.
   Значит, сдвиг до понедельника — это 1 минус номер дня.
   Воскресенье считаем КОНЦОМ недели, а не началом, поэтому для него
   сдвиг отдельный: минус шесть дней назад.

   setDate(getDate() + сдвиг) — "прибавить столько-то суток".
   Про длину месяцев и високосные годы браузер думает сам. */

function mondayOf(date) {
  const d   = new Date(date);
  const day = d.getDay();

  let shift = 1 - day;
  if (day === 0) {
    shift = -6;
  }

  d.setDate(d.getDate() + shift);
  d.setHours(0, 0, 0, 0);               // обнулить время, оставить только дату
  return d;
}


/* shownMonday — понедельник той недели, которую сейчас показываем. */

function shownMonday() {
  const monday = mondayOf(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  return monday;
}


/* getWeekParity — чётная неделя или нечётная, для ЛЮБОГО понедельника.
   Раньше умели считать только для сегодняшней; теперь нужно для любой.

   Math.round, а не Math.floor: при переводе часов разница может оказаться
   не ровно целым числом недель, и округление к ближайшему надёжнее. */

function getWeekParity(monday) {
  const anchor   = new Date(settings.weekAnchor + "T00:00:00");
  const msInWeek = 7 * 24 * 60 * 60 * 1000;

  const weeksPassed = Math.round((monday - anchor) / msInWeek);

  if (weeksPassed % 2 === 0) {
    return "нечётная";
  } else {
    return "чётная";
  }
}


/* hasWeeks — есть ли в расписании хоть одна пара с пометкой недели.
   Если нет — про чётность не упоминаем вовсе. */

function hasWeeks(days) {
  for (const day of days) {
    for (const lesson of day.lessons) {
      if (lesson.week !== undefined) {
        return true;
      }
    }
  }
  return false;
}


/* moveWeek — листание стрелками. goToday — вернуться на текущую неделю. */

function moveWeek(step) {
  weekOffset = weekOffset + step;
  showSchedule();
}

function goToday() {
  weekOffset = 0;
  showSchedule();
}

/* Выбранная группа хранится в браузере этого устройства.
   Если хранение недоступно, выбор всё равно работает до закрытия страницы. */
async function initSchedule() {
  const groups = await getScheduleGroups();
  const select = document.getElementById("schedule-group");

  for (const group of groups) {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    select.append(option);
  }

  const saved = await getGroup();

  if (groups.includes(saved)) {
    select.value = saved;
  }

  select.addEventListener("change", async function () {
    weekOffset = 0;
    await setGroup(select.value);
    showSchedule();
    showTeachers();      /* у другой группы другие преподаватели */
    showProfile();       /* и в профиле меняется группа */
  });

  showSchedule();
  showTeachers();
}

/* Значения из таблицы превращаются в текст HTML, поэтому специальные
   символы нужно заменить до вставки через innerHTML. */
function escapeScheduleText(value) {
  const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value).replace(/[&<>"']/g, function (char) {
    return chars[char];
  });
}


async function showSchedule() {
  const group = document.getElementById("schedule-group").value;
  const info = await getScheduleInfo();

  /* Дата снимка и ссылка на оригинал остаются видны для любой группы. */
  const source = document.getElementById("schedule-source");
  source.textContent = `${info.course} · сверено ${info.updated} · `;
  const link = document.createElement("a");
  link.href = info.source;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "исходная таблица";
  source.append(link);

  if (group === "") {
    document.getElementById("schedule-week").textContent = "";
    document.getElementById("schedule-body").textContent = "Выберите свою группу, чтобы увидеть расписание.";
    return;
  }

  const days = await getSchedule(group);

  const monday = shownMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const parity      = getWeekParity(monday);
  const alternating = hasWeeks(days);

  /* Подпись чётности — рядом с заголовком раздела, и только если она нужна. */
  if (alternating === true) {
    document.getElementById("schedule-week").textContent = parity + " неделя";
  } else {
    document.getElementById("schedule-week").textContent = "";
  }

  /* Сегодняшняя дата — чтобы подсветить нужный день,
     но только когда смотрим текущую неделю. */
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  let html = "";

  for (const day of days) {

    /* Дата этого дня: понедельник плюс его место в неделе. */
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + weekOrder.indexOf(day.name));

    /* Отбор пар по неделе: без пометки — идут всегда. */
    let rows = "";

    for (const lesson of day.lessons) {
      if (lesson.week === undefined || lesson.week === parity) {

        /* Время приходит одной строкой: "10:10–11:40".
           Разрезаем на начало и конец и кладём в ДВА кусочка.

           Зачем: на телефоне они встают друг под друга, и столбец
           времени сужается вдвое. Текстом это сделать нельзя —
           CSS не умеет разрезать строку, только расставлять готовые куски.

           split — "разрезать по разделителю". В квадратных скобках
           два вида тире: длинное и короткое, в данных встречаются оба.
           trim — "обрезать" лишние пробелы по краям. */
        const chasti  = lesson.time.split(/[–-]/);
        const nachalo = chasti[0].trim();
        const konec   = (chasti[1] || "").trim();
        const details = lesson.details
          ? `<details class="lesson-details"><summary>Подгруппы</summary>${escapeScheduleText(lesson.details)}</details>`
          : "";

        /* Плашка "лекция" или "семинар". Тип приходит готовым из data.js:
           страница не знает, как он вычислен. Пустой тип — плашки нет
           (служебные блоки вроде физвоспитания). */
        const tip = lesson.type
          ? `<span class="lesson-type type-${lesson.type}">${escapeScheduleText(lesson.type)}</span>`
          : "";

        rows = rows + `
          <tr>
            <td class="time"><span class="from">${escapeScheduleText(nachalo)}</span><span class="to">${escapeScheduleText(konec)}</span></td>
            <td class="subject">${escapeScheduleText(lesson.subject)}${tip}${details}</td>
            <td class="room">${escapeScheduleText(lesson.room)}</td>
            <td class="teacher">${escapeScheduleText(lesson.teacher)}</td>
          </tr>`;
      }
    }

    if (rows !== "") {
      let dayClass = "day";

      if (dayDate.getTime() === todayDate.getTime()) {
        dayClass = "day today";
      }

      const dateLabel = dayDate.toLocaleDateString("ru-RU",
                        { day: "numeric", month: "long" });

      html = html + `<div class="${dayClass}">
          <h3>${day.name} <span class="day-date">${dateLabel}</span></h3>
          <table>` + rows + `</table></div>`;
    }
  }

  /* Шапка столбцов. */
  html = `
    <div class="schedule-head">
      <table>
        <tr>
          <th>Время</th>
          <th>Предмет</th>
          <th>Аудитория</th>
          <th>Преподаватель</th>
        </tr>
      </table>
    </div>` + html;

  /* Строка листания: стрелки и диапазон дат показываемой недели. */
  let range = "";
  if (monday.getMonth() === sunday.getMonth()) {
    range = monday.getDate() + "–" +
            sunday.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  } else {
    range = monday.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) +
            " – " +
            sunday.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  }

  let todayButton = "";
  if (weekOffset !== 0) {
    todayButton = `<button onclick="goToday()">Сегодня</button>`;
  }

  html = `
    <div class="week-nav">
      <button class="arrow" onclick="moveWeek(-1)" title="Предыдущая неделя">←</button>
      <span class="week-range">${range}</span>
      <button class="arrow" onclick="moveWeek(1)" title="Следующая неделя">→</button>
      ${todayButton}
    </div>` + html;

  document.getElementById("schedule-body").innerHTML = html;
}
initSchedule();


/* ---------- ПРЕПОДАВАТЕЛИ ---------- */

/* Карточки преподавателей со ссылкой "написать письмо".

   mailto: — ссылка, которая открывает окно нового письма
   в почтовой программе человека. Само письмо она НЕ отправляет.

   После ? можно дописать тему: subject=...
   encodeURIComponent — превратить текст в вид, пригодный для адреса:
   в адресах нельзя как есть писать пробелы и кириллицу. */

async function showTeachers() {
  const select = document.getElementById("schedule-group");
  const group  = select ? select.value : "";
  const mesto  = document.getElementById("teachers-body");

  /* Группа не выбрана — показывать нечего: у каждой группы свои люди. */
  if (group === "") {
    mesto.innerHTML = `<p class="no-group">Выберите группу в разделе «Расписание» —
      и здесь появятся преподаватели, которые у неё ведут.</p>`;
    return;
  }

  const list = await getTeachers(group);

  let html = `<p class="teachers-group">Группа ${escapeScheduleText(group)} ·
    ${list.length} преподавателей по расписанию</p>`;

  for (const t of list) {

    /* Предметы: их может быть несколько — лекция и семинар у одного
       человека, или два разных курса. */
    const subjects = t.subjects.map(escapeScheduleText).join(" · ");

    /* Почта. Адрес известен не у всех — у большинства пока ни у кого.
       Нет адреса, нет и кнопок: приём из решения 9. */
    let pochta = "";

    if (t.email !== "") {
      let mailButton = "";

      if (settings.webmailCompose !== "") {
        /* Подставляется только получатель. Тему человек пишет сам —
           так решено 23.09.2026.

           encodeURIComponent — привести текст к виду, пригодному
           для адреса: пробелы и кириллицу в адресах писать нельзя. */
        const mailUrl = settings.webmailCompose
                          .replace("{to}", encodeURIComponent(t.email));

        mailButton = `<a class="mail-link" href="${mailUrl}" target="_blank">Написать в почте вуза</a>`;
      }

      pochta = `
        <p class="teacher-mail">${escapeScheduleText(t.email)}</p>
        <div class="teacher-actions">
          ${mailButton}
          <button class="copy-link" onclick="copyEmail('${escapeScheduleText(t.email)}', this)">Скопировать адрес</button>
        </div>`;
    }

    html = html + `
      <div class="teacher">
        <h3>${escapeScheduleText(t.name)}</h3>
        <p class="teacher-subject">${subjects}</p>
        ${pochta}
      </div>`;
  }

  mesto.innerHTML = html;
}


/* copyEmail — положить адрес в буфер обмена.

   navigator.clipboard — доступ к буферу. Браузер даёт его не всегда,
   поэтому результат проверяем и сообщаем человеку прямо на кнопке.

   button — сама кнопка, по которой щёлкнули (приходит через this). */

async function copyEmail(email, button) {
  const wasText = button.textContent;

  try {
    await navigator.clipboard.writeText(email);
    button.textContent = "Скопировано";
  } catch (error) {
    button.textContent = "Не вышло — выделите вручную";
  }

  /* Через две секунды вернуть прежнюю надпись.
     setTimeout — "выполнить это позже, через столько-то миллисекунд". */
  setTimeout(function () {
    button.textContent = wasText;
  }, 2000);
}



/* Вызвать при загрузке страницы: */
openFromAddress();

/* И просить браузер сообщать, когда адрес меняется, —
   например, когда нажали "назад". Страница при этом не перезагружается,
   поэтому сам по себе никто бы этого не заметил.

   Скобок после имени функции НЕТ: мы передаём саму функцию, а не её ответ.
   Вызовет её браузер, позже. */

window.onhashchange = openFromAddress;
