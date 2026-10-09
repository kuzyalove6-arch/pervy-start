import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check,
  CheckCircle2, ChevronDown, Clock3, Heart, MapPin, Menu, Search,
  ShieldCheck, SlidersHorizontal, Sparkles, Users, X,
} from 'lucide-react'
import { groups, sports, type Group, type Sport } from './data'
import { MUNICIPAL_SOURCE, schools, type School } from './schools'
import { directoryEntries, type DirectoryEntry } from './directory'
import { sportMedia } from './sportMedia'
import OpenTrainings from './OpenTrainings'

type Application = {
  id: string
  groupId: number
  parentName: string
  phone: string
  childName: string
  childAge: number
  comment: string
  createdAt: string
  status: 'Новая' | 'В работе' | 'Связались'
}

const STORAGE_KEY = 'pervy-start-applications-v2'

function loadApplications(): Application[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function scrollToCatalog() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
}

function App() {
  const [verticalLayout, setVerticalLayout] = useState(() => new URLSearchParams(window.location.search).get('layout') !== 'classic')
  const [view, setView] = useState<'home' | 'school'>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState<Sport | 'Все виды'>('Все виды')
  const [showAll, setShowAll] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [bookingGroup, setBookingGroup] = useState<Group | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [applications, setApplications] = useState<Application[]>(loadApplications)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  useEffect(() => {
    if (!selectedSchool && !bookingGroup && !selectedSport) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSchool(null)
        setSelectedSport(null)
        setBookingGroup(null)
        setBookingSuccess(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedSchool, bookingGroup, selectedSport])

  const filteredSchools = useMemo(() => schools.filter((school) => {
    const query = search.trim().toLocaleLowerCase('ru')
    return (!query || [school.name, school.address, school.director, ...school.sports].some((field) => field.toLocaleLowerCase('ru').includes(query)))
      && (sport === 'Все виды' || school.sports.includes(sport))
  }), [search, sport])

  const visibleSchools = showAll ? filteredSchools : filteredSchools.slice(0, 6)
  const selectedSportInfo = sports.find((item) => item.name === sport)
  const hasFilters = search !== '' || sport !== 'Все виды'

  function clearFilters() {
    setSearch('')
    setSport('Все виды')
    setShowAll(false)
  }

  function pickSport(value: Sport) {
    setSport(value)
    setSelectedSport(null)
    setShowAll(false)
    scrollToCatalog()
  }

  function openBooking(group: Group) {
    setBookingSuccess(false)
    setBookingGroup(group)
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!bookingGroup) return
    const form = new FormData(event.currentTarget)
    const application: Application = {
      id: crypto.randomUUID(), groupId: bookingGroup.id,
      parentName: String(form.get('parentName')).trim(),
      phone: String(form.get('phone')).trim(),
      childName: String(form.get('childName')).trim(),
      childAge: Number(form.get('childAge')),
      comment: String(form.get('comment')).trim(),
      createdAt: new Date().toISOString(), status: 'Новая',
    }
    setApplications((current) => [application, ...current])
    setBookingSuccess(true)
  }

  function switchView(next: 'home' | 'school') {
    setView(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function switchLayout(vertical: boolean) {
    setVerticalLayout(vertical)
    const url = new URL(window.location.href)
    if (vertical) url.searchParams.delete('layout')
    else url.searchParams.set('layout', 'classic')
    window.history.replaceState(null, '', url)
  }

  return (
    <div className={verticalLayout ? 'layout-vertical' : 'layout-classic'}>
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand" onClick={() => switchView('home')} aria-label="Первый старт — на главную">
            <span className="brand-symbol"><ArrowUpRight size={23} strokeWidth={3} /></span>
            <span>первый<span className="brand-accent">старт</span><span className="brand-dot">.</span></span>
          </button>
          <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Основная навигация">
            <button onClick={() => { switchView('home'); setTimeout(scrollToCatalog, 60) }}>Спортшколы</button>
            <button onClick={() => { switchView('home'); setTimeout(() => document.getElementById('open-trainings')?.scrollIntoView({ behavior: 'smooth' }), 60) }}>Открытые тренировки</button>
            <button onClick={() => { switchView('home'); setTimeout(() => document.getElementById('sports')?.scrollIntoView({ behavior: 'smooth' }), 60) }}>Виды спорта</button>
            <button onClick={() => { switchView('home'); setTimeout(() => document.getElementById('young-coaches')?.scrollIntoView({ behavior: 'smooth' }), 60) }}>Новые группы</button>
          </nav>
          <button className="header-school" onClick={() => switchView(view === 'school' ? 'home' : 'school')}>
            {view === 'school' ? 'Для родителей' : 'Для спортшкол'} <ArrowUpRight size={16} />
          </button>
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="layout-switch"><div className="container layout-switch-inner"><span>Вид страницы</span><div className="layout-switch-options" role="group" aria-label="Компоновка сайта"><button aria-pressed={verticalLayout} className={verticalLayout ? 'active' : ''} onClick={() => switchLayout(true)}>Вертикальная</button><button aria-pressed={!verticalLayout} className={!verticalLayout ? 'active' : ''} onClick={() => switchLayout(false)}>Версия лентой</button></div></div></div>

      {view === 'home' ? (
        <main>
          <section className="hero">
            <div className="container hero-grid">
              <div className="hero-copy">
                <span className="eyebrow"><span className="eyebrow-dot" /> ЛУГАНСК · СПОРТ ДЛЯ ДЕТЕЙ</span>
                <h1>У каждого таланта есть <span>свой первый старт<span className="hero-period">.</span></span></h1>
                <p>Спортшколы города, разные виды спорта и новые группы молодых тренеров — в одном месте. Познакомьтесь, сравните и выберите путь для ребёнка.</p>
                <div className="hero-actions">
                  <button className="button button-dark" onClick={scrollToCatalog}>Смотреть спортшколы <ArrowUpRight size={19} /></button>
                  <button className="text-link" onClick={() => document.getElementById('sports')?.scrollIntoView({ behavior: 'smooth' })}>Узнать о спорте <ArrowDown size={16} /></button>
                </div>
                <div className="hero-proof"><span className="proof-icon"><Heart size={18} fill="currentColor" /></span><span>Каждому ребёнку — свой спорт и свой тренер</span></div>
              </div>
              <div className="hero-visual">
                <div className="hero-image" role="img" aria-label="Ребёнок выбирает спорт: вокруг него по кругу футбольный и баскетбольный мячи, ракетка, плавательные очки и гимнастическая лента" />
                <div className="hero-sticker">Выбирай<br />своё! <span>✳</span></div>
                <div className="hero-float"><span className="float-icon"><Check size={19} strokeWidth={3} /></span><div><strong>Разные виды спорта</strong><small>Один уверенный первый шаг</small></div></div>
                <span className="hero-sparkle sparkle-one">✳</span><span className="hero-sparkle sparkle-two">✳</span>
              </div>
            </div>
          </section>

          <OpenTrainings />

          <section id="young-coaches" className="featured-section section-pad">
            <div className="container">
              <div className="section-heading"><div><span className="section-kicker">НОВЫЕ ГРУППЫ МОЛОДЫХ ТРЕНЕРОВ</span><h2>Новые группы. Вашего ребёнка ждут.</h2><p>Здесь будут самые заметные предложения молодых тренеров, которые набирают новые группы.</p></div><span className="featured-mark"><Sparkles size={17} /> НОВЫЙ СТАРТ</span></div>
              <div className="featured-grid">{groups.filter((group) => group.newGroup).map((group) => <article className="featured-card" key={group.id}><div className="featured-top"><span><Sparkles size={15} /> НОВАЯ ГРУППА · ПРИМЕР</span><ArrowUpRight size={22} /></div><span className="featured-sport">{sports.find((item) => item.name === group.sport)?.emoji} {group.sport}</span><h3>{group.title}</h3><p>Тренер набирает новую группу. Здесь может начаться спортивная история вашего ребёнка.</p><div className="featured-details"><span><Users size={15} /> {group.ageMin}–{group.ageMax} лет</span><span><MapPin size={15} /> Луганск · адрес уточняется</span></div><div className="featured-actions"><span>Пример карточки тренера</span><button onClick={() => openBooking(group)}>Записаться <ArrowUpRight size={17} /></button></div></article>)}</div>
            </div>
          </section>

          <section id="sports" className="sports-section section-pad">
            <div className="container">
              <div className="section-heading"><div><span className="section-kicker">ПОЗНАКОМИМСЯ ПОБЛИЖЕ</span><h2>Спорт, который вдохновляет</h2><p>Откройте вид спорта, чтобы понять, что он даст ребёнку.</p></div><button className="section-link" onClick={scrollToCatalog}>Каталог школ <ArrowUpRight size={18} /></button></div>
              <div className="sports-grid">{sports.map((item) => <button key={item.name} className={`sport-tile ${item.color}`} onClick={() => setSelectedSport(item.name)}><span className="sport-emoji" aria-hidden="true">{item.emoji}</span><span className="sport-info"><strong>{item.name}</strong><small>{item.description}</small></span><span className="sport-arrow"><ArrowUpRight size={19} /></span></button>)}</div>
            </div>
          </section>

          <section id="catalog" className="catalog-section section-pad">
            <div className="container">
              <div className="section-heading catalog-heading"><div><span className="section-kicker">ОРГАНИЗАЦИИ ИЗ ГОРОДСКОГО ПЕРЕЧНЯ</span><h2>Спортивные школы Луганска</h2><p>Реальные организации, адреса и телефоны из опубликованной таблицы администрации города.</p></div><span className="catalog-count">Луганск <span>·</span> {schools.length} организаций</span></div>
              <div className="catalog-notice"><ShieldCheck size={22} /><div><strong>Данные из официального перечня</strong><span>Указан юридический адрес — место тренировок может отличаться. Возраст приёма, требования и действующий набор не опубликованы: уточняйте их по телефону школы. <a href={MUNICIPAL_SOURCE} target="_blank" rel="noopener noreferrer">Открыть источник ↗</a></span></div></div>
              <div className="filter-panel">
                <label className="filter-search"><Search size={20} /><input value={search} onChange={(event) => { setSearch(event.target.value); setShowAll(false) }} placeholder="Название школы, вид спорта или адрес" aria-label="Поиск спортшкол" /></label>
                <label className="select-wrap"><span className="sr-only">Подтверждённое направление</span><select value={sport} onChange={(event) => { setSport(event.target.value as Sport | 'Все виды'); setShowAll(false) }}><option>Все виды</option>{sports.map((item) => <option key={item.name}>{item.name}</option>)}</select><ChevronDown size={17} /></label>
              </div>
              <div className="filter-bottom"><span className="filter-hint">Направления школ без подтверждённых сведений пока не указаны в фильтре.</span><div className="filter-meta"><SlidersHorizontal size={15} /> Найдено: {filteredSchools.length}{hasFilters && <button onClick={clearFilters}>Сбросить фильтры</button>}</div></div>
              {selectedSportInfo && <div className={`sport-insight ${selectedSportInfo.color}`}><span className="insight-emoji" aria-hidden="true">{selectedSportInfo.emoji}</span><div><span className="section-kicker">ЗНАКОМСТВО СО СПОРТОМ</span><h3>{selectedSportInfo.name} — что важно знать</h3><p>{selectedSportInfo.about}</p><strong>{selectedSportInfo.benefits}</strong></div></div>}
              {filteredSchools.length ? <><div className="group-grid">{visibleSchools.map((school) => <SchoolCard key={school.id} school={school} onDetails={() => setSelectedSchool(school)} />)}</div>{filteredSchools.length > 6 && <button className="button button-outline show-more" onClick={() => setShowAll(!showAll)}>{showAll ? 'Свернуть' : `Показать ещё ${filteredSchools.length - 6}`} <ArrowRight size={18} /></button>}</> : <div className="empty-state"><span>🔎</span><h3>Подтверждённых совпадений нет</h3><p>У части школ направления пока неизвестны. Посмотрите полный список или уточните программу по телефону.</p><button className="button button-dark" onClick={clearFilters}>Показать все школы</button></div>}
              <p className="demo-note">Новые группы молодых тренеров выше — демонстрация формата, не объявления этих школ.</p>
            </div>
          </section>

          <section className="directory-section section-pad" id="directory"><div className="container"><div className="section-heading"><div><span className="section-kicker">ДОПОЛНИТЕЛЬНЫЕ ВАРИАНТЫ</span><h2>Клубы и студии из справочника</h2><p>Записи об организациях Луганска, которых нет в городском перечне выше.</p></div></div><div className="catalog-notice"><ShieldCheck size={22} /><div><strong>Сведения требуют уточнения</strong><span>Справочник не подтверждает частный юридический статус, актуальность адресов и телефонов, детские занятия или открытый набор. Уточните информацию непосредственно у организации перед визитом.</span></div></div><div className="directory-grid">{directoryEntries.map((entry) => <DirectoryCard key={entry.source} entry={entry} />)}</div></div></section>

          <section className="coach-section"><div className="container coach-inner"><div className="coach-icon">✳</div><div className="coach-copy"><span className="section-kicker">СВЯЗЬ ШКОЛЫ И СЕМЬИ</span><h2>Сильный старт начинается со встречи.</h2><p>Знакомимся со школой, узнаём об условиях занятий и находим тренера, с которым ребёнку хочется расти.</p><button className="button button-light" onClick={scrollToCatalog}>Открыть каталог школ <ArrowUpRight size={18} /></button></div><div className="coach-graphic"><div className="graphic-circle"><span>НОВОЕ<br />НАЧАЛО</span><ArrowUpRight size={100} strokeWidth={1.5} /></div><span className="graphic-star">✳</span></div></div></section>

          <section id="how-it-works" className="steps-section section-pad"><div className="container"><div className="section-heading"><div><span className="section-kicker">ПРОСТО И ПОНЯТНО</span><h2>Три шага к первому старту</h2><p>От знакомства со спортом — до встречи со школой.</p></div></div><div className="steps-grid"><div className="step"><span className="step-number">01</span><div className="step-icon peach"><Search size={27} /></div><h3>Познакомьтесь со спортом</h3><p>Узнайте, чем отличаются направления и что интересно ребёнку.</p></div><div className="step"><span className="step-number">02</span><div className="step-icon lavender"><CalendarDays size={27} /></div><h3>Изучите школу</h3><p>Проверьте возраст, место, требования и условия приёма в карточке.</p></div><div className="step"><span className="step-number">03</span><div className="step-icon mint"><Heart size={27} /></div><h3>Сделайте первый шаг</h3><p>Когда школы подключатся, оставьте заявку на знакомство или пробное занятие.</p></div></div></div></section>

          <section className="bottom-cta"><div className="container bottom-cta-inner"><div><span className="section-kicker">ПОРА ПОПРОБОВАТЬ</span><h2>У каждого чемпиона<br />был первый день.</h2><p>Начните с простого — найдите занятие, которое зажжёт интерес.</p></div><button className="button button-dark" onClick={scrollToCatalog}>Выбрать секцию <ArrowUpRight size={19} /></button><span className="cta-decor">✳</span></div></section>
        </main>
      ) : (
        <main className="dashboard"><div className="container"><button className="back-link" onClick={() => switchView('home')}><ArrowLeft size={18} /> На главную</button><div className="dashboard-heading"><div><span className="section-kicker">ДЛЯ СПОРТИВНЫХ ШКОЛ</span><h1>Заявки на занятия<span className="hero-period">.</span></h1><p>Демонстрационный кабинет: заявки сохраняются в этом браузере.</p></div><div className="dashboard-stat"><span>Новых заявок</span><strong>{applications.filter((item) => item.status === 'Новая').length}</strong></div></div><div className="dashboard-info"><ShieldCheck size={20} /><span>Это демоверсия. Чтобы получать реальные заявки от родителей, понадобится подключить сервер, аккаунты школ и уведомления.</span></div><div className="dashboard-list-heading"><h2>Все обращения <span>{applications.length}</span></h2></div>{applications.length ? <div className="application-list">{applications.map((application) => { const group = groups.find((item) => item.id === application.groupId); return <article className="application-card" key={application.id}><div className="application-top"><div><span className="application-date">{new Date(application.createdAt).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}</span><h3>{application.parentName}</h3><p>{group?.title} · {group?.school}</p></div><span className={`status status-${application.status === 'Новая' ? 'new' : application.status === 'В работе' ? 'progress' : 'done'}`}>{application.status}</span></div><div className="application-details"><span>Телефон: <a href={`tel:${application.phone}`}>{application.phone}</a></span><span>Ребёнок: {application.childName}, {application.childAge} лет</span>{application.comment && <span>Комментарий: {application.comment}</span>}</div><div className="application-actions"><span>Статус обращения</span><select aria-label={`Статус заявки от ${application.parentName}`} value={application.status} onChange={(event) => setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: event.target.value as Application['status'] } : item))}><option>Новая</option><option>В работе</option><option>Связались</option></select></div></article> })}</div> : <div className="dashboard-empty"><span>✳</span><h3>Пока нет заявок</h3><p>Запишитесь на пробное занятие через каталог, чтобы увидеть, как здесь появится обращение.</p><button className="button button-dark" onClick={() => { switchView('home'); setTimeout(scrollToCatalog, 60) }}>Перейти в каталог <ArrowUpRight size={18} /></button></div>}</div></main>
      )}

      <footer className="site-footer"><div className="container footer-top"><div><button className="brand footer-brand" onClick={() => switchView('home')}><span className="brand-symbol"><ArrowUpRight size={23} strokeWidth={3} /></span><span>первый<span className="brand-accent">старт</span><span className="brand-dot">.</span></span></button><p>Помогаем найти своё место в спорте.<br />Один первый шаг за раз.</p></div><div className="footer-links"><div><strong>Платформа</strong><button onClick={() => { switchView('home'); setTimeout(scrollToCatalog, 60) }}>Найти секцию</button><button onClick={() => { switchView('home'); setTimeout(() => document.getElementById('sports')?.scrollIntoView({ behavior: 'smooth' }), 60) }}>Виды спорта</button></div><div><strong>Для партнёров</strong><button onClick={() => switchView('school')}>Кабинет школы</button><button onClick={() => switchView('school')}>Заявки родителей</button></div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Первый старт</span><span>Сделано с любовью к первым шагам <Heart size={13} fill="currentColor" /></span></div></footer>

      {selectedSport && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSport(null) }}><div className="sport-modal" role="dialog" aria-modal="true" aria-labelledby="sport-modal-title"><button className="modal-close" onClick={() => setSelectedSport(null)} aria-label="Закрыть"><X size={22} /></button>{sports.filter((item) => item.name === selectedSport).map((item) => <div key={item.name}><SportPresentation key={item.name} item={item} /><div className="sport-modal-body"><span className="section-kicker">ВИД СПОРТА · ПЕРВОЕ ЗНАКОМСТВО</span><h2 id="sport-modal-title">{item.name}</h2><p className="sport-lead">{item.description}</p><p>{item.about}</p><div className="sport-benefits"><strong>Что развивает</strong><span>{item.benefits}</span></div><button className="button button-dark" onClick={() => pickSport(item.name)}>Посмотреть школы с этим видом спорта <ArrowUpRight size={18} /></button></div></div>)}</div></div>}
      {selectedSchool && <SchoolDetail school={selectedSchool} onClose={() => setSelectedSchool(null)} />}

      {bookingGroup && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setBookingGroup(null); setBookingSuccess(false) } }}><div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" onClick={() => { setBookingGroup(null); setBookingSuccess(false) }} aria-label="Закрыть"><X size={22} /></button>{bookingSuccess ? <div className="booking-success"><span className="success-icon"><CheckCircle2 size={43} /></span><h2 id="booking-title">Первый шаг сделан!</h2><p>Демонстрационная заявка на занятие «{bookingGroup.title}» сохранена в этом браузере. Её можно увидеть в демо-кабинете школы.</p><button className="button button-dark" onClick={() => { setBookingGroup(null); setBookingSuccess(false); switchView('school') }}>Посмотреть заявку <ArrowUpRight size={18} /></button><button className="success-back" onClick={() => { setBookingGroup(null); setBookingSuccess(false) }}>Вернуться к школам</button></div> : <><span className="section-kicker">ДЕМОНСТРАЦИЯ ЗАПИСИ</span><h2 id="booking-title">Как будет работать запись</h2><p className="booking-intro">Это пример формы для группы «{bookingGroup.title}». Пока реального набора нет: заявка останется только в вашем браузере. Для проверки используйте тестовые данные.</p><form onSubmit={submitBooking} className="booking-form"><label>Ваше имя <input name="parentName" required maxLength={80} autoComplete="name" placeholder="Как к вам обращаться" /></label><label>Номер телефона <input name="phone" type="tel" required minLength={7} maxLength={25} autoComplete="tel" placeholder="+7 999 123-45-67" /></label><div className="form-row"><label>Имя ребёнка <input name="childName" required maxLength={80} placeholder="Имя" /></label><label>Возраст <select name="childAge" required defaultValue=""><option value="" disabled>Выберите</option>{Array.from({ length: bookingGroup.ageMax - bookingGroup.ageMin + 1 }, (_, i) => bookingGroup.ageMin + i).map((value) => <option key={value} value={value}>{value} лет</option>)}</select></label></div><label>Комментарий <span className="optional">необязательно</span><textarea name="comment" maxLength={500} placeholder="Что важно знать тренеру?" rows={3} /></label><label className="consent"><input type="checkbox" required /><span>Согласен(на) сохранить тестовые данные заявки в этом браузере</span></label><button className="button button-dark booking-submit" type="submit">Создать демо-заявку <ArrowUpRight size={19} /></button><p className="booking-disclaimer">Заявка не отправляется спортивной школе.</p></form></>}</div></div>}
    </div>
  )
}

