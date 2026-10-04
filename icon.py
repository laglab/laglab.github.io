import math, os, sys
from PIL import Image, ImageDraw
# Symbol: Kamera mit einer Uhr als Objektiv.
# Symbole der Web-App:      python icon.py <Zielordner> <Hintergrund> [Objektiv] [Optionen]
#   Normale App bisher: python icon.py app 3a434d
# Symbol der Android-App:   python icon.py android <Variante> <Hintergrund> <Kamera> [Objektiv] [Zeiger] [Optionen]
#   Farben als Hex ohne #. Ohne Angabe ist das Objektiv in der Hintergrundfarbe, Kamera und Zeiger weiß.
#   Android legt das Symbol selbst in seine Form, Kreis oder abgerundetes Quadrat. Dafür entsteht die Kamera
#   ohne Hintergrund, der Hintergrund kommt aus der Farbe icon_bg der Variante.
# Optionen als name=wert: cam=Kamera, hands=Zeiger (nur Web-App), R=Radius des Objektivs (bisher 96),
#   mf=Länge des großen Zeigers und hf=Länge des kleinen Zeigers als Anteil vom Radius (bisher 0.58 und 0.44).
# Seit Test-App Stand 78 gilt Variante H4.5: dunkle Fläche, Kamera helles Salbei, Zeiger Bernstein,
#   Objektiv mittel, Zeiger lang:
#   python icon.py test 2c333b cam=b9d6cd hands=f5a623 R=86 mf=0.72 hf=0.5
#   python icon.py android labtest 2c333b b9d6cd 2c333b f5a623 R=86 mf=0.72 hf=0.5
# Seit Test-App Stand 94 mit Blitzfenster mittig im Höcker (Option flash=x0,y0,x1,y1,Radius,Farbe):
#   python icon.py test 2c333b cam=b9d6cd hands=f5a623 R=86 mf=0.72 hf=0.5 flash=206,136,270,166,8,2c333b
#   python icon.py android labtest 2c333b b9d6cd 2c333b f5a623 R=86 mf=0.72 hf=0.5 flash=206,136,270,166,8,2c333b
SC=0.90                      # Größe der ganzen Kamera gegenüber dem Entwurf, bis Stand 45 0.84
OX,OY=256,259                # Mitte der Kamera im Entwurf, landet genau in der Bildmitte
S=4; N=512*S
FG=(255,255,255,255)

def camera(bg, lens, fg=FG, hands=FG, R=96, mf=0.58, hf=0.44, flash=None):
    """Kamera auf 512 x 512. Ist bg durchsichtig, bleibt alles außer der Kamera durchsichtig.
    flash: Blitzfenster im Höcker als (x0, y0, x1, y1, Radius, Farbe) in Entwurfskoordinaten."""
    def X(v): return int(round((256+(v-OX)*SC)*S))
    def Y(v): return int(round((256+(v-OY)*SC)*S))
    def L(v): return int(round(v*SC*S))
    img=Image.new('RGBA',(N,N),bg); d=ImageDraw.Draw(img)
    # Gehäuse und Sucherhöcker, beide mit runden Ecken
    bx0,by0,bx1,by1=100,170,412,390; br=44
    hx0,hy0,hx1=170,124,306; hr=22
    d.rounded_rectangle([X(bx0),Y(by0),X(bx1),Y(by1)],L(br),fill=fg)
    d.rounded_rectangle([X(hx0),Y(hy0),X(hx1),Y(by0+40)],L(hr),fill=fg)
    # Weiche Übergänge zwischen Höcker und Gehäuse statt spitzer Innenecken
    f=16
    d.rectangle([X(hx0-f),Y(by0-f),X(hx0),Y(by0)],fill=fg)
    d.ellipse([X(hx0-2*f),Y(by0-2*f),X(hx0),Y(by0)],fill=bg)
    d.rectangle([X(hx1),Y(by0-f),X(hx1+f),Y(by0)],fill=fg)
    d.ellipse([X(hx1),Y(by0-2*f),X(hx1+2*f),Y(by0)],fill=bg)
    # Blitzfenster im Höcker
    if flash:
        fx0,fy0,fx1,fy1,fr,fc=flash
        d.rounded_rectangle([X(fx0),Y(fy0),X(fx1),Y(fy1)],L(fr),fill=fc)
    # Uhr als Objektiv mit zwei Zeigern, die Strichstärke wächst mit dem Objektiv
    cx,cy=256,282
    d.ellipse([X(cx-R),Y(cy-R),X(cx+R),Y(cy+R)],fill=lens)
    w=15*R/96
    def hand(x2,y2):
        d.line([X(cx),Y(cy),X(x2),Y(y2)],fill=hands,width=L(w))
        for x,y in((cx,cy),(x2,y2)):
            d.ellipse([X(x-w/2),Y(y-w/2),X(x+w/2),Y(y+w/2)],fill=hands)
    hand(cx,cy-mf*R)
    a=math.radians(30); hand(cx+hf*R*math.cos(a),cy+hf*R*math.sin(a))
    return img.resize((512,512),Image.LANCZOS)

if __name__=='__main__':
    rgb=lambda h: tuple(bytes.fromhex(h))+(255,)
    pos=[a for a in sys.argv[1:] if '=' not in a]
    opt=dict(a.split('=',1) for a in sys.argv[1:] if '=' in a)
    shape=dict(R=float(opt.get('R',96)), mf=float(opt.get('mf',0.58)), hf=float(opt.get('hf',0.44)))
    if 'flash' in opt:   # flash=x0,y0,x1,y1,Radius,Farbe, Farbe als Hex ohne #
        f=opt['flash'].split(','); shape['flash']=tuple(float(v) for v in f[:5])+(rgb(f[5]),)
    if pos[0]=='android':
        flavor=pos[1]; bg=rgb(pos[2]); cam=rgb(pos[3]); lens=rgb(pos[4]) if len(pos)>4 else bg
        hands=rgb(pos[5]) if len(pos)>5 else cam
        res=f'android/laglab/src/{flavor}/res/mipmap-xxxhdpi'
        # Vordergrund mit 108 dp, davon zeigt Android die mittleren 72 dp. Die Kamera sitzt in diesen 72 dp
        # so groß wie im Symbol der Web-App.
        fg=Image.new('RGBA',(768,768),(0,0,0,0))
        fg.paste(camera((0,0,0,0),lens,cam,hands,**shape),(128,128))
        fg.resize((432,432),Image.LANCZOS).save(f'{res}/ic_launcher_foreground.png',optimize=True)
        camera(bg,lens,cam,hands,**shape).convert('RGB').resize((192,192),Image.LANCZOS).save(f'{res}/ic_launcher.png',optimize=True)
    else:
        out=pos[0]; bg=rgb(pos[1]) if len(pos)>1 else (17,32,62,255)
        lens=rgb(pos[2]) if len(pos)>2 else bg
        cam=rgb(opt['cam']) if 'cam' in opt else FG
        hands=rgb(opt['hands']) if 'hands' in opt else FG
        img=camera(bg,lens,cam,hands,**shape).convert('RGB')
        for size in (512,192):
            img.resize((size,size),Image.LANCZOS).save(f'{out}/icon-{size}.png',optimize=True)
