import { GeneratePositions } from "./generatePositions.js";

export class StegoEncoder {

    constructor(){
        this.cover_data;
        this.secret_data;

        this.cover_width;
        this.cover_height
        this.secret_width;
        this.secret_height

        this.password;
        this.lsb_bits; 

        this.header_positions;
        this.data_positions;
    }

    encode(image_data, password){
        this.setPassword(password);

        let generator = new GeneratePositions(this.cover_width, this.cover_height, this.password);
        this.positions = generator.getScrambledPositions();

        this.header_positions = this.positions.slice(0, 64);
        this.data_positions = this.positions.slice(64, this.positions.length);

        let x = this.positions[0].x;
        let y = this.positions[0].y;

        let image = this.hideHeader(this.header_positions);
        let image = this.hideData(this.data_positions);

    }

    hideHeader(header_positions){
        let size = header_positions.length;

        for (let i = 0; i < size; i++){
            pixel_channel = getPixel(header_positions[i].x, header_positions[i].y, this.cover_data, this.width);
        }
    }

    hideData(target, source, data_positions){
        let image_data;

        for (let i = 0; i < target.height; i++){
            for (let j = 0; j < target.width; j++){
                
                if (i < source.height){
                    if (j < source.width){
                        let x = data_positions[j].x
                        let y = data_positions[j].y

                        target_pixel = this.getPixel(x, y, target.data, target.width)
                        source_pixel = this.getPixel(x, y, source.data, source.width)

                        target_pixel.r = hidBits(target_pixel.r, source_pixel.r, this.lsb);
                        target_pixel.g = hidBits(target_pixel.r, source_pixel.r, this.lsb);
                        target_pixel.b = hidBits(target_pixel.r, source_pixel.r, this.lsb);

                        image = setPixel(x, y, target_pixel)
                    }
                }
            }
        }

        return target;
    }

    hideBits(target, source, lsb){
        for (let i = 0; i < lsb; i++){
            bit = (source >> i) & 1;

            if (bit == 1){
                target = target | (1 << i);
            }

            else{
                target = target & ~(1 << i);
            }
        }

        return target
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

    setPixel(x, y, target_data, source_data, width){
        const index = (y * width + x) * 4;

        target_data[index].r = source_data[index].r
        target_data[index + 1].g = source_data[index + 1].g
        target_data[index + 2].b = source_data[index + 2].b

        return target_data
    }

    setCoverImage(image_data){
        this.cover_data = image_data.data;
        this.cover_width = image_data.width;
        this.cover_height = image_data.height;
    }

    setSecretImage(image_data){
        this.secret_data = image_data.data;
        this.secret_width = image_data.width;
        this.secret_height = image_data.height;    
    }

    setPassword(password){
        this.password = password;
    }
}