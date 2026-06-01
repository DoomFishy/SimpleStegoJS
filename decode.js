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
        let width = this.findHeader(this.stego_data, this.header_positions, 0);
        let height = this.findHeader(this.stego_data, this.header_positions, 32);


        if (width < 0 || width > this.stego_data.width){
            width = generator.randomizeSize(this.stego_data.width, password);
        }
        
        if (height < 0 || height > this.stego_data.height){
            height = generator.randomizeSize(this.stego_data.height, password);
        }

        console.log(width + " | " + height);

        let image = this.findData(this.stego_data, width, height, this.data_positions);
    
        return image;
    }

    findHeader(target, header_positions, offset){
        console.log("-------= " + offset + " =------");
        let size = header_positions.length / 2;
        let dimension = 0;

        for (let i = 0; i < 32; i++){
            let index = i + offset;
            let x = header_positions[index].x
            let y = header_positions[index].y

            let target_pixel = this.getPixel(x, y, target.data, target.width);
    
            let r = this.findBits(target_pixel.r, this.lsb_bits);
            let g = this.findBits(target_pixel.g, this.lsb_bits);
            let b = this.findBits(target_pixel.b, this.lsb_bits);

            let shift = (size - 1 - i) * this.lsb_bits * 3;

            dimension = dimension | (r << (shift + this.lsb_bits * 2));
            dimension = dimension | (g << (shift + this.lsb_bits));
            dimension = dimension | (b << (shift));
        }

        return dimension;
    }

    findData(target, width, height, data_positions){
        let extracted_data = new Uint8ClampedArray(width * height * 4);
        let index = 0;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {

                let x = data_positions[index].x;
                let y = data_positions[index].y;

                let target_pixel = this.getPixel(x, y, target.data, target.width);
               
                let r = this.findBits(target_pixel.r, this.lsb_bits) * (255 / (Math.pow(2, this.lsb_bits) - 1));
                let g = this.findBits(target_pixel.g, this.lsb_bits) * (255 / (Math.pow(2, this.lsb_bits) - 1));
                let b = this.findBits(target_pixel.b, this.lsb_bits) * (255 / (Math.pow(2, this.lsb_bits) - 1));

                let hidden_pixel = { r: r, g: g, b: b };

                extracted_data = this.setPixel(j, i, extracted_data, hidden_pixel, width);

                index++;
            }
        }

        return {
            data: extracted_data,
            width: width,
            height: height
        };
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
        target_data[index + 3] = 255;
        return target_data;
    }

    setStegoImage(image_data){
        this.stego_data = image_data;
    }
}