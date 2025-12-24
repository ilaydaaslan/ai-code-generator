# Türkçe Kod Üreten Yapay Zeka Aracı

## Proje Tanımı
Bu proje, kullanıcının Türkçe doğal dilde ifade ettiği programlama problemlerini anlayarak
ilgili kodu otomatik olarak üreten yapay zeka destekli bir sistemdir.

Sistem, Büyük Dil Modelleri (LLM) kullanarak doğal dil işleme, kod üretimi ve açıklama
yetkinliklerini bir araya getirmektedir.

---

## Projenin Amaçları
- Türkçe yazılmış programlama problemlerini doğru şekilde analiz etmek
- Kullanıcı isteğine uygun, çalışabilir ve temiz kod üretmek
- Kod üretimi süreçlerinde yapay zeka kullanımını göstermek
- LLM tabanlı üretken yapay zeka uygulamalarına örnek bir sistem geliştirmek

---

## Kullanılan Teknolojiler

### Yapay Zeka & LLM
- Büyük Dil Modelleri (LLM)
- Doğal Dil İşleme (NLP)
- Prompt Engineering

### Backend
- Python
- OpenAI API (veya benzeri LLM servisleri)

### Web Arayüz
- Next.js
- React
- Tailwind CSS

---

## Proje Yapısı
```text
code-ai/
 ├── app/                 # Web arayüzü (Next.js)
 ├── public/              # Statik dosyalar
 ├── AI/                  # Yapay zeka ve LLM entegrasyonu
 │    ├── code_generator.py
 │    ├── explanation.py
 │    └── prompts.py
 ├── README.md
 ├── package.json
 └── .gitignore
