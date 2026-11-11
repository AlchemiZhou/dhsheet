"""Usage: python scripts/prepare-reference-templates.py DIRECTORY_WITH_PDFS
Build print assets from user-supplied PDFs (PyMuPDF, Pillow, fonttools[woff]).
The original PDFs are not bundled. Empty backgrounds retain their artwork at 400 dpi.
"""
import sys, pathlib, json, re, io
import fitz
from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=pathlib.Path(sys.argv[1])
NAMES={'bard':'吟游诗人','druid':'德鲁伊','guardian':'守护者','ranger':'游侠','rogue':'游荡者','seraph':'神使','sorcerer':'术士','warrior':'战士','wizard':'法师','assassin':'刺客','brawler':'格斗家','warlock':'邪术师','witch':'灵巫'}
assets=ROOT/'public/print-templates';assets.mkdir(parents=True,exist_ok=True)
manifest={}
source_cards=[]
for filename in ['builtin-base.json','builtin-hope-fear.json']:
 source_cards+=json.loads((ROOT/'data/cards'/filename).read_text())['profession']
for ident,name in NAMES.items():
 f=next(SOURCE.rglob(name+'角色卡_可填写版.pdf'));d=fitz.open(f);pages=[]
 values={w.field_name:w.field_value for w in d[0].widgets()}
 ink='#'+''.join(f'{round(c*255):02x}'for c in next(w.text_color for w in d[0].widgets()if w.field_name=='name'))
 questions=[['','',''],['','','']]
 for block in d[1].get_text('dict')['blocks']:
  for line in block.get('lines',[]):
   text=''.join(s['text'] for s in line['spans']);x,y,_,_=line['bbox']
   if 250<y<460 and re.search('[\u4e00-\u9fff]',text):
    col=0 if x<300 else 1;row=min(2,int((y-250)/77));questions[col][row]+=text.strip()
 for num in range(2):
  p=d[num];widgets=list(p.widgets() or [])
  fields={w.field_name:{'rect':[round(x,3)for x in w.rect],'fontSize':round(w.text_fontsize,3),'checkbox':w.field_type==fitz.PDF_WIDGET_TYPE_CHECKBOX}for w in widgets if w.rect.width>2 and w.rect.height>2}
  for w in widgets:p.delete_widget(w)
  if num==1:
   # Make the six printed questions editable without retaining duplicate fixed text.
   for x in [32.3,322.7]:
    for y in [253.2,330.1,407.1]:p.draw_rect(fitz.Rect(x,y,x+248,y+24),color=None,fill=(1,1,1),overlay=True)
  pix=p.get_pixmap(dpi=400,alpha=False)
  Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(assets/f'{ident}-{num+1}.webp',lossless=True,method=6)
  pages.append({'width':p.rect.width,'height':p.rect.height,'fields':fields})
 def weapon(prefix):return {'name':values.get(prefix+'.name',''),'trait':values.get(prefix+'.use',''),'damage':values.get(prefix+'.damage',''),'feature': '\n'.join(str(values.get(prefix+s,'')or'')for s in ['.feature','.feature2']).strip()}
 manifest[ident]={'name':name,'pages':pages,'attributes':{k:str(values.get('total.'+k,'')or'')for k in ['agility','strength','finesse','instinct','presence','knowledge']},'weapons':{'primary':weapon('main'),'secondary':weapon('off')},'armor':{'name':values.get('armor.name',''),'threshold':values.get('armor.threshold',''),'rating':values.get('armor.rating',''),'feature':values.get('armor.feature','')},'background':questions[0],'connections':questions[1]}
 manifest[ident]['ink']=ink
 manifest[ident]['description']=next(c['职业特性']for c in source_cards if c['名称']==name)
 print(ident,[(assets/f'{ident}-{i+1}.webp').stat().st_size//1024 for i in range(2)],'KiB',flush=True)
 if ident=='druid':
  # The form's original LXGW WenKai font, with its embedded license metadata.
  raw=d.extract_font(140)[3];font=TTFont(io.BytesIO(raw))
  # The full upstream OFL (including its web-subsetting permission) lives alongside the font.
  if not (assets/'FONT-LICENSE.txt').exists():raise FileNotFoundError('Keep public/print-templates/FONT-LICENSE.txt with the font')
  options=subset.Options();options.flavor='woff2';options.name_IDs=['*'];options.recalc_timestamp=False
  sub=subset.Subsetter(options=options);sub.populate(unicodes=list(range(32,0xa000))+list(range(0xff00,0xfff0)));sub.subset(font);font.flavor='woff2';font.save(assets/'form-ink.woff2')
(ROOT/'data/character/profession-presets.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
