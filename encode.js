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
    }

    encode(){
        let generator = new GeneratePositions(this.cover_width, this.cover_height, this.password);
        this.positions = generator.getScrambledPositions();

        let x = this.positions[0].x;
        let y = this.positions[0].y;

        let pixel = this.getPixel(x, y);
        console.log(pixel);
    }

    getPixel(x, y){
        const index = (y * this.cover_width + x) * 4;
        return {
            r: this.cover_data[index],
            g: this.cover_data[index + 1],
            b: this.cover_data[index + 2],
            a: this.cover_data[index + 3]
        }
    }


    setCoverImage(image_data){
        this.cover_data = image_data.data;
        this.cover_width = image_data.width;
        this.cover_height = image_data.height;
    }

    setSecretImage(image_data){
        this.cover_data = image_data.data;
        this.cover_width = image_data.width;
        this.cover_height = image_data.height;    
    }

    setPassword(password){
        this.password = password;
    }
}