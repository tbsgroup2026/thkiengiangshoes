from PIL import Image
import os

img_path = r"d:\Work\TBS II\web\public\images\tbs-logo.png"
img = Image.open(img_path).convert("RGBA")

width, height = img.size
print(f"Original image size: {width}x{height}")

# Find bounding box of non-transparent green pixels (right half of the logo)
# TBS logo has text "TBS" on left and green emblem on right.
# Let's crop the right portion containing the green mark!
pixels = img.load()

min_x, min_y = width, height
max_x, max_y = 0, 0

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Green mark is lime/green color where G is significantly higher than B and R, and not white/transparent
        if a > 50 and g > 100 and g > r * 0.8 and g > b * 1.5:
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

print(f"Green mark bounding box: ({min_x}, {min_y}, {max_x}, {max_y})")

# Crop the green mark
cropped = img.crop((min_x, min_y, max_x, max_y))
crop_w, crop_h = cropped.size

# Make it a perfect square with padding
max_dim = max(crop_w, crop_h)
padding = int(max_dim * 0.1)
square_size = max_dim + padding * 2

square_img = Image.new("RGBA", (square_size, square_size), (0, 0, 0, 0))
paste_x = (square_size - crop_w) // 2
paste_y = (square_size - crop_h) // 2

square_img.paste(cropped, (paste_x, paste_y), cropped)

# Resize to standard favicon sizes (128x128, 64x64, 32x32, 16x16)
resized_png = square_img.resize((128, 128), Image.Resampling.LANCZOS)

# Save to target file paths
targets = [
    r"d:\Work\TBS II\web\public\favicon.ico",
    r"d:\Work\TBS II\web\public\icon.png",
    r"d:\Work\TBS II\web\public\favicon.png",
    r"d:\Work\TBS II\web\src\app\icon.png",
    r"d:\Work\TBS II\web\src\app\favicon.ico",
]

for target in targets:
    os.makedirs(os.path.dirname(target), exist_ok=True)
    if target.endswith(".ico"):
        resized_png.save(target, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    else:
        resized_png.save(target, format="PNG")
    print(f"Saved: {target}")

print("Favicon crop & save complete!")
