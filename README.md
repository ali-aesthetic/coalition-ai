# Coalition AI — Dermatoscopy Analyzer

> Upload a dermatoscopy image → get a lesion classification and a segmentation mask.
> Built by Team Coalition for the **AI in Healthcare Hackathon 2026** at Central Asian University, Tashkent.

**Live demo:** https://coalition-ai.vercel.app

> ⚠️ For research and demonstration only. Not for clinical use, diagnosis or treatment decisions.

## What it does

| Task | Model (as shown in the app) | Result reported in the app |
|:--|:--|:--|
| Classification — 12 lesion subtypes | EfficientNet-B2 + ConvNeXt ensemble | 86.43% accuracy |
| Segmentation — binary lesion mask | FPN + UNet++ ensemble | ~0.80 IoU |

Extras: side-by-side view, overlay / binary-mask toggle, and an uncertainty warning on low-confidence results.

## How it works

```
index.html  →  /api/classify, /api/segment  (Vercel serverless)  →  Hugging Face Space (models)
```

## Run / deploy

1. Deploy to Vercel (every push to `main` redeploys).
2. Set one environment variable in Vercel: `HF_SPACE_URL` = your Hugging Face Space URL.

No API keys live in this repo.
