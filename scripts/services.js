// @ts-check

/* Types */

/**
 * Unit for abbreviation
 * @typedef {Object} Unit
 * @property {number} value
 * @property {string} suffix
 */


/**
 * Manage cookies
 *  */
export const CookieService = {
    setCookie: /**
     * Set a cookie value
     *
     * @param {string} name
     * @param {any} obj
     * @param {number} [days=7]
     */
    function(name, obj, days = 7)
    {
        const value = encodeURIComponent(JSON.stringify(obj));
        const exp = new Date();
        exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${exp.toUTCString()};path=/`;
    },
    getCookie: /**
     * Get a cookie value
     *
     * @template T
     *
     * @param {string} name
     * @param {T} def
     * @return {T}
     */
    function(name, def)
    {
        const cookies = document.cookie.split("; ");
        for (const c of cookies)
        {
            const [key, value] = c.split("=");
            if (key == name)
            {
                return JSON.parse(decodeURIComponent(value));
            }
        }
        return def;
    }
}
export const EMPTY = {};

let _Units = [
    { value: 1e3 , suffix: 'k' },
    { value: 1e6 , suffix: 'm' },
    { value: 1e9 , suffix: 'B' },
    { value: 1e12, suffix: 'T' },
    { value: 1e15, suffix: 'Qd' },
    { value: 1e18, suffix: 'Qt' },
    { value: 1e21, suffix: 'Sx' },
]

export const UnitService = {
    Unit: {
        new: /**
         * Creates a new unit
         *
         * @param {number} value
         * @param {string} suffix
         *
         * @return {Unit}
         */
        function(value, suffix) { return { value: value, suffix: suffix } },

        KMBT: _Units,
    },
    convert: /**
     * "Gameifies" a number
     *
     * @param {number} value
     * @param {Unit[]} units
     */
    function(value, units = _Units)
    {
        const abs = Math.abs(value);

        let sortedUnits = units.sort((a, b) => b.value - a.value);

        for (const unit of sortedUnits)
        {
            if (abs >= unit.value)
            {
                const result = value / unit.value;
                return ( parseFloat(result.toFixed(2).toString()) + unit.suffix );
            }
        }

        return value.toString();
    }
}
