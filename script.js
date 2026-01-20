// ==================== Global Variables ====================
let images = [];
let currentIndex = 0;
let masks = [];
let canvas, ctx;
let maskPreview, maskCtx;
let isDrawing = false;
let isDraw = true; // true = draw, false = erase
let brushSize = 15;
let opacity = 0.7;

// ==================== Initialization ====================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App starting...');

    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    maskPreview = document.getElementById('maskPreview');
    maskCtx = maskPreview.getContext('2d');

    setupEventListeners();
    setupDrawing();

    console.log('✅ App initialized successfully!');
});

// ==================== Event Listeners Setup ====================
function setupEventListeners() {
    // load files
    document.getElementById('imageInput').addEventListener('change', handleImageLoad);

    // Brush settings
    document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('brushSizeValue').textContent = brushSize;
    });

    document.getElementById('opacity').addEventListener('input', (e) => {
        opacity = parseInt(e.target.value) / 100;
        document.getElementById('opacityValue').textContent = e.target.value;
        updateDisplay();
    });

    // Mode switching
    document.getElementById('drawMode').addEventListener('click', () => setMode(true));
    document.getElementById('eraseMode').addEventListener('click', () => setMode(false));

    // Action buttons
    document.getElementById('clearBtn').addEventListener('click', clearMask);
    document.getElementById('skipBtn').addEventListener('click', skipImage);
    document.getElementById('saveBtn').addEventListener('click', saveAndNext);

    // Navigation
    document.getElementById('prevBtn').addEventListener('click', () => navigate(-1));
    document.getElementById('nextBtn').addEventListener('click', () => navigate(1));

    // Export
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllMasks);

    console.log('✅ Event listeners attached');
}

// ==================== Drawing Setup ====================
function setupDrawing() {
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events (iPad/Apple Pencil support)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    console.log('✅ Drawing events attached');
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

    isDrawing = true;
    drawPoint(x, y, e.touches[0].force || 1);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

    const pressure = e.touches[0].force || 1;
    drawPoint(x, y, pressure);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    drawPoint(x, y, 1);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    drawPoint(x, y, 1);
}

function stopDrawing() {
    isDrawing = false;
}

function drawPoint(x, y, pressure = 1) {
    if (!masks[currentIndex]) {
        initMask(currentIndex);
    }

    const mask = masks[currentIndex];
    const adjustedBrushSize = brushSize * Math.sqrt(pressure);

    const imgData = mask.getContext('2d').getImageData(0, 0, mask.width, mask.height);
    const data = imgData.data;

    for (let dy = -adjustedBrushSize; dy <= adjustedBrushSize; dy++) {
        for (let dx = -adjustedBrushSize; dx <= adjustedBrushSize; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= adjustedBrushSize) {
                const px = Math.round(x + dx);
                const py = Math.round(y + dy);

                if (px >= 0 && px < mask.width && py >= 0 && py < mask.height) {
                    const index = (py * mask.width + px) * 4;

                    const value = isDraw ? 255 : 0;
                    data[index] = value;
                    data[index + 1] = value;
                    data[index + 2] = value;
                    data[index + 3] = 255;
                }
            }
        }
    }

    mask.getContext('2d').putImageData(imgData, 0, 0);
    updateDisplay();
}