function SportPresentation({ item }: { item: (typeof sports)[number] }) {
  const media = sportMedia[item.name]
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  return <>
    <div className={`sport-presentation ${item.color}`}>
      <img className="presentation-poster" src={item.photo} alt={`Иллюстрация вида спорта: ${item.name}`} />
      {media && !failed && <video className={`presentation-video ${playing ? 'is-playing' : ''}`} src={media.src} autoPlay muted loop playsInline preload="metadata" onPlaying={() => setPlaying(true)} onError={() => setFailed(true)} onTimeUpdate={(event) => { if (event.currentTarget.currentTime >= 9) event.currentTarget.currentTime = 0 }} aria-label={`${item.name}: ${media.moment}`} />}
      <div className="presentation-shade" />
      <div className="presentation-caption"><span className="presentation-tag">{playing ? '● МОМЕНТ В ДВИЖЕНИИ' : '✳ ЗНАКОМСТВО СО СПОРТОМ'}</span><strong>{media?.moment ?? item.description}</strong><small>Представь, что следующий шаг — твой.</small></div>
    </div>
    <div className="presentation-credit">{playing && media ? <a href={media.source} target="_blank" rel="noopener noreferrer">Видео: {media.credit} · Wikimedia Commons ↗</a> : item.photoSource ? <a href={item.photoSource} target="_blank" rel="noopener noreferrer">{item.photoCredit} ↗</a> : <span>Иллюстративный кадр · {media ? 'видео загружается или недоступно' : 'видеокадр пока недоступен'}</span>}</div>
  </>
}

