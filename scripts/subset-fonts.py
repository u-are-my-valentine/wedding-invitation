"""Regenerate small UI fonts with fontTools + Brotli; full fonts remain fallbacks."""
from pathlib import Path
import re
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
sources = [root / 'config/wedding.ts', root / 'components/wedding/WeddingInvitation.tsx',
           root / 'scripts/build-static-html.mjs', root / 'app/design.css']
characters = ''.join(path.read_text() for path in sources) + ''.join(map(chr, range(32, 127)))
def unicode_ranges(codes):
    ranges = []
    for code in sorted(codes):
        if ranges and code == ranges[-1][1] + 1:
            ranges[-1][1] = code
        else:
            ranges.append([code, code])
    return ','.join(f'U+{start:X}' if start == end else f'U+{start:X}-{end:X}' for start, end in ranges)

faces = []
full_ranges = {}
for filename, family, weight in [('GowunBatang-Regular', 'Gowun Batang', '400'),
                                  ('CormorantGaramond', 'Cormorant Garamond', '300 700'),
                                  ('CutiveMono-Regular', 'Cutive Mono', '400')]:
    font = TTFont(root / f'public/fonts/{filename}.woff2', recalcTimestamp=False)
    full_ranges[filename] = unicode_ranges(font.getBestCmap())
    options = subset.Options()
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=characters)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(root / f'public/fonts/{filename}-ui.woff2')
    unicode_range = unicode_ranges(font.getBestCmap())
    faces.append(f'''@font-face {{
  font-family: "{family}";
  src: url("/fonts/{filename}-ui.woff2") format("woff2");
  font-weight: {weight};
  font-style: normal;
  font-display: swap;
  unicode-range: {unicode_range};
}}''')
css = root / 'app/design.css'
text = css.read_text()
start_marker = '/* UI font subsets; full faces above cover additional characters. */'
end_marker = '/* End UI font subsets. */'
if start_marker in text:
    start = text.index(start_marker)
    end = text.index(end_marker) + len(end_marker) + 1
    text = text[:start] + text[end:]
for filename, unicode_range in full_ranges.items():
    pattern = r'@font-face \{[^}]*' + re.escape(filename + '.woff2') + r'[^}]*\}'
    def add_range(match):
        face = re.sub(r'  unicode-range:[^;]+;\n', '', match.group())
        return face[:-1] + f'  unicode-range: {unicode_range};\n}}'
    text = re.sub(pattern, add_range, text, count=1)
block = start_marker + '\n' + '\n'.join(faces) + '\n' + end_marker + '\n'
text = text.replace(':root {', block + ':root {', 1)
css.write_text(text)
