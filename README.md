# Trashy-0.1

A small AI that sorts trash from a photo. It runs entirely in the browser: pictures never leave the device.

**Try it:** https://babanymous.github.io/trashy/ · **About:** https://trashy-ai.neocities.org

## How it works

1. A trained object detector ([D-FINE nano](https://github.com/Peterande/D-FINE), Apache-2.0, fine-tuned on trash photos) finds every item in the photo, draws a box around it and names its category. It runs with [ONNX Runtime Web](https://onnxruntime.ai) and takes about 2–4 seconds.
2. If the detector can't load (for example when `index.html` is opened straight from disk), Trashy falls back to the classic method: [MobileNet v2](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) (TensorFlow.js) fingerprints each part of the photo, and the fingerprint is compared with ~8,000 stored examples.

Categories: **Paper, Plastic, Glass, Metal, Trash**.

The app is available in English, German and Russian (picked from the browser language, or with `?lang=en|de|ru`), and can be installed on a phone from the menu.

## Files

| Path | What it is |
|---|---|
| `index.html` | The app |
| `models/trashy-detector/` | The default detector, Trashy-0.1 (`model.onnx`, 15 MB, and `detector.json` with its test results) |
| `models/trashy-axel-1/` | A second detector, Trashy-Axel 1: stricter, so fewer extra boxes but fewer items found. Chosen in the ⋯ menu and only downloaded when picked |
| `image-model.js` | Stored examples for the classic method (~3.4 MB) |
| `image-trainer.html` | Tool for training a classic model from your own photos |
| `lib/` | TensorFlow.js and MobileNet code; `lib/ort/` is ONNX Runtime Web |
| `train-trashy-detector.ipynb` | Google Colab notebook that trains the detector |
| `models/mobilenet_v2_100_224/` | MobileNet weights (`model-packed.js` is used when `index.html` is opened from disk) |
| `manifest.webmanifest`, `icons/` | Lets people install Trashy on their phone (Android and iPhone) |
| `sw.js` | Offline support: saves the app and models on the phone after the first visit. **Change `VERSION` in it whenever a model or library file changes**, or installed copies keep the old files |
| `svg/`, `trashy-logo.svg` | Mascot and logo |
| `fonts/` | Bricolage Grotesque and Caveat (SIL Open Font License) |
| `privacy.html`, `terms.html`, `impressum.html` | Legal pages |

## Retrain the detector

1. Open [`train-trashy-detector.ipynb` in Google Colab](https://colab.research.google.com/github/Babanymous/trashy/blob/main/train-trashy-detector.ipynb).
2. **Runtime → Change runtime type → L4 GPU** (or T4), then **Runtime → Run all** (about 2 hours on L4).
3. Unzip the downloaded `trashy-detector.zip` into `models/trashy-detector/`.

## Training data

- [TACO](http://tacodataset.org) by Pedro F. Proença, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [TrashNet](https://huggingface.co/datasets/garythung/trashnet) by Gary Thung and Mindy Yang, MIT License
- [Bower waste annotations](https://huggingface.co/datasets/BowerApp/bower-waste-annotations) by Bower, MIT License
- [dmedhi garbage image classification & detection](https://huggingface.co/datasets/dmedhi/garbage-image-classification-detection) by dmedhi, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The author's own photos

## Accuracy

Detector, measured on test photos it was not trained on. "Found and right" means the item was found (box overlaps at least 50%) **and** got the right category.

| Test set | Items found | Found and right |
|---|---|---|
| Bower real-home photos | 92.1% | 76.0% |
| dmedhi test photos | 89.1% | 77.6% |
| TrashNet (one item, plain background) | 97.9% | 91.8% |
| TACO (litter outdoors) | 55.2% | 34.1% |

These numbers are for Trashy-0.1. Trashy-Axel 1 with its own confidence levels: Bower 86.0% found, 70.2% right; dmedhi 77.6% found, 68.4% right; about 0.1 wrong extra boxes per photo.

Weakest categories: Metal (61–66%) and Trash (64%). The classic method only names items it is given (no finding): 73.3% on Bower, 79.1% on dmedhi.

Trashy is an early experiment. Its suggestions can be wrong, and sorting rules depend on where you live.
