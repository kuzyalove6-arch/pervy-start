import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { schools } from './schools'

const examples = [
  { schoolId: 13, sport: 'Лёгкая атлетика', age: '8–12 лет', level: 'Начинающие', time: '11:00–12:00', coach: 'Тренер школы — имя уточняется', color: 'mint' },
  { schoolId: 10, sport: 'Баскетбол', age: '9–13 лет', level: 'Начинающие', time: '12:00–13:00', coach: 'Тренер школы — имя уточняется', color: 'clay' },
  { schoolId: 17, sport: 'Футбол', age: '7–11 лет', level: 'Любой уровень', time: '10:00–11:00', coach: 'Тренер школы — имя уточняется', color: 'sky' },
  { schoolId: 15, sport: 'Настольный теннис', age: '8–14 лет', level: 'Начинающие', time: '11:30–12:30', coach: 'Тренер школы — имя уточняется', color: 'sand' },
] as const

function buildExamples() {
  const today = new Date()
  const first = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  first.setDate(first.getDate() + (6 - first.getDay() + 7) % 7 + 7)
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(first)
    date.setDate(date.getDate() + Math.floor(index / 2) * 35 + (index % 2) * 14)
    return { ...examples[index % examples.length], id: index, date, school: schools.find((school) => school.id === examples[index % examples.length].schoolId)! }
  })
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function OpenTrainings() {
  const events = useMemo(buildExamples, [])
  const [month, setMonth] = useState(() => new Date(events[0].date.getFullYear(), events[0].date.getMonth(), 1))
  const [selectedId, setSelectedId] = useState<number | null>(events[0].id)
  const monthEvents = events.filter((event) => event.date.getFullYear() === month.getFullYear() && event.date.getMonth() === month.getMonth())
  const selected = events.find((event) => event.id === selectedId && monthEvents.includes(event))
  const firstWeekday = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const last = events[events.length - 1].date
  const canPrev = month.getFullYear() > events[0].date.getFullYear() || (month.getFullYear() === events[0].date.getFullYear() && month.getMonth() > events[0].date.getMonth())
  const canNext = month.getFullYear() < last.getFullYear() || (month.getFullYear() === last.getFullYear() && month.getMonth() < last.getMonth())

  function changeMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1)
    setMonth(next)
    setSelectedId(events.find((event) => event.date.getFullYear() === next.getFullYear() && event.date.getMonth() === next.getMonth())?.id ?? null)
  }

  return (
    <section id="open-trainings" className="open-training-section section-pad">
      <div className="container">
        <div className="training-intro">
          <div><span className="section-kicker">ПОПРОБУЙ ПЕРЕД ЗАПИСЬЮ</span><h2>Календарь открытых тренировок<span className="training-dot">.</span></h2><p>Удобный способ познакомиться с видом спорта и школой. Открывайте даты, чтобы увидеть подробности.</p></div>
          <div className="training-rhythm"><CalendarDays size={24} /><strong>Раз в 2–3 недели</strong><span>разные спортивные школы</span></div>
        </div>
        <p className="training-disclaimer"><strong>Демонстрационный календарь.</strong> Даты, время, возраст и участие школ приведены как примеры формата. Открытые тренировки пока не подтверждены; перед посещением необходимо уточнить расписание, адрес и условия в школе.</p>
        <div className="training-board">
          <div className="training-calendar">
            <div className="training-calendar-head"><div><span>РАСПИСАНИЕ · ПРИМЕР</span><h3>{monthFormat.format(month)}</h3></div><div className="training-month-controls"><button type="button" disabled={!canPrev} aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}><ArrowLeft size={18} /></button><button type="button" disabled={!canNext} aria-label="Следующий месяц" onClick={() => changeMonth(1)}><ArrowRight size={18} /></button></div></div>
            <div className="training-days" role="grid" aria-label={`Календарь: ${monthFormat.format(month)}`}>
              {weekdays.map((day) => <span className="training-weekday" key={day} role="columnheader">{day}</span>)}
              {Array.from({ length: firstWeekday }, (_, index) => <span className="training-empty" key={`blank-${index}`} />)}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1
                const event = monthEvents.find((item) => item.date.getDate() === day)
                return event ? <button type="button" key={day} className={`training-day has-event ${selectedId === event.id ? 'is-selected' : ''}`} aria-label={`${day} ${monthFormat.format(month)}: ${event.sport}, пример открытой тренировки`} aria-pressed={selectedId === event.id} onClick={() => setSelectedId(event.id)}><span>{day}</span><small>{event.sport}</small></button> : <span key={day} className="training-day" aria-label={`${day} ${monthFormat.format(month)}`}><span>{day}</span></span>
              })}
            </div>
            <div className="training-legend"><span className="training-legend-mark" /> Выделенные дни — примеры открытых тренировок</div>
          </div>
          <div className="training-detail" aria-live="polite">
            {selected ? <><span className={`training-detail-label ${selected.color}`}>ОТКРЫТАЯ ТРЕНИРОВКА · ПРИМЕР</span><span className="training-detail-date">{dateFormat.format(selected.date)} · суббота</span><h3>{selected.sport}</h3><p className="training-school">{selected.school.name}</p><div className="training-facts"><div><Clock3 size={18} /><span><small>Время (пример)</small><strong>{selected.time}</strong></span></div><div><MapPin size={18} /><span><small>Место проведения</small><strong>Луганск · площадка и адрес уточняются</strong></span></div><div><Users size={18} /><span><small>Кого приглашают (пример)</small><strong>{selected.age} · {selected.level}</strong></span></div><div><span className="training-coach-icon">✳</span><span><small>Кто проводит</small><strong>{selected.coach}</strong></span></div></div><p className="training-detail-foot">Это макет события, а не объявление школы. Проверьте возможность посещения непосредственно в школе.</p></> : <p>В этом месяце примеров тренировок нет. Выберите другой месяц.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