function DirectoryCard({ entry }: { entry: DirectoryEntry }) {
  return <article className="directory-card"><span className="directory-type">{entry.category}</span><h3>{entry.name}</h3>{entry.sport && <span className="directory-sport">{entry.sport}</span>}<p><MapPin size={16} /> г. Луганск, {entry.address} <small>адрес из справочника</small></p><div className="directory-actions">{entry.phone ? <a href={`tel:${entry.phone.replace(/[^+\d]/g, '')}`}>{entry.phone}</a> : <span>Телефон не указан</span>}<a href={entry.source} target="_blank" rel="noopener noreferrer">Запись в справочнике <ArrowUpRight size={15} /></a></div></article>
}

function SchoolCard({ school, onDetails }: { school: School; onDetails: () => void }) {
  const mainSport = sports.find((item) => school.sports.includes(item.name))
  return <article className="group-card school-card"><button className="card-image school-image" style={mainSport ? { backgroundImage: `linear-gradient(180deg, #0c291020, #0c291040), url('${mainSport.photo}')` } : undefined} onClick={onDetails} aria-label={`Открыть карточку ${school.name}`}><span className="badge-new">ИЗ ГОРОДСКОГО ПЕРЕЧНЯ</span>{mainSport ? <span className="school-photo-note">Иллюстрация вида спорта</span> : <span className="school-image-mark">✳</span>}<span className="card-image-arrow"><ArrowUpRight size={20} /></span></button><div className="card-body"><div className="card-label-row"><span className="sport-label">{school.type}</span></div><button className="card-title" onClick={onDetails}>{school.name}</button><p className="card-school">{school.sports.length ? school.sports.join(' · ') : 'Направления уточняются в организации'}</p><div className="card-facts"><span><MapPin size={16} /> {school.address} · юридический адрес</span><span><Users size={16} /> Возраст и набор уточняются по телефону</span></div><div className="card-footer"><div><strong>{school.phone}</strong><small>Контакт из официального перечня</small></div><button className="card-open" onClick={onDetails}>О школе <ArrowUpRight size={16} /></button></div></div></article>
}

