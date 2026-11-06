# Trashy-0.1

A small AI that sorts trash from a photo. It runs entirely in the browser: pictures never leave the device.

**Try it:** https://babanymous.github.io/trashy/ · **About:** https://trashy-ai.neocities.org

## How it works

1. [MobileNet v2](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) (TensorFlow.js) turns each part of the photo into a fingerprint of 1,280 numbers.
2. The fingerprint is compressed to 256 numbers (the same way as the stored examples), then compared with ~8,000 stored examples. Trashy picks the category whose 3 closest examples match best.
3. A sliding-window search finds the items in the photo and draws a box around each.

Categories: **Paper, Plastic, Glass, Metal, Trash**, plus *background* (used to ignore empty areas).

## Files

| Path | What it is |
|---|---|
| `index.html` | The app |
| `image-model.js` | The trained examples (the model, ~3.4 MB) |
| `image-trainer.html` | Tool for training a model from your own photos |
| `lib/` | TensorFlow.js and MobileNet code; `lib/ort/` is ONNX Runtime Web for the detector |
| `train-trashy-detector.ipynb` | Google Colab notebook that trains the detector |
| `models/mobilenet_v2_100_224/` | MobileNet weights (`model-packed.js` is used when `index.html` is opened from disk) |
| `svg/`, `trashy-logo.svg` | Mascot and logo |
| `fonts/` | Bricolage Grotesque and Caveat (SIL Open Font License) |
| `privacy.html`, `terms.html`, `impressum.html` | Legal pages |

## Train the detector (recommended next step)

A dedicated detection model (D-FINE nano, Apache-2.0) finds items with proper boxes in about 2–4 seconds instead of ~80.

1. Open [`train-trashy-detector.ipynb` in Google Colab](https://colab.research.google.com/github/Babanymous/trashy/blob/main/train-trashy-detector.ipynb).
2. **Runtime → Change runtime type → T4 GPU**, then **Runtime → Run all** (about 1–2 hours).
3. Unzip the downloaded `trashy-detector.zip` into `models/trashy-detector/` (it contains `model.onnx` and `detector.json`).

The app uses the detector automatically when that folder exists (served from a website; when `index.html` is opened from disk it keeps the classic method). It runs with [ONNX Runtime Web](https://onnxruntime.ai) (MIT, in `lib/ort/`).

## Training data

- [TACO](https://github.com/pedropro/TACO) by Pedro F. Proença, CC BY 4.0 (detector training)
- [TrashNet](https://huggingface.co/datasets/garythung/trashnet) by Gary Thung and Mindy Yang, MIT License
- [Bower waste annotations](https://huggingface.co/datasets/BowerApp/bower-waste-annotations) by Bower, MIT License
- [dmedhi garbage image classification & detection](https://huggingface.co/datasets/dmedhi/garbage-image-classification-detection) by dmedhi, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The author's own photos

## Accuracy

Measured on photos the model had not been trained on:

| Test set | Items classified correctly | False alarms on empty areas |
|---|---|---|
| dmedhi test photos | 79.1% | 1.9% (both sets) |
| Bower real-home photos | 73.3% | |

Trashy is an early experiment. Its suggestions can be wrong, and sorting rules depend on where you live.
