

const Shape = require('./Shape');

// new Rectangle([w, h], [x, y]); seems like the most standard format.
//.  Does seem best when defining the rectangle.
//.    Possibly have some default parameter order property? Or a bit of online explanation?

const {tof, get_item_sig, is_arr_of_t} = require('lang-mini');


//.  what it is, where it is???
//.  or [pos, size]????
// But it can exist without its position (usually / in theory at least).

// 

// May be worth considering some kind of virtual (non-JS-class) rectangles that can be accessed through operations on 
//.  a single class instance that internally uses a ta efficiently?
//.   Could have an API that returns Rectangle class instances but internally keeps all the data in a single (large enough) ta.
//.     That would likely be best regarding performance concerns.



// Rectangular_Geometry_Virtual_Container perhaps....

// That could be a really specific class for 

// Could have some kind of lower level Geometry_Container.
//.Or Rect_Geometry_Container
//.  With capabilities and optimisations specifically for multiple rectangles on a 2d plane.

// Could allow dealing with many rectangles without using the garbage collector for them.

// Does seem worth using 'prop' function for brevity.

const {prop, get_set} = require('obext');

// But want to be able to have this within a coord system where the y coordinates increase downwards.

// rect.box???

// rect.ta may help in some / many cases.

// .rect.box perhaps????
// .rect.coords ? .r.c?

// and have jsgui3-html make use of this Rectangle class.
//.  will support collision detection / avoidance for controls, which will help controls dynamically rearrange themselves.



class Rectangle extends Shape {

    // y_axis_up_direction = -1 for example?

    // up property being -1 or 1?
    //. y_axis_scaling_factor = -1 would make sense here.

    // though up_is_negitive would be simpler and quicker logically, could subtract vectors rater than multiply them by -1 and
    // then add them.





    // Should hold a typed array to keep a few values.
    //.  Or even be able to be part of a larger typed array holding many rects.

    // up_direction...?

    // up = +1?



    constructor(...a) {
        super(...a);

        this.up_is_negitive = true;
        

        const al = a.length;

        // Could provide it a single typed array. That could maybe be initialised as a subarray (from the spec).

        let x, y, w, h;

        const sig = get_item_sig(a, 2);
        //console.log('sig', sig);

        if (sig === '[[n,n],[n,n]]') {
            [[w, h], [x, y]] = a;
        }

        // Maybe defineProperty would be the better way here???

        // const get_set = (obj, prop_name, fn_get, fn_set) => {

        // And get_set could raise change events too....

        get_set(this, 'x', () => x, (value) => x = value);
        get_set(this, 'y', () => y, (value) => y = value);
        get_set(this, ['w', 'width'], () => w, (value) => w = value);
        get_set(this, ['h', 'height'], () => h, (value) => h = value);
        
        get_set(this, 'size', () => [w, h], (value) => [w, h] = value);
        get_set(this, 'pos', () => [x, y], (value) => [x, y] = value);



        get_set(this, 'left', () => x);
        get_set(this, 'top', () => this.up_is_negitive ? y : y + h, value => this.up_is_negitive ? y = value : y = value - height);


        get_set(this, 'right', () => x + w);
        get_set(this, 'bottom', () => this.up_is_negitive ? y + h : y);


        // The bcr interface.

        const using_bcr_interface = true;

        if (using_bcr_interface) {
            get_set(this, '0', () => [x, y]);
            get_set(this, '1', () => [this.right, this.bottom]);
            get_set(this, '2', () => [w, h]);
        }


        
        


        // then the bounds...

        // t, r
        // top and right....





        //prop(this, '')

        //. Though that arrangement with y being top will not always be the case.
        //.   Probably want that as an option in some place, such as when declaring a coord space.



        // properties such as width, height, left (x), top (y)

        //if (al === 2) {
            // [size, pos]




            // And are they both arrays?

        //}
    }

    extend(direction, px) {
        if (direction === 'left' || direction === 'l') {
            const cx = this.x, cw = this.width;
            this.x = cx - px;
            this.width = cw + px;
        } else if (direction === 'right' || direction === 'r') {
            const cx = this.x, cw = this.width;
            //this.x = cx - px;
            this.width = cw + px;
        } else if (direction === 'up' || direction === 'u') {
            //const cx = this.x, cw = this.width;
            //this.x = cx - px;
            //this.width = cw + px;

            if (this.up_is_negitive) {
                this.y = this.y - px;
                this.h = this.h + px;
            } else {
                this.h = this.h + px;
            }
        } else if (direction === 'down' || direction === 'd') {
            //const cx = this.x, cw = this.width;
            //this.x = cx - px;
            //this.width = cw + px;

            if (!this.up_is_negitive) {
                this.y = this.y - px;
                this.h = this.h + px;
            } else {
                this.h = this.h + px;
            }
        } else {
            throw 'Supported directions: left l right r up u down d';
        }
        return this;
    }


    // Maybe we don't want Control specific things in here???
    //.  Seems OK for now, though maybe should refactor it out later on.
    //.  And this gfx-core is specific to jsgui3 so let's do it.

    overlaps(overlap_target) {

        const a = arguments;
        const al = a.length;

        if (al === 1) {

            // Identify if it's an array of controls....

            // shared_tof ???

            const t_overlap_target = tof(overlap_target);
            if (t_overlap_target === 'array') {
                if (is_arr_of_t(overlap_target, 'control')) {
                    const res = [];

                    // then go through the overlap target array of controls...

                    for (const target_ctrl of overlap_target) {
                        //const target_bcr = target_ctrl.bcr();
                        const target_overlap = this.overlaps(target_ctrl);
                        if (target_overlap) { res.push(target_overlap)}
                        
                    }
                    return res;

                }
            } else if (t_overlap_target === 'control') {
                const target_bcr = overlap_target.bcr();
                return this.overlaps(target_bcr);

            } else if (overlap_target instanceof Rectangle) {

                // Need to do the computation....

                // Want to produce the overlapping rect if there is such a thing.
                //.  Otherwise, false.

                // Possibly rule it out quickly first....

                // Calculate a bunch of offsets...? (subtractions)

                // rect 1 is above rect 2
                // rect 2 is above rect 1
                //  below
                //. left of
                //. right of

                // So that is 8 checks.
                //.  Then if it's not checked like that, we have an overlap.
                //.   Then detect where the overlap is....

                const calculate_overlap = (box1, box2) => {
                    const x = Math.max(box1.x, box2.x);
                    const y = Math.max(box1.y, box2.y);
                    const w = Math.min(box1.x + box1.w, box2.x + box2.w) - x;
                    const h = Math.min(box1.y + box1.h, box2.y + box2.h) - y;
                  
                    if (w <= 0 || h <= 0) {
                        return false; // No overlap
                    } else {
                        return new Rectangle([w, h], [x, y]);
                    }
                  
                    
                };

                return calculate_overlap(this, overlap_target);


            }

            


        } else {
            console.trace();
            throw 'NYI';
        }

        // Or even have it able to take an array of targets in the multiple params?

        // is overlap_target an array of controls???

        // Is the overlap target an array? a collective???

        // array of controls?
        // iterator of controls?
        // iterable function of controls?

    }

    // Properties



}


if (require.main === module) {
    const rect = new Rectangle([30, 40], [100, 100]);
    console.log('rect', rect);

    console.log('rect.right', rect.right);

    rect.extend('l', 40);
    rect.extend('u', 40);


    console.log('rect.left', rect.left);
    console.log('rect.top', rect.top);
    console.log('rect.right', rect.right);

    // rect.pos


}


module.exports = Rectangle;