import type { Sport } from './data'

// Записи справочника не подтверждают юридический статус, актуальность контактов или детский набор.
export type DirectoryEntry = { name: string; category: string; address: string; phone?: string; sport?: Sport; source: string }

export const directoryEntries: DirectoryEntry[] = [
  { name: 'Jumpfoot', category: 'Спортивная школа · категория справочника', address: 'ул. Лермонтова, 1Б', phone: '+380 (99) 747-04-76', source: 'https://lugansk.spravker.ru/sportivnye-shkoly/jumpfoot.htm' },
  { name: 'Киндерболл', category: 'Спортивная школа · категория справочника', address: 'Советская ул., 36', source: 'https://lugansk.spravker.ru/sportivnye-shkoly/kinderboll.htm' },
  { name: 'Fotballand', category: 'Спортивная школа · категория справочника', address: 'Оборонная ул., 103', phone: '+380 (725) 06-51-61', source: 'https://lugansk.spravker.ru/sportivnye-shkoly/fotballand.htm' },
  { name: 'Дзансин', category: 'Спортивный клуб · категория справочника', address: 'ул. Коцюбинского, 27', phone: '+380 (95) 500-02-33', source: 'https://lugansk.spravker.ru/sportivnye-kluby/dzansin.htm' },
  { name: 'Танцевальная студия Mix-Art', category: 'Школа танцев · категория справочника', address: 'Советская ул., 122', phone: '+380 (50) 664-81-16', sport: 'Танцы', source: 'https://lugansk.spravker.ru/shkoly-tancev/tantsevalnaya-studiya-mix-art.htm' },
]