// ==================== Image Loading (Including TIFF Support) ====================
function handleImageLoad(e) {
    const files = Array.from(e.target.files);

    console.log('📁 Files selected:', files.length);

    if (files.length === 0) {
        alert('Please select image files!');
        return;
    }

    images = [];
    masks = [];
    currentIndex = 0;

    let loadedCount = 0;
    const totalFiles = files.length;
    const loadedImages = [];

    files.forEach((file, index) => {
        console.log(`📄 Loading ${index + 1}/${totalFiles}: ${file.name}`);

        // Check if it's a TIFF file
        const fileName = file.name.toLowerCase();
        const isTiff = fileName.endsWith('.tif') || fileName.endsWith('.tiff');

        if (isTiff && typeof UTIF !== 'undefined') {
            // TIFF file: Use UTIF.js
            console.log('🔷 Loading as TIFF:', file.name);

            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const buffer = e.target.result;
                    console.log('  Buffer loaded, size:', buffer.byteLength);

                    // Decode with UTIF
                    const ifds = UTIF.decode(buffer);
                    console.log('  IFDs decoded:', ifds.length);

                    if (ifds.length === 0) {
                        throw new Error('No image data found in TIFF');
                    }

                    // Decode first image
                    UTIF.decodeImage(buffer, ifds[0]);
                    const rgba = UTIF.toRGBA8(ifds[0]);

                    console.log('  Image decoded:', ifds[0].width, 'x', ifds[0].height);

                    // Draw to canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = ifds[0].width;
                    canvas.height = ifds[0].height;
                    const ctx = canvas.getContext('2d');

                    const imageData = ctx.createImageData(canvas.width, canvas.height);
                    imageData.data.set(rgba);
                    ctx.putImageData(imageData, 0, 0);

                    // Convert canvas to image
                    const img = new Image();
                    img.onload = function () {
                        loadedCount++;
                        console.log(`✅ TIFF loaded ${loadedCount}/${totalFiles}: ${file.name}`);
                        loadedImages[index] = img;

                        if (loadedCount === totalFiles) {
                            finishLoading(loadedImages);
                        }
                    };
                    img.src = canvas.toDataURL();

                } catch (err) {
                    console.error(`❌ TIFF decode error: ${file.name}`, err);
                    alert(`Failed to load TIFF file: ${file.name}\n${err.message}`);
                    loadedCount++;
                    if (loadedCount === totalFiles) {
                        finishLoading(loadedImages);
                    }
                }
            };

            reader.onerror = function (err) {
                console.error(`❌ File read error: ${file.name}`, err);
                alert(`Failed to read file: ${file.name}`);
                loadedCount++;
                if (loadedCount === totalFiles) {
                    finishLoading(loadedImages);
                }
            };

            reader.readAsArrayBuffer(file);

        } else {
            // Standard image files (PNG, JPG, etc.)
            console.log('🔶 Loading as standard image:', file.name);

            const img = new Image();

            img.onload = function () {
                loadedCount++;
                console.log(`✅ Loaded ${loadedCount}/${totalFiles}: ${file.name}`);
                loadedImages[index] = img;

                if (loadedCount === totalFiles) {
                    finishLoading(loadedImages);
                }
            };

            img.onerror = function (err) {
                console.error(`❌ Failed to load: ${file.name}`, err);
                alert(`Failed to load image: ${file.name}\n\nThis format may not be supported by your browser.`);
                loadedCount++;
                if (loadedCount === totalFiles) {
                    finishLoading(loadedImages);
                }
            };

            img.src = URL.createObjectURL(file);
        }
    });
}

function finishLoading(loadedImages) {
    // Filter out null images only
    images = loadedImages.filter(img => img !== null && img !== undefined);

    console.log(`🎉 All images processed! Successfully loaded: ${images.length}`);

    if (images.length === 0) {
        alert('Unable to load images!');
        return;
    }

    masks = new Array(images.length).fill(null);

    const placeholder = document.getElementById('placeholderText');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    loadImage(0);
}

function loadImage(index) {
    console.log(`🖼️ Loading image at index: ${index}`);

    if (index < 0 || index >= images.length) {
        console.warn('⚠️ Invalid index:', index);
        return;
    }

    currentIndex = index;
    const img = images[index];

    // Set canvas size
    const container = canvas.parentElement;
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.width = (img.width * scale) + 'px';
    canvas.style.height = (img.height * scale) + 'px';

    // Initialize mask
    if (!masks[index]) {
        initMask(index);
    }

    updateDisplay();
    updateInfo();

    console.log(`✅ Image ${index + 1} displayed (${img.width}x${img.height})`);
}

