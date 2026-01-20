# 🫧 Image Masking Tool - iPad Edition

A web-based experimental image masking tool optimized for iPad and Apple Pencil.

## ✨ Key Features

### 📱 Optimized for iPad

* **Apple Pencil Support**: Precise masking with pressure sensitivity.
* **Touch Gestures**: Fully functional with finger touch.
* **Responsive Design**: Supports all iPad models, including Pro and Air.
* **Dark Mode**: Eye-friendly dark theme for long working hours.

### 🎨 Masking Capabilities

* **Draw/Erase Modes**: Seamlessly toggle between drawing and erasing.
* **Adjustable Brush Size**: 5–100px (automatically adjusts with pressure).
* **Opacity Control**: Customizable mask overlay transparency.
* **Real-time Preview**: Instant visual feedback on your masks.

### 🚀 Workflow Efficiency

* **Batch Processing**: Load multiple images simultaneously.
* **Quick Navigation**: Effortless movement with Previous/Next buttons.
* **Skip Function**: Quickly skip images that do not require masking.
* **Bulk Download**: Save all generated masks as PNG files in one go.

## 🎯 How to Use

### 1. Opening the Tool

1. Open the `index.html` file in **iPad Safari**.
2. Use **"Add to Home Screen"** to use it like a native app.

### 2. Loading Images

1. Click the **"📁 Load Images"** button.
2. Select images from the Photos app or Files app.
3. Multiple images can be selected at once.

### 3. Masking Process

1. **✏️ Draw Mode**: Use Apple Pencil to color the bubble areas.
2. **🧹 Erase Mode**: Remove any accidental strokes.
3. **Brush Size**: Adjust using the slider.
4. **Opacity**: Adjust the mask's visualization level.

### 4. Navigation

* **⏭️ Skip**: Skip the current image if no bubbles are present.
* **💾 Save & Next**: Move to the next image (saves automatically in-session).
* **◀ Previous / Next ▶**: Navigate through your image list.

### 5. Saving Masks

* **⬇️ Download All Masks**: Download every mask as a PNG file.
* Filename format: `mask_00001.png`, `mask_00002.png`, etc.

## 🖌️ Apple Pencil Tips

### Pressure Sensitivity

* **Light Pressure**: Thin lines (small brush).
* **Firm Pressure**: Thick lines (large brush).
* *The set brush size acts as the maximum baseline.*

### Precision Work

1. Set the brush size to **5–10px**.
2. Use Apple Pencil for detailed edge masking.
3. **Zooming**: Use Safari’s pinch-to-zoom gesture for closer inspection.

### Fast Workflow

1. Set the brush size to **50–100px**.
2. Quickly fill large bubble areas.
3. Switch to Erase mode for fine-tuning boundaries.

## 📂 File Structure

```
index.html      # Main HTML file
style.css       # Stylesheet
script.js       # JavaScript logic
README.md       # Documentation

```

## 🎨 Shortcuts (When using iPad Keyboard)

* `D`: Draw Mode
* `E`: Erase Mode
* `C`: Clear Mask
* `←`: Previous
* `→`: Next
* `Space`: Skip

## 🌟 Advantages

### vs. MATLAB GUI

✅ **Apple Pencil Support**: Superior precision for complex shapes.
✅ **Mobile Productivity**: Work anywhere, anytime.
✅ **Intuitive Touch UI**: Specifically optimized for tablets.
✅ **Cross-Platform**: Works on Mac, PC, and iPad.

### vs. Conventional Methods

✅ **Faster Workflow**: Instant corrections via touch/pencil.
✅ **Real-time Feedback**: Immediate mask overlay verification.
✅ **Batch Handling**: Process entire datasets efficiently.
✅ **Cloud Integration**: Easy file sharing via iCloud or AirDrop.

## 🔧 Advanced Settings

### Canvas Resolution

By default, the tool maintains the original image resolution. If performance lags:

* Resize images before loading.
* Or adjust the scale in the `loadImage()` function within `script.js`.

### Brush Algorithm

Uses a circular brush. To modify the shape:

* Edit the distance calculation in the `drawPoint()` function.

## ⚠️ Important Notes

1. **Browser**: Safari is highly recommended for best Apple Pencil optimization.
2. **File Size**: Performance may vary with extremely large images.
3. **No Auto-Save**: You must click "Download All Masks" before closing the tab.
4. **Refresh Warning**: Refreshing the page will clear all current progress.

## 📧 Contact

For issues or suggestions, please contact:
ligna159@snu.ac.kr

**Made with Google Antigravity and Claude Sonnet 4.5(Thinking) Models**




