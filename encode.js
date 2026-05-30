import { GeneratePositions } from "./generatePositions.js";

export class StegoEncoder {

    constructor(){
        this.cover_data;
        this.secret_data;

        this.password;
        this.lsb_bits = 7; 

        this.header_positions;
        this.data_positions;
    }

    encode(password){
        let generator = new GeneratePositions(this.cover_data.width, this.cover_data.height, password);
        this.positions = generator.getScrambledPositions();

        this.header_positions = this.positions.slice(0, 64);
        this.data_positions = this.positions.slice(64, this.positions.length);


        let image = this.hideHeader(this.cover_data, this.cover_data.width, this.header_positions);
        image = this.hideHeader(this.cover_data, this.cover_data.height, this.header_positions);

        image = this.hideData(this.cover_data, this.secret_data, this.data_positions);
        return image;
    }

    hideHeader(target, dimension, header_positions){
        let size = header_positions.length / 2;

        for (let i = 0; i < size; i++){
            let x = header_positions[i].x
            let y = header_positions[i].y

            let target_pixel = this.getPixel(x, y, target.data, target.width);

            let shift = (size - 1 - i) * this.lsb_bits * 3;
            
            let r = (dimension >> (shift + this.lsb_bits * 2)) & ((1 << this.lsb_bits) - 1);
            let g = (dimension >> (shift + this.lsb_bits)) & ((1 << this.lsb_bits) - 1);
            let b = (dimension >> shift) & ((1 << this.lsb_bits) - 1);

            let new_r = this.hideBits(target_pixel.r, r, this.lsb_bits);
            let new_g = this.hideBits(target_pixel.g, g, this.lsb_bits);
            let new_b = this.hideBits(target_pixel.b, b, this.lsb_bits);

            let new_pixel = {r: new_r, g: new_g, b: new_b};

            target.data = this.setPixel(x, y, target.data, new_pixel, target.width);
        }
    }

    hideData(target, source, data_positions){
        let index = 0;

        for (let i = 0; i < target.height; i++){
            for (let j = 0; j < target.width; j++){
                
                if (i < source.height){
                    if (j < source.width){
                        let x = data_positions[index].x
                        let y = data_positions[index].y

                        let target_pixel = this.getPixel(x, y, target.data, target.width);
                        let source_pixel = this.getPixel(j, i, source.data, source.width);

                        let r = this.hideBits(target_pixel.r, source_pixel.r, this.lsb_bits);
                        let g = this.hideBits(target_pixel.g, source_pixel.g, this.lsb_bits);
                        let b = this.hideBits(target_pixel.b, source_pixel.b, this.lsb_bits);

                        let new_pixel = {r: r, g: g, b: b};
                        target.data = this.setPixel(x, y, target.data, new_pixel, target.width);
                        index++;
                    }
                }
                else {
                    return target;
                }
            }
        }

        return target;
    }

    hideBits(target, source, lsb){

        for (let i = 0; i < lsb; i++){
            let bit = (source >> i) & 1;

            if (bit == 1){
                //console.log("Was " + target.toString(2) + " replaced with 1");
                target = target | (1 << i);
                //console.log("Now " + target.toString(2));
            }

            else{
                //console.log("Was " + target.toString(2) + " replaced with 0");
                target = target & ~(1 << i);
                //console.log("Now " + target.toString(2));
            }
        }

        return target;
    }

    getPixel(x, y, image_data, width){
        const index = (y * width + x) * 4;
        return {
            r: image_data[index],
            g: image_data[index + 1],
            b: image_data[index + 2],
            a: image_data[index + 3]
        }
    }

    setPixel(x, y, target_data, pixel, width){
        const index = (y * width + x) * 4;

        target_data[index] = pixel.r;
        target_data[index + 1] = pixel.g;
        target_data[index + 2] = pixel.b;

        return target_data;
    }

    setCoverImage(image_data){
        this.cover_data = image_data;
    }

    setSecretImage(image_data){
        this.secret_data = image_data;
 
    }

    setPassword(password){
        this.password = password;
    }
}