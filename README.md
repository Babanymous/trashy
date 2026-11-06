# Trashy-0.1

A small AI that sorts trash from a photo. It runs entirely in the browser: pictures never leave the device.

**Try it:** https://babanymous.github.io/trashy/ · **About:** https://trashy-ai.neocities.org

## How it works

1. [MobileNet v2](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) (TensorFlow.js) turns each part of the photo into a fingerprint of 1,280 numbers.
2. Trashy compares that fingerprint with stored examples and picks the category whose 3 closest examples match best.
3. A sliding-window search finds the items in the photo and draws a box around each.

Categories: **Paper, Plastic, Glass, Metal, Trash**, plus *background* (used to ignore empty areas).

## Files

| Path | What it is |
|---|---|
| `index.html` | The app |
| `image-model.js` | The trained examples (the model) |
| `image-trainer.html` | Tool for training a model from your own photos |
| `lib/` | TensorFlow.js and MobileNet code |
| `models/mobilenet_v2_100_224/` | MobileNet weights (`model-packed.js` is used when `index.html` is opened from disk) |
| `svg/`, `trashy-logo.svg` | Mascot and logo |
| `fonts/` | Bricolage Grotesque and Caveat (SIL Open Font License) |
| `about/` | The project's about website |
| `privacy.html`, `terms.html`, `impressum.html` | Legal pages |

## Training data

- [TrashNet](https://huggingface.co/datasets/garythung/trashnet) by Gary Thung and Mindy Yang, MIT License
- [Bower waste annotations](https://huggingface.co/datasets/BowerApp/bower-waste-annotations) by Bower, MIT License
- [dmedhi garbage image classification & detection](https://huggingface.co/datasets/dmedhi/garbage-image-classification-detection) by dmedhi, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The author's own photos

## Accuracy

Measured on photos the model had not been trained on:

| Test set | Items classified correctly | False alarms on empty areas |
|---|---|---|
| dmedhi test photos | 78.5% | 1.4% |
| Bower real-home photos | 72.5% | 1.7% |

Trashy is an early experiment. Its suggestions can be wrong, and sorting rules depend on where you live.
