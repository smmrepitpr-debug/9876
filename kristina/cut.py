import sys,os
from rembg import remove,new_session
from PIL import Image
s=new_session('isnet-general-use')
for n in sys.argv[1:]:
    o=f'cut56/k{n}.png'
    if os.path.exists(o): continue
    im=Image.open(f'src56/kristina_{n}.jpg').convert('RGB')
    r=remove(im,session=s,post_process_mask=True)
    r=r.crop(r.getbbox());r.save(o);print(n,r.size,flush=True)