function initMask(index) {
    const img = images[index];
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;

    const mCtx = maskCanvas.getContext('2d');
    mCtx.fillStyle = 'black';
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    masks[index] = maskCanvas;
}

// ==================== Display Update ====================
function updateDisplay() {
    if (!images[currentIndex]) return;

    const img = images[currentIndex];
    const mask = masks[currentIndex];

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Mask overlay
    if (mask) {
        ctx.globalAlpha = opacity;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mask.width;
        tempCanvas.height = mask.height;
        const tempCtx = tempCanvas.getContext('2d');

        const maskData = mask.getContext('2d').getImageData(0, 0, mask.width, mask.height);
        const overlayData = tempCtx.createImageData(mask.width, mask.height);

        for (let i = 0; i < maskData.data.length; i += 4) {
            if (maskData.data[i] > 128) {
                overlayData.data[i] = 255;
                overlayData.data[i + 1] = 50;
                overlayData.data[i + 2] = 50;
                overlayData.data[i + 3] = 200;
            }
        }

        tempCtx.putImageData(overlayData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1;

        updateMaskPreview(mask);
    }

    updatePixelCount();
}

function updateMaskPreview(mask) {
    maskPreview.width = mask.width;
    maskPreview.height = mask.height;
    maskPreview.style.aspectRatio = `${mask.width} / ${mask.height}`;
    maskCtx.drawImage(mask, 0, 0);
}

function updatePixelCount() {
    if (!masks[currentIndex]) {
        document.getElementById('pixelCount').textContent = '0';
        return;
    }

    const mask = masks[currentIndex];
    const data = mask.getContext('2d').getImageData(0, 0, mask.width, mask.height).data;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 128) count++;
    }

    document.getElementById('pixelCount').textContent = count.toLocaleString();
}

function updateInfo() {
    const fileInfo = document.getElementById('fileInfo');
    const progressText = document.getElementById('progressText');

    if (images.length > 0) {
        fileInfo.textContent = `Image ${currentIndex + 1}`;
        progressText.textContent = `${currentIndex + 1} / ${images.length}`;
    } else {
        fileInfo.textContent = 'Please select images';
        progressText.textContent = '0 / 0';
    }
}

// ==================== Mode Switching ====================
function setMode(drawMode) {
    isDraw = drawMode;

    const drawBtn = document.getElementById('drawMode');
    const eraseBtn = document.getElementById('eraseMode');

    if (drawMode) {
        drawBtn.classList.add('active');
        eraseBtn.classList.remove('active');
        canvas.style.cursor = 'crosshair';
    } else {
        drawBtn.classList.remove('active');
        eraseBtn.classList.add('active');
        canvas.style.cursor = 'not-allowed';
    }
}

// ==================== Actions ====================
function clearMask() {
    if (!confirm('Are you sure you want to clear the current mask?')) return;

    if (masks[currentIndex]) {
        const mCtx = masks[currentIndex].getContext('2d');
        mCtx.fillStyle = 'black';
        mCtx.fillRect(0, 0, masks[currentIndex].width, masks[currentIndex].height);
        updateDisplay();
    }
}

function skipImage() {
    navigate(1);
}

function saveAndNext() {
    navigate(1);
}

function navigate(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
        loadImage(newIndex);
    } else if (newIndex >= images.length) {
        alert('This is the last image!');
    } else {
        alert('This is the first image!');
    }
}

// ==================== Export ====================
function downloadAllMasks() {
    if (masks.length === 0) {
        alert('No masks to save!');
        return;
    }

    masks.forEach((mask, index) => {
        if (mask) {
            mask.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mask_${String(index + 1).padStart(5, '0')}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    });

    alert(`Downloading ${masks.filter(m => m).length} masks!`);
}
