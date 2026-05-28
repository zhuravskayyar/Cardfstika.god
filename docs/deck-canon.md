# Канон карт і бойової колоди

Цей файл має пріоритет для реалізації карт, бойової колоди, HP, колекцій і UI колоди.

Повна canvas-документація містить:
- рушій автоматичної колоди;
- правила сили, HP і слабких карт;
- 6 рідкостей;
- 4 стихії;
- 20 колекцій по 9 карт;
- повний список 180 карт з іменами, стихіями, рідкістю і належністю до колекцій;
- стартові 9 карт;
- базові приклади `cards.js`, `collections.js`, `deckEngine.js`;
- правила для UI колоди.

## Основні правила

- Бойова колода не вибирається вручну.
- Бойова колода автоматично збирається з 9 найсильніших карт гравця.
- Усі інші карти, які не потрапили в топ-9 за силою, належать до слабких карт.
- HP у дуелі дорівнює сумарній силі 9 карт бойової колоди.
- Бонуси дають тільки зібрані колекції.
- Окремі карти самі по собі не дають бонусів.

## Структура карт

- У грі 180 карт.
- Є 4 стихії.
- Є 6 рідкостей.
- Є 20 колекцій.
- Кожна колекція містить 9 карт.
- Кожна карта має ім'я, стихію, рідкість і належність до колекції.

## Реалізаційні правила

- Для логіки автоколоди використовувати окремий `deckEngine`: приймає список карт і повертає 9 найсильніших карт, відсортованих за силою.
- HP дуелі рахувати тільки через суму сили карт, які повернув рушій бойової колоди.
- Не додавати ручне керування складом бойової колоди в UI.
- UI колоди має показувати бойову колоду як результат автоматичного вибору, а не як editable список.
- Слабкі карти показувати окремо від бойової колоди.
- Бонуси колекцій рахувати на рівні колекцій: бонус активний тільки якщо виконана умова зібраної колекції.
- Не прив'язувати бонуси до окремих карт.

## Стартові дані

- Стартова колода містить 9 карт.
- Якщо потрібно реалізувати стартовий стан, використовувати стартові 9 карт з canvas-документації.
- Якщо повний список 180 карт ще не перенесений у репозиторій, не вигадувати імена, стихії, рідкості або колекції.

## Пріоритет над старою довідкою

Якщо `docs/card-rules.md` суперечить цьому файлу, для поточної гри використовувати цей файл.

Ключове уточнення: у цій реалізації HP у дуелі = сума сили саме 9 карт автоматичної бойової колоди. Не додавати до HP додаткові карти, драконів, спорядження чи інші джерела, якщо це окремо не внесено в актуальний канон.

## Framed card UI canon

- All framed cards in the deck, open-card preview, shop reward previews, duel framed previews, and future framed-card screens must use the shared `CardSlot` component and `src/styles/components/CardSlot.css` internal geometry.
- Screen CSS may set only external card size through `--card-w` / `--card-h`; it must not redefine `.card-slot__power`, `.card-slot__art`, `.card-slot__frame`, `.card-slot__element`, or `.card-slot__element-icon`.
- The element badge belongs to the shared `CardSlot` bottom-right placement and must not be repositioned per screen.
- The power value is a text-only overlay in the frame's built-in top-left power slot. Do not insert a separate power icon inside framed cards.
- Collection card views are the explicit exception: they do not use the framed card treatment.

### 1024x1536 frame coordinates

- Art: x 126-886, y 318-1218.
- Power: x 310-850, y 105-210. This zone contains only the card power number.
- Name: x 190-750, y 1245-1315. Do not place the name in the top power slot.
- Element badge: x 747-937, y 1158-1348. This zone contains only the element icon.
