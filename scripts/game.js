// @ts-check

/* utils */

import {CookieService, EMPTY, UnitService} from "./services.js";

/* type definitions */

/* - structs */

/**
 * Shower type
 * @typedef {Object} Shower
 * @property {() => any} show
*/

/* - factories */

/**
 * Shower instance
 *
 * @type {{ showers: Shower[]; new: (callback: () => any) => Shower; showAll: () => void}}
 */
const Shower = {
    showers: [],
    new: /**
     * Shower factory
     *
     * @param {() => any} callback
     * @returns { Shower }
     */
    function(callback)
    {
        let s = { show: callback };
        this.showers.push(s);
        return s;
    },
    showAll: /** Shows all showers */
    function()
    {
        this.showers.forEach((shower) => {
            shower.show();
        })
    }
};

/* constants */

/** @type {HTMLButtonElement} */
const cookie = /** @type {HTMLButtonElement} */ (document.getElementById("cookie"));

/** @type {HTMLButtonElement} */
const upgradeClicker = /** @type {HTMLButtonElement} */ (document.getElementById("upgradeClicker"));

/** @type {HTMLButtonElement} */
const getAutoClicker = /** @type {HTMLButtonElement} */ (document.getElementById("getAutoClicker"));

/** @type {HTMLDivElement} */
const displayCookies = /** @type {HTMLDivElement} */ (document.getElementById("displayCookies"));

/** @type {HTMLDivElement} */
const displayUpgradeCost = /** @type {HTMLDivElement} */ (document.getElementById("displayUpgradeCost"));

/** @type {HTMLDivElement} */
const displayAutoClickerCost = /** @type {HTMLDivElement} */ (document.getElementById("displayAutoClickerCost"));

/** @type {HTMLParagraphElement[]} */
let paragraphShowers = /** @type {HTMLParagraphElement[]} */ (Array.from(document.querySelectorAll("p")))
paragraphShowers = paragraphShowers.filter((v) => v.getAttribute("show") != null)

const getAutoClickerInterval = () => Math.max(2_000 - ((Session.autoClickerUpgrade - 1) * 100), 50)

/* sounds */
const audios = {
    click: new Audio("./assets/sounds/click.ogg"),
    upgrade: new Audio("./assets/sounds/upgrade.ogg"),
}
Object.values(audios).forEach(a => {
    a.preload = "auto";
    a.load();
});
/**
 * @param {HTMLAudioElement} sound
 * @param {number} volume
 */
const _gensound = (sound, volume = 1) => () => {
    const audio = /** @type {HTMLAudioElement} */ (sound.cloneNode());
    audio.volume = volume;
    audio.play();
}

const sounds = {
    click: _gensound(audios.click, .2),
    upgrade: _gensound(audios.upgrade, .5)
}

/* vars */

/**
 * Session object
 *
 * @typedef {{
 *      cookies: number;
 *      multiplier: number;
 *      multiplierCost: number;
 *      autoClickerCost: number;
 *      autoClickerUpgrade: number;
 *      loadData: () => void;
 *      saveData: () => void;
 *      get: <T>(value: string, Default: T) => T;
 * }} Session
 */
/** @type {Session} */
const Session = {
    cookies: 0,

    multiplier: 1,
    multiplierCost: 25,

    autoClickerCost: 50,
    autoClickerUpgrade: 0,

    loadData: function()
    {
        let data = CookieService.getCookie("cookie-clicker-jjs-session", EMPTY)
        Object.assign(this, data)
    },
    saveData: function()
    {
        CookieService.setCookie("cookie-clicker-jjs-session", this);
    },

    get: function(key, Default)
    {
        // @ts-ignore
        let k = this[key];
        if (k) return k;

        return Default;
    }
}

/* event listeners */

cookie.addEventListener("click", cookieClicked);
upgradeClicker.addEventListener("click", upgradeClickerClicked);
getAutoClicker.addEventListener("click", getAutoClickerClicked);
document.addEventListener("visibilitychange", onExit)
window.addEventListener("beforeunload", onExit)

Session.loadData();
AutoClicker();
LoadPShowers();
setInterval(showAll, 1000 / 60); // updates each frame

/* showers */

/** Shows all values */
function showAll()
{
    Shower.showAll();
};

/** Displays the cookies */
const showCookieAmount = Shower.new(
    () =>
    {
        displayCookies.innerHTML = `
            <p>${UnitService.convert(Session.cookies)} cookies.</p>
        `;
    }
);

/** Displays the upgrade cost */
const showUpgradeCost = Shower.new(
    () =>
    {
        displayUpgradeCost.innerHTML = `
            <p>${UnitService.convert(Session.multiplierCost)} cookies</p>
        `;
        upgradeClicker.disabled = Session.cookies < Session.multiplierCost;
    }
);

/** Displays the auto clicker cost */
const showAutoClickerCost = Shower.new(
    () =>
    {
        displayAutoClickerCost.innerHTML = `
            <p>${UnitService.convert(Session.autoClickerCost)} cookies</p>
        `;
        let canBuy = Session.cookies < Session.autoClickerCost;
        let maxUpgraded = Session.autoClickerUpgrade > 24;
        getAutoClicker.disabled = canBuy || maxUpgraded;
    }
);

/* events */

/**
 * On cookie click
 * @param {PointerEvent?} e - click event
 */
function cookieClicked(e)
{
    Session.cookies = Session.cookies + Session.multiplier;
    sounds.click();
};

/**
 * On upgrade clicker clicked
 * @param {PointerEvent} e - click event
 */
function upgradeClickerClicked(e)
{
    if (Session.cookies >= Session.multiplierCost)
    {
        Session.cookies -= Session.multiplierCost;
        Session.multiplier += 1;
        Session.multiplierCost = Session.multiplier * 15;
        sounds.upgrade();
    }
};

/**
 * On get auto clicker clicked
 * @param {PointerEvent} e - click event
 */
function getAutoClickerClicked(e)
{
    if (Session.cookies >= Session.autoClickerCost)
    {
        Session.cookies -= Session.autoClickerCost;
        Session.autoClickerUpgrade += 1;
        Session.autoClickerCost = Session.autoClickerUpgrade * 50;
        sounds.upgrade();
    }
};

/**
 * When page's visibility changes or window closing
 *
 * @param {Event|BeforeUnloadEvent} e - window event
 */
function onExit(e)
{
    Session.saveData();
}

/* auto clicker system */


/** on Auto Clicker */
function AutoClicker()
{
    if (Session.autoClickerUpgrade == 0) {
        setTimeout(AutoClicker, 100);
    }
    let interval = getAutoClickerInterval();

    cookieClicked(null);

    setTimeout(AutoClicker, interval);
}

/** auto shower */
function LoadPShowers()
{
    console.log("Loading PShowers");
    paragraphShowers.forEach(function(p) {
        let show = /** @type {string} */ (p.getAttribute("show"));
        console.log(`Loading PShower ${show}`);
        let v = () => UnitService.convert(Session.get(show, 0))
        const phtml = p.innerHTML;
        Shower.new(function() {
            p.innerHTML = phtml.replace("\$", v().toString())
        })
    })
    console.log("PShowers loaded");
}
