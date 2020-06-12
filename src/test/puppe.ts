import { Browser, Page, launch } from 'puppeteer';
import { start, EasyServer } from '../server/noticias';
import { Commons } from '../client/common';

const MAIN_URL=`http://localhost:3303/`;

describe("basic complete tests", function(){
    this.timeout(20000);
    var browser: Browser;
    var page: Page;
    var server:EasyServer;
    var common = new Commons();
    before(async ()=>{
        common.setDevelMode({});
        server = new EasyServer(common);
        await server.startListening();
        browser = await launch({headless: false});
    })
    beforeEach(async ()=>{
        page = await browser.newPage();
    })
    afterEach(async()=>{
        await page.close();
    })
    after(async()=>{
        await server.stopListening();
        await browser.close();
    })
    it("navigate to the list", async function(){
        await page.goto(MAIN_URL);
        await page.click('#titulos');
        await page.waitForSelector('#title-list');
        await page.waitForSelector('#title-3');
    })
    it.skip("navigate to the list then return to menu", async function(){
        await page.goto(MAIN_URL);
        await page.click('#titulos');
        await page.waitForSelector('#title-list');
        await page.goBack();
        await page.waitForSelector('#titulos');
    })
    it("navigate to the list then return to menu with the button", async function(){
        await page.goto(MAIN_URL);
        await page.click('#titulos');
        await page.waitForSelector('#title-list');
        await page.click('#principal');
        await page.waitForSelector('#titulos');
    })
});
