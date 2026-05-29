export class GeneratePositions {

    constructor(width, height, password){
        this.image_width = width;
        this.image_height = height;

        this.all_positions = [];
        this.scrambled_positions = [];

        this.setPositions();
        this.scramblePositions(password);
    }

    setPositions(){
        for (let i = 0; i < this.image_height; i++){
            for (let j = 0; j < this.image_width; j++){
                this.all_positions.push({x: j,y: i});
            }
        }
    }

    scramblePositions(password){
        const rng = isaacCSPRNG(password);
        const max = this.all_positions.length;


        this.scrambled_positions = this.all_positions;

        for (let i = max - 1; i > 0; i--){
            const j = rng.range(0, i)

            let temp = this.scrambled_positions[i];
            this.scrambled_positions[i] = this.scrambled_positions[j];
            this.scrambled_positions[j] = temp;
        }
    }

    getScrambledPositions(){
        return this.scrambled_positions
    }
}