function SchoolDetail({ school, onClose }: { school: School; onClose: () => void }) {
  const mainSport = sports.find((item) => school.sports.includes(item.name))
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-close" onClick={onClose} aria-label="Закрыть"><X size={22} /></button><div className="detail-image school-detail-image" style={mainSport ? { backgroundImage: `linear-gradient(180deg, #0c291020, #0c291040), url('${mainSport.photo}')` } : undefined}><span className="badge-new">ДАННЫЕ АДМИНИСТРАЦИИ ЛУГАНСКА</span>{mainSport ? <span className="school-photo-note">Иллюстрация вида спорта · не фото школы</span> : <span className="school-image-mark">✳</span>}</div><div className="detail-content"><span className="detail-sport">{school.type.toLocaleUpperCase('ru')} · ЛУГАНСК</span><h2 id="detail-title">{school.name}</h2><p className="detail-school">{school.sports.length ? `Направления по названию школы: ${school.sports.join(', ')}` : 'Спортивные направления не указаны в городском перечне'}</p>{mainSport && <div className="school-sport-promo"><span aria-hidden="true">{mainSport.emoji}</span><div><strong>{mainSport.name}: знакомство с направлением</strong><p>{mainSport.about}</p><small>Описание спорта — общее, не программа школы</small></div></div>}<h3 className="detail-subtitle">Информация для родителей</h3><div className="detail-facts"><div><MapPin size={19} /><span><small>Юридический адрес</small>г. Луганск, {school.address}</span></div><div><Users size={19} /><span><small>Возраст приёма</small>Не опубликован — уточните по телефону</span></div><div><Clock3 size={19} /><span><small>Расписание и место тренировок</small>Не опубликованы — уточните в школе</span></div><div><CalendarDays size={19} /><span><small>Набор и стоимость</small>Не опубликованы — уточните в школе</span></div></div><div className="school-requirements"><strong>Требования для записи</strong><p>Сведения о документах, подготовке и пробном занятии отсутствуют в городском перечне. Уточните условия непосредственно в организации.</p></div><div className="detail-coach"><span className="coach-avatar"><Users size={20} /></span><div><small>Руководитель по городскому перечню</small><strong>{school.director}</strong><span>Данные о тренерах в перечне не опубликованы</span></div></div><div className="school-source">Источник: <a href={MUNICIPAL_SOURCE} target="_blank" rel="noopener noreferrer">администрация города Луганска ↗</a></div><div className="detail-footer"><div><strong>Уточните актуальный набор</strong><small>Позвоните перед посещением</small></div><a className="button button-dark" href={`tel:${school.phone.replace(/[^+\d]/g, '')}`}>Позвонить: {school.phone}</a></div></div></div></div>
}

export default App
