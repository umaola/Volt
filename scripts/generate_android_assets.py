import os
from PIL import Image

def generate_assets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'frontend', 'public')
    res_dir = os.path.join(base_dir, 'frontend', 'android', 'app', 'src', 'main', 'res')

    icon_512_path = os.path.join(public_dir, 'icon-512.png')
    logo_mark_path = os.path.join(public_dir, 'logo-mark.png')
    logo_bold_path = os.path.join(public_dir, 'logo-bold.png')

    icon_512 = Image.open(icon_512_path).convert('RGBA')
    logo_mark = Image.open(logo_mark_path).convert('RGBA')
    logo_bold = Image.open(logo_bold_path).convert('RGBA')

    mipmap_specs = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432),
    }

    for folder, (icon_sz, fg_sz) in mipmap_specs.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        launcher_img = icon_512.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(folder_path, 'ic_launcher.png'))
        launcher_img.save(os.path.join(folder_path, 'ic_launcher_round.png'))

        fg_canvas = Image.new('RGBA', (fg_sz, fg_sz), (0, 0, 0, 0))
        target_size = int(fg_sz * 0.60)
        mark_w, mark_h = logo_mark.size
        ratio = min(target_size / mark_w, target_size / mark_h)
        scaled_w = int(mark_w * ratio)
        scaled_h = int(mark_h * ratio)
        scaled_mark = logo_mark.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)

        offset_x = (fg_sz - scaled_w) // 2
        offset_y = (fg_sz - scaled_h) // 2
        fg_canvas.paste(scaled_mark, (offset_x, offset_y), scaled_mark)
        fg_canvas.save(os.path.join(folder_path, 'ic_launcher_foreground.png'))
        print(f"Updated {folder}")

    splash_specs = {
        'drawable': (480, 320),
        'drawable-land-hdpi': (800, 480),
        'drawable-land-mdpi': (480, 320),
        'drawable-land-xhdpi': (1280, 720),
        'drawable-land-xxhdpi': (1600, 960),
        'drawable-land-xxxhdpi': (1920, 1280),
        'drawable-port-hdpi': (480, 800),
        'drawable-port-mdpi': (320, 480),
        'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600),
        'drawable-port-xxxhdpi': (1280, 1920),
    }

    for folder, (sw, sh) in splash_specs.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        splash_canvas = Image.new('RGBA', (sw, sh), (255, 255, 255, 255))
        max_logo_w = int(sw * 0.45)
        max_logo_h = int(sh * 0.25)
        lw, lh = logo_bold.size
        ratio = min(max_logo_w / lw, max_logo_h / lh)
        scaled_w = int(lw * ratio)
        scaled_h = int(lh * ratio)
        scaled_logo = logo_bold.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)

        ox = (sw - scaled_w) // 2
        oy = (sh - scaled_h) // 2
        splash_canvas.paste(scaled_logo, (ox, oy), scaled_logo)
        splash_canvas.save(os.path.join(folder_path, 'splash.png'))
        print(f"Updated {folder}/splash.png")

if __name__ == '__main__':
    generate_assets()
