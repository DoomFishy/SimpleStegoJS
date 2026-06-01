import { GeneratePositions } from "./generatePositions.js";

export class StegoDecoder {

    constructor(){
        this.stego_data;

        this.password;
        this.lsb_bits = 1; 

        this.header_positions;
        this.data_positions;
    }

    decode(password, lsb){
        this.lsb_bits = lsb;
        this.password = password;

        let generator = new GeneratePositions(this.stego_data.width, this.stego_data.height, password);
        this.positions = generator.getScrambledPositions();

        this.header_positions = this.positions.slice(0, 64);
        this.data_positions = this.positions.slice(64, this.positions.length);

        //let image = this.hideHeader(this.cover_data, this.cover_data.width, this.header_positions);
        //image = this.hideHeader(this.cover_data, this.cover_data.height, this.header_positions);
        let width = this.findHeader(this.stego_data, this.header_positions);
        let height = this.findHeader(this.stego_data, this.header_positions);
        let image = this.findData(this.stego_data, 594, 710, this.data_positions);
        return image;
    }

    findHeader(target, header_positions){
        let size = header_positions.length / 2;
        let dimension = 0;

        for (let i = 0; i < size; i++){
            let x = header_positions[i].x
            let y = header_positions[i].y

            let target_pixel = this.getPixel(x, y, target.data, target.width);
    
            let r = this.findBits(target_pixel.r, this.lsb_bits);
            let g = this.findBits(target_pixel.g, this.lsb_bits);
            let b = this.findBits(target_pixel.b, this.lsb_bits);

            let shift = (size - 1 - i) * this.lsb_bits * 3;

            dimension = dimension | (r << (shift + this.lsb_bits * 2))
            dimension = dimension | (g << (shift + this.lsb_bits))
            dimension = dimension | (b << (shift))
        }

        return dimension;
    }

    findData(target, height, width, data_positions){
        let index = 0;
        let image_data;

        for (let i = 0; i < target.height; i++){
            for (let j = 0; j < target.width; j++){
                
                if (i < height){
                    if (j < width){
                        let x = data_positions[index].x
                        let y = data_positions[index].y
                        
                        let target_pixel = this.getPixel(x, y, target.data, target.width);

                        let r = this.findBits(target_pixel.r, this.lsb_bits) * (255 / (Math.pow(2, this.lsb_bits) - 1)); 
                        let g = this.findBits(target_pixel.g, this.lsb_bits) * (255 / (Math.pow(2, this.lsb_bits) - 1)); 
                        let b = this.findBits(target_pixel.b, this.lsb_bits) * (255 / (Math.pow(2, this.lsb_bits) - 1)); 

                        let hidden_pixel = {r: r, g: g, b: b};

                        target.data = this.setPixel(j, i, this.stego_data.data, hidden_pixel, target.width);

                        if (index == 1){
                            console.log(hidden_pixel + " | " + this.lsb_bits + " | " + this.password);
                        }

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

    findBits(target, lsb){
        let mask = (1 << lsb) - 1

        return (target & mask);
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

    setStegoImage(image_data){
        this.stego_data = image_data;
    }
}