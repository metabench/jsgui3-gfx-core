

// 1 bit images would make use of the palette in a different way.

class Palette {

    // Itself will hold colors.





    constructor(spec) {
        if (!Array.isArray(spec)) {
            throw new TypeError('Palette colors must be supplied as an array');
        }

        let channel_count;
        const colors = spec.map((color, color_index) => {
            if (!Array.isArray(color) &&
                !(ArrayBuffer.isView(color) && !(color instanceof DataView))) {
                throw new TypeError(`Palette color ${color_index} must be an array`);
            }
            if (color.length < 1 || color.length > 4) {
                throw new RangeError(`Palette color ${color_index} must have 1 to 4 channels`);
            }
            if (channel_count === undefined) channel_count = color.length;
            if (color.length !== channel_count) {
                throw new RangeError('All palette colors must have the same channel count');
            }

            const copy = Array.from(color);
            for (const channel of copy) {
                if (!Number.isInteger(channel) || channel < 0 || channel > 255) {
                    throw new RangeError('Palette channels must be integers from 0 to 255');
                }
            }
            return Object.freeze(copy);
        });

        Object.defineProperties(this, {
            colors: {value: Object.freeze(colors), enumerable: true},
            length: {value: colors.length, enumerable: true},
            channel_count: {value: channel_count || 0, enumerable: true}
        });

        // Preserve the intended array-like access without a Proxy on every
        // read.  Entries are immutable copies, so input mutation cannot alter
        // the palette.
        for (let index = 0; index < colors.length; index++) {
            Object.defineProperty(this, index, {
                value: colors[index],
                enumerable: true,
                writable: false,
                configurable: false
            });
        }
    }

    at(index) {
        return index < 0 ? this.colors[this.length + index] : this.colors[index];
    }

    indexOf(color) {
        if (!color || color.length !== this.channel_count) return -1;
        return this.colors.findIndex(candidate =>
            candidate.every((channel, index) => channel === color[index])
        );
    }

    has(color) {
        return this.indexOf(color) !== -1;
    }

    [Symbol.iterator]() {
        return this.colors[Symbol.iterator]();
    }

    toJSON() {
        return this.colors;
    }

}

module.exports = Palette;
