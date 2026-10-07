import {test as base} from '@playwright/test';
import {readFileSync, existsSync, statSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
// Production-bundle fallback for hosts whose sandbox denies localhost sockets.
// With the switch absent this is the ordinary Playwright context fixture.
export const test = base.extend({
  context: async ({context}, use) => {
    if (process.env.JAWI_STATIC_TEST === '1') {
      const root=resolve('dist');
      await context.route('http://127.0.0.1:5173/**', async route => {
        const url=new URL(route.request().url());
        let path=resolve(root, `.${decodeURIComponent(url.pathname)}`);
        if (!path.startsWith(root+sep) && path!==root) return route.fulfill({status:403,body:''});
        if (!existsSync(path) || statSync(path).isDirectory()) path=resolve(root,'index.html');
        const data=readFileSync(path), type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'}[extname(path)] || 'application/octet-stream';
        const headers={'content-type':type,'accept-ranges':'bytes'}, range=route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
        if (range) {
          const from=+range[1], to=Math.min(data.length-1,range[2]?+range[2]:data.length-1);
          if (from>to) return route.fulfill({status:416,headers:{'content-range':`bytes */${data.length}`},body:''});
          return route.fulfill({status:206,headers:{...headers,'content-range':`bytes ${from}-${to}/${data.length}`},body:data.subarray(from,to+1)});
        }
        await route.fulfill({status:200,headers,body:data});
      });
    }
    await use(context);
  },
});
