from playwright.sync_api import sync_playwright,expect
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from tempfile import TemporaryDirectory
import atexit
import os
import shutil
import threading

ROOT=Path(__file__).resolve().parents[1]
if not (ROOT/'dist/index.html').exists():
 raise SystemExit('Run npm run build before this browser check.')
site=TemporaryDirectory(prefix='parallel-life-site-')
(Path(site.name)/'happycoding').symlink_to(ROOT/'dist',target_is_directory=True)
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,format,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=site.name))
threading.Thread(target=server.serve_forever,daemon=True).start()
def cleanup():
 server.shutdown()
 server.server_close()
 site.cleanup()
atexit.register(cleanup)
BASE=f'http://127.0.0.1:{server.server_port}/happycoding/'
OUT=Path(os.environ.get('ARTIFACT_DIR','/tmp/parallel-life-browser'))
OUT.mkdir(parents=True,exist_ok=True)
BROWSER=shutil.which('chromium')

def pick(page,id):
 if page.locator('.skip-dialogue').is_visible(): page.locator('.skip-dialogue').click()
 page.locator(f'[data-choice="{id}"]').click()
 expect(page.locator('[data-choice="'+id+'"]')).to_have_count(0)
def start_game(page):
 page.goto(BASE)
 expect(page.locator('.product')).to_have_count(18)
 page.locator('[data-product="cat"]').first.click()
 page.locator('[data-product="dream"]').first.click()
 if not page.locator('.checkout').is_visible(): page.locator('.basket-mobile').click()
 page.locator('.checkout').click()
 page.locator('[data-action="finish"]').click()
 page.get_by_role('button',name='去过这一天 →').click()
 expect(page.locator('.narrative h1')).to_contain_text('暂停营业')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=BROWSER,args=['--no-sandbox','--enable-unsafe-swiftshader'])
 context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 start_game(page)
 expect(page.locator('.world-canvas canvas')).to_have_count(1)
 page.locator('.world-canvas canvas').click(position={'x':720,'y':400})
 expect(page.locator('.inspection')).to_be_visible()
 page.get_by_role('button',name='关闭观察').click()
 page.get_by_role('button',name='环顾四周').click()
 expect(page.locator('.inspection')).to_be_visible()
 page.get_by_role('button',name='关闭观察').click()
 page.locator('[data-action="advance"]').click()
 expect(page.locator('.spoken-line')).to_contain_text('明天因故取消')
 page.screenshot(path=str(OUT/'story-dialogue.png'),full_page=True)
 page.locator('.skip-dialogue').click()
 page.screenshot(path=str(OUT/'story-opening.png'),full_page=True)
 pick(page,'follow-cat');expect(page.locator('.narrative h1')).to_contain_text('罐头本位制')
 pick(page,'cat-partner');pick(page,'sign-seat');pick(page,'try-cat');pick(page,'use-cat-care');pick(page,'help-wish');pick(page,'promise-birthday');pick(page,'face-partner')
 expect(page.locator('.narrative h1')).to_contain_text('合作伙伴')
 page.reload();expect(page.locator('.narrative h1')).to_contain_text('合作伙伴')
 page.get_by_role('button',name='行囊与足迹').click()
 assert page.locator('.inventory strong').count()==2
 page.get_by_role('button',name='关闭行囊').click()
 for id in ['share-ownership','redact-name','enter-cat-dream','cat-retake','call-cat','honor-cat','keep-powers','end-company']:pick(page,id)
 expect(page.locator('.narrative h1')).to_contain_text('猫司实习生')
 expect(page.locator('.promise-note')).to_contain_text('纸箱')
 page.get_by_role('button',name='行囊与足迹').click()
 expect(page.locator('.ending-collection summary')).to_contain_text('1 / 8')
 page.get_by_role('button',name='关闭行囊').click()
 with page.expect_download() as d:page.get_by_role('button',name='保存完整人生档案').click()
 d.value.save_as(str(OUT/'story-archive.png'))
 page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))},configurable:true})")
 page.get_by_role('button',name='复制文字',exact=True).click();expect(page.locator('#copy-fallback')).to_be_visible();assert '猫司实习生' in page.locator('#copy-fallback').input_value()
 page.get_by_role('button',name='关闭复制文本').click()
 page.screenshot(path=str(OUT/'story-ending.png'),full_page=True)
 page.once('dialog',lambda d:d.accept());page.get_by_role('button',name='同样的能力，换一种走法').click()
 for id in ['steal-contract','give-driver','keep-rendezvous','ordinary-exit','carry-boxes','answer-home','promise-home','face-search']:pick(page,id)
 expect(page.locator('.narrative h1')).to_contain_text('包里的证据')
 expect(page.locator('[data-choice="return-original"]')).to_have_count(0)
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(OUT/'story-mobile.png'),full_page=True)
 for id in ['call-custodian','redact-name','read-letter','keep-letter','call-driver','return-for-driver','return-all','end-sunday']:pick(page,id)
 expect(page.locator('.narrative h1')).to_contain_text('把周日留给所有人')
 page.get_by_role('button',name='行囊与足迹').click()
 expect(page.locator('.ending-collection summary')).to_contain_text('2 / 8')
 page.get_by_role('button',name='关闭行囊').click()
 assert page.locator('.inventory .surrendered').count()==2
 page.reload();expect(page.locator('.narrative h1')).to_contain_text('把周日留给所有人')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 # Replay action works from keyboard; cancelling does not destroy the current run.
 page.once('dialog',lambda d:d.dismiss());button=page.get_by_role('button',name='同样的能力，换一种走法');button.focus();page.keyboard.press('Enter');expect(page.locator('.narrative h1')).to_contain_text('把周日留给所有人')
 context.close();browser.close()
 # Deliberately unavailable WebGL and storage must not block the story.
 browser=p.chromium.launch(headless=True,executable_path=BROWSER,args=['--no-sandbox','--disable-webgl'])
 page=browser.new_page(viewport={'width':375,'height':812},reduced_motion='reduce');page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('disabled')}})")
 start_game(page)
 expect(page.locator('.world-fallback')).to_be_visible()
 expect(page.locator('.game-storage-warning')).to_contain_text('无法存档')
 pick(page,'steal-contract');expect(page.locator('.narrative h1')).to_contain_text('公文包里没有鱼')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(OUT/'story-fallback.png'),full_page=True)
 browser.close()
 assert not errors,errors
 print('PASS: React shop, 3D canvas, two distinct complete routes, original custody gates, refresh replay, 2-ending collection, surrendered inventory, PNG archive, copy fallback, mobile/no overflow, keyboard cancellation, no-WebGL/no-storage fallback; no uncaught browser errors.')
