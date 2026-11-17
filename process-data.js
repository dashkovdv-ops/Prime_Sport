/* Presentation process revision v13. No catalogue execution authority. */
window.PRIME_PROCESS_DATA = {
  "width": 3500,
  "height": 2900,
  "nodes": [
    {
      "id": "look",
      "x": 60,
      "y": 190,
      "w": 340,
      "h": 340,
      "title": "Подбор товаров для лука",
      "kind": "human",
      "group": "preparation",
      "stage": "01",
      "summary": "Выбираем товары для будущего образа.",
      "detail": "Подбираем товары, которые войдут в лук для фото и видео."
    },
    {
      "id": "products",
      "x": 460,
      "y": 150,
      "w": 360,
      "h": 280,
      "title": "Формирование карточек товаров",
      "kind": "auto",
      "group": "preparation",
      "stage": "02",
      "summary": "Отдельная карточка для каждого товара.",
      "detail": "Система формирует карточки выбранных товаров по исходным фотографиям."
    },
    {
      "id": "model",
      "x": 460,
      "y": 470,
      "w": 360,
      "h": 260,
      "title": "Выбор модели",
      "kind": "human",
      "group": "preparation",
      "stage": "03",
      "summary": "Готовая модель из отдельного пула.",
      "detail": "Выбираем готовую модель из отдельного пула карточек."
    },
    {
      "id": "dress",
      "x": 880,
      "y": 190,
      "w": 390,
      "h": 340,
      "title": "Формируем карточку одетого персонажа",
      "kind": "auto",
      "group": "preparation",
      "stage": "04",
      "summary": "Модель + карточки выбранных товаров.",
      "detail": "Формируем карточку с посадкой вещи: выбранная модель в подобранных товарах. Результат проверяется отдельно."
    },
    {
      "id": "card-check",
      "x": 1330,
      "y": 190,
      "w": 370,
      "h": 340,
      "title": "Автоверификация",
      "kind": "auto",
      "group": "preparation",
      "stage": "05",
      "summary": "Сверка с загруженными исходниками.",
      "detail": "Система сверяет карточку одетого персонажа с исходными фотографиями модели и товаров."
    },
    {
      "id": "dressed",
      "x": 1760,
      "y": 190,
      "w": 370,
      "h": 340,
      "title": "Карточка образа",
      "kind": "auto",
      "group": "preparation",
      "stage": "06",
      "summary": "Образ для проверки товара и посадки.",
      "detail": "Карточка одетого образа, подготовленная к Product-проверке товара и посадки."
    },
    {
      "id": "product-fit",
      "x": 2190,
      "y": 190,
      "w": 390,
      "h": 340,
      "title": "Product-проверка образа и посадки",
      "kind": "human",
      "group": "fit",
      "stage": "07",
      "summary": "Проверяем товар, образ и посадку.",
      "detail": "Продакт проверяет соответствие товара, общий вид образа и посадку вещи."
    },
    {
      "id": "fit",
      "x": 2640,
      "y": 190,
      "w": 390,
      "h": 340,
      "title": "Посадка корректна?",
      "kind": "decision",
      "group": "fit",
      "stage": "08",
      "summary": "Да → согласованный образ. Нет → правки.",
      "detail": "Если посадка согласована, используем карточку образа для фото и видео. Если нет, корректируем образ или фотографируем вещь на манекене.",
      "actor": "human"
    },
    {
      "id": "retouch",
      "x": 1800,
      "y": 840,
      "w": 600,
      "h": 300,
      "title": "Ретушёр корректирует образ",
      "kind": "human",
      "group": "fit",
      "stage": "09А",
      "summary": "Корректировка согласно замечаниям.",
      "detail": "Ретушёр корректирует образ и посадку согласно замечаниям. Результат возвращается на Product-проверку образа и посадки."
    },
    {
      "id": "reshoot",
      "x": 2520,
      "y": 840,
      "w": 800,
      "h": 300,
      "title": "Фотографируем вещь на манекене",
      "kind": "human",
      "group": "fit",
      "stage": "09Б",
      "summary": "Новые фото → формирование карточки образа.",
      "detail": "Фотографируем вещь на манекене, проверяем и привязываем снимки к товару. Новые данные возвращаются на формирование карточки одетого персонажа, затем результат повторно проходит автоверификацию и Product-проверку."
    },
    {
      "id": "approved-card",
      "x": 180,
      "y": 840,
      "w": 1240,
      "h": 300,
      "title": "Согласованная карточка образа",
      "kind": "result",
      "group": "fit",
      "stage": "Образ",
      "summary": "Общая основа двух независимых веток.",
      "detail": "Одна согласованная карточка образа используется независимо для создания фото и видео."
    },
    {
      "id": "photo-products",
      "x": 100,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Выбор товаров",
      "kind": "human",
      "group": "photo",
      "stage": "Ф1",
      "summary": "Выбираем товары для фотографий.",
      "detail": "Выбираем товары, для которых создаём фотографии с согласованным образом."
    },
    {
      "id": "photo-angles",
      "x": 600,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Выбор ракурсов",
      "kind": "human",
      "group": "photo",
      "stage": "Ф2",
      "summary": "Выбираем необходимые ракурсы.",
      "detail": "Оператор выбирает ракурсы для фотографий выбранных товаров."
    },
    {
      "id": "photo-generate",
      "x": 1100,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Генерация фото",
      "kind": "auto",
      "group": "photo",
      "stage": "Ф3",
      "summary": "Карточка образа + ракурсы + товары.",
      "detail": "Система генерирует фотографии на основе согласованной карточки образа, выбранных ракурсов и товаров."
    },
    {
      "id": "photo-check",
      "x": 1600,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Автопроверка фото",
      "kind": "auto",
      "group": "photo",
      "stage": "Ф4",
      "summary": "Система проверяет результат.",
      "detail": "Система проверяет сгенерированные фотографии и передаёт результат оператору."
    },
    {
      "id": "photo-manual",
      "x": 2100,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Ручная верификация фотографии",
      "kind": "human",
      "group": "photo",
      "stage": "Ф5",
      "summary": "Оператор проверяет и корректирует нюансы.",
      "detail": "Оператор вручную проверяет фотографии и при необходимости корректирует нюансы в системе. Если этого недостаточно, передаёт фотографию ретушёру."
    },
    {
      "id": "photo-product",
      "x": 2600,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Product-согласование фото",
      "kind": "decision",
      "group": "photo",
      "stage": "Ф6",
      "summary": "Да → согласованное фото. Нет → правки.",
      "detail": "Продакт согласовывает фотографию. При отказе замечания возвращаются оператору на ручную верификацию и необходимые корректировки.",
      "actor": "human"
    },
    {
      "id": "photo-approved",
      "x": 3100,
      "y": 1320,
      "w": 330,
      "h": 340,
      "title": "Согласованное фото",
      "kind": "result",
      "group": "photo",
      "stage": "Ф7",
      "summary": "Финальный согласованный фотоматериал.",
      "detail": "Фотография прошла ручную верификацию и Product-согласование."
    },
    {
      "id": "photo-retouch",
      "x": 2160,
      "y": 1790,
      "w": 560,
      "h": 260,
      "title": "Ретушёр корректирует фото",
      "kind": "human",
      "group": "photo",
      "stage": "Ф5Р",
      "summary": "Помощь ретушёра при необходимости.",
      "detail": "Если нужные корректировки не удаётся выполнить в системе, оператор передаёт фото ретушёру. Результат возвращается на ручную верификацию фотографии."
    },
    {
      "id": "video-prompt",
      "x": 100,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Система пишет промпт",
      "kind": "auto",
      "group": "video",
      "stage": "В1",
      "summary": "Промпт по карточке образа.",
      "detail": "Система пишет промпт для видео на основе согласованной карточки образа."
    },
    {
      "id": "video-explain",
      "x": 530,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Система описывает ролик оператору",
      "kind": "auto",
      "group": "video",
      "stage": "В2",
      "summary": "Объясняет, как будет выглядеть ролик.",
      "detail": "Система описывает оператору будущий ролик: структуру, последовательность сцен и действия до запуска генерации."
    },
    {
      "id": "video-structure",
      "x": 960,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Правки структуры и выбор аспекта",
      "kind": "human",
      "group": "video",
      "stage": "В3",
      "summary": "Оператор уточняет структуру ролика.",
      "detail": "Оператор при необходимости вносит правки в структуру будущего ролика и выбирает аспект."
    },
    {
      "id": "video-generate",
      "x": 1390,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Генерация видео",
      "kind": "auto",
      "group": "video",
      "stage": "В4",
      "summary": "Карточка образа + согласованный промпт.",
      "detail": "Система генерирует ролик по карточке образа и промпту с учётом выбранной структуры и аспекта."
    },
    {
      "id": "video-check",
      "x": 1820,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Автоанализ видео",
      "kind": "auto",
      "group": "video",
      "stage": "В5",
      "summary": "Проверка внешности и одежды.",
      "detail": "Система анализирует внешность человека и одежду. Замечания могут возвращаться на переработку промпта."
    },
    {
      "id": "video-manual",
      "x": 2250,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Ручная верификация видео",
      "kind": "human",
      "group": "video",
      "stage": "В6",
      "summary": "Оператор проверяет ролик и замечания.",
      "detail": "Оператор вручную проверяет достоверность и пригодность ролика, в том числе замечания продакта. При необходимости возвращает замечания на переработку промпта."
    },
    {
      "id": "video-product",
      "x": 2680,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Product-согласование видео",
      "kind": "decision",
      "group": "video",
      "stage": "В7",
      "summary": "Да → согласованное видео. Нет → правки.",
      "detail": "Продакт согласовывает видео. При отказе замечания возвращаются на ручную верификацию видео.",
      "actor": "human"
    },
    {
      "id": "video-approved",
      "x": 3110,
      "y": 2310,
      "w": 330,
      "h": 340,
      "title": "Согласованное видео",
      "kind": "result",
      "group": "video",
      "stage": "В8",
      "summary": "Финальный согласованный видеоматериал.",
      "detail": "Видео прошло ручную верификацию и Product-согласование."
    }
  ],
  "edges": [
    {
      "id": "look--products",
      "from": "look",
      "to": "products",
      "path": "M 400 360 H 430 V 290 H 460"
    },
    {
      "id": "products--dress",
      "from": "products",
      "to": "dress",
      "path": "M 820 290 H 850 V 360 H 880"
    },
    {
      "id": "model--dress",
      "from": "model",
      "to": "dress",
      "path": "M 820 600 H 850 V 360 H 880"
    },
    {
      "id": "dress--card-check",
      "from": "dress",
      "to": "card-check",
      "path": "M 1270 360 H 1330"
    },
    {
      "id": "card-check--dressed",
      "from": "card-check",
      "to": "dressed",
      "path": "M 1700 360 H 1760"
    },
    {
      "id": "dressed--product-fit",
      "from": "dressed",
      "to": "product-fit",
      "path": "M 2130 360 H 2190"
    },
    {
      "id": "product-fit--fit",
      "from": "product-fit",
      "to": "fit",
      "path": "M 2580 360 H 2640"
    },
    {
      "id": "fit--approved-card",
      "from": "fit",
      "to": "approved-card",
      "path": "M 3030 360 H 3420 V 1200 H 1490 V 990 H 1420",
      "tone": "positive",
      "label": "Да · посадка согласована",
      "decision": "yes",
      "decisionX": 3150,
      "decisionY": 360
    },
    {
      "id": "fit--retouch",
      "from": "fit",
      "to": "retouch",
      "path": "M 2760 530 V 760 H 2100 V 840",
      "tone": "return",
      "label": "Нет · корректировка образа",
      "decision": "no",
      "decisionX": 2760,
      "decisionY": 600
    },
    {
      "id": "fit--reshoot",
      "from": "fit",
      "to": "reshoot",
      "path": "M 2920 530 V 780 H 2920 V 840",
      "tone": "return",
      "label": "Нет · нужна съёмка на манекене",
      "decision": "no",
      "decisionX": 2920,
      "decisionY": 705
    },
    {
      "id": "retouch--product-fit",
      "from": "retouch",
      "to": "product-fit",
      "path": "M 1800 990 H 1670 V 740 H 2385 V 530",
      "tone": "return",
      "label": "После ретуши → Product-проверка",
      "labelX": 1770,
      "labelY": 727
    },
    {
      "id": "reshoot--dress",
      "from": "reshoot",
      "to": "dress",
      "path": "M 3320 990 H 3470 V 660 H 1075 V 530",
      "tone": "return",
      "label": "Новые фото на манекене → формирование образа",
      "labelX": 2330,
      "labelY": 647
    },
    {
      "id": "approved-card--photo-products",
      "from": "approved-card",
      "to": "photo-products",
      "path": "M 800 1140 V 1250 H 265 V 1320",
      "tone": "positive"
    },
    {
      "id": "approved-card--video-prompt",
      "from": "approved-card",
      "to": "video-prompt",
      "path": "M 180 990 H 10 V 2480 H 100",
      "tone": "positive"
    },
    {
      "id": "photo-products--photo-angles",
      "from": "photo-products",
      "to": "photo-angles",
      "path": "M 430 1490 H 600"
    },
    {
      "id": "photo-angles--photo-generate",
      "from": "photo-angles",
      "to": "photo-generate",
      "path": "M 930 1490 H 1100"
    },
    {
      "id": "photo-generate--photo-check",
      "from": "photo-generate",
      "to": "photo-check",
      "path": "M 1430 1490 H 1600"
    },
    {
      "id": "photo-check--photo-manual",
      "from": "photo-check",
      "to": "photo-manual",
      "path": "M 1930 1490 H 2100"
    },
    {
      "id": "photo-manual--photo-product",
      "from": "photo-manual",
      "to": "photo-product",
      "path": "M 2430 1490 H 2600"
    },
    {
      "id": "photo-product--photo-approved",
      "from": "photo-product",
      "to": "photo-approved",
      "path": "M 2930 1490 H 3100",
      "tone": "positive",
      "label": "Да · фото согласовано",
      "decision": "yes",
      "decisionX": 3015,
      "decisionY": 1490
    },
    {
      "id": "photo-product--photo-manual",
      "from": "photo-product",
      "to": "photo-manual",
      "path": "M 2765 1660 V 1710 H 2265 V 1660",
      "tone": "return",
      "label": "Нет · замечания продакта → ручная верификация",
      "decision": "no",
      "decisionX": 2765,
      "decisionY": 1695
    },
    {
      "id": "photo-manual--photo-retouch",
      "from": "photo-manual",
      "to": "photo-retouch",
      "path": "M 2180 1660 V 1760 H 2310 V 1790",
      "tone": "return",
      "label": "При необходимости → ретушёр",
      "labelX": 1900,
      "labelY": 1745
    },
    {
      "id": "photo-retouch--photo-manual",
      "from": "photo-retouch",
      "to": "photo-manual",
      "path": "M 2160 1920 H 2020 V 1715 H 2135 V 1660",
      "tone": "return",
      "label": "После ретуши → ручная верификация",
      "labelX": 1620,
      "labelY": 1905
    },
    {
      "id": "video-prompt--video-explain",
      "from": "video-prompt",
      "to": "video-explain",
      "path": "M 430 2480 H 530"
    },
    {
      "id": "video-explain--video-structure",
      "from": "video-explain",
      "to": "video-structure",
      "path": "M 860 2480 H 960"
    },
    {
      "id": "video-structure--video-generate",
      "from": "video-structure",
      "to": "video-generate",
      "path": "M 1290 2480 H 1390"
    },
    {
      "id": "video-generate--video-check",
      "from": "video-generate",
      "to": "video-check",
      "path": "M 1720 2480 H 1820"
    },
    {
      "id": "video-check--video-manual",
      "from": "video-check",
      "to": "video-manual",
      "path": "M 2150 2480 H 2250"
    },
    {
      "id": "video-manual--video-product",
      "from": "video-manual",
      "to": "video-product",
      "path": "M 2580 2480 H 2680"
    },
    {
      "id": "video-product--video-approved",
      "from": "video-product",
      "to": "video-approved",
      "path": "M 3010 2480 H 3110",
      "tone": "positive",
      "label": "Да · видео согласовано",
      "decision": "yes",
      "decisionX": 3060,
      "decisionY": 2480
    },
    {
      "id": "video-check--video-prompt",
      "from": "video-check",
      "to": "video-prompt",
      "path": "M 1985 2650 V 2705 H 265 V 2650",
      "tone": "return",
      "label": "Замечания автоанализа → промпт",
      "labelX": 800,
      "labelY": 2692
    },
    {
      "id": "video-manual--video-prompt",
      "from": "video-manual",
      "to": "video-prompt",
      "path": "M 2350 2650 V 2780 H 330 V 2650",
      "tone": "return",
      "label": "Замечания ручной верификации → промпт",
      "labelX": 1100,
      "labelY": 2767
    },
    {
      "id": "video-product--video-manual",
      "from": "video-product",
      "to": "video-manual",
      "path": "M 2845 2650 V 2725 H 2535 V 2650",
      "tone": "return",
      "label": "Нет · замечания продакта → ручная верификация",
      "decision": "no",
      "decisionX": 2845,
      "decisionY": 2692
    }
  ],
  "bands": [
    {
      "id": "preparation",
      "x": 30,
      "y": 30,
      "w": 3440,
      "h": 750,
      "title": "Подготовка и согласование образа",
      "subtitle": "Карточки товаров + выбранная модель → карточка образа"
    },
    {
      "id": "correction",
      "x": 1750,
      "y": 780,
      "w": 1720,
      "h": 410,
      "title": "Коррекция посадки"
    },
    {
      "id": "photo",
      "x": 30,
      "y": 1190,
      "w": 3440,
      "h": 920,
      "title": "Создание фото",
      "subtitle": "Карточка образа + ракурсы + товары",
      "art": "group-photo"
    },
    {
      "id": "video",
      "x": 30,
      "y": 2180,
      "w": 3440,
      "h": 670,
      "title": "Создание видео",
      "subtitle": "Карточка образа + промпт",
      "art": "group-video"
    }
  ],
  "presets": [
    {
      "id": "overview",
      "label": "Вся схема",
      "x": 0,
      "y": 0,
      "w": 3500,
      "h": 2900
    },
    {
      "id": "preparation",
      "label": "Подготовка",
      "x": 30,
      "y": 30,
      "w": 3440,
      "h": 750
    },
    {
      "id": "fit",
      "label": "Посадка",
      "x": 1750,
      "y": 170,
      "w": 1750,
      "h": 1040
    },
    {
      "id": "basis",
      "label": "Карточка образа",
      "x": 130,
      "y": 790,
      "w": 1340,
      "h": 400
    },
    {
      "id": "photo",
      "label": "Фото",
      "x": 30,
      "y": 1190,
      "w": 3440,
      "h": 920
    },
    {
      "id": "video",
      "label": "Видео",
      "x": 30,
      "y": 2180,
      "w": 3440,
      "h": 670
    }
  ],
  "sourceNote": "Красный кружок обозначает участие человека. Галочка «Да» ведёт к согласованному результату; крестик «Нет» возвращает на правки. Фото и видео создаются независимо по одной согласованной карточке образа."
};
