import { StegoEncoder } from "./encode.js";

let encoder = new StegoEncoder();

document.getElementById('upload-cover').addEventListener('change', function(e) {
  const file = e.target.files[0];
    
  if (file && file.type.startsWith('image/')) {
    const img = new Image();

    img.onload = function(){
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data; // extract pixels

      /*
      for (let i = 0; i < pixels.length; i+= 4){
        pixels[i] = (pixels[i] & 0xFE) | 1; // Red
        pixels[i+1] = (pixels[i+1] & 0xFE) | 1; // Green
        pixels[i+2] = (pixels[i+2] & 0xFE) | 1; // Blue
      }
      */

      encoder.setCoverImage({
        data: pixels,
        width: canvas.width,
        height: canvas.height
      });
    }

    img.src = URL.createObjectURL(file);

  };
});


document.getElementById('upload-secret').addEventListener('change', function(e) {
  const file = e.target.files[0];
    
  if (file && file.type.startsWith('image/')) {
    const img = new Image();

    img.onload = function(){
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data; // extract pixels

      /*
      for (let i = 0; i < pixels.length; i+= 4){
        pixels[i] = (pixels[i] & 0xFE) | 1; // Red
        pixels[i+1] = (pixels[i+1] & 0xFE) | 1; // Green
        pixels[i+2] = (pixels[i+2] & 0xFE) | 1; // Blue
      }
      */

      encoder.setSecretImage({
        data: pixels,
        width: canvas.width,
        height: canvas.height
      });
    }

    img.src = URL.createObjectURL(file);

  };
});

document.getElementById("submit").onclick = () =>{
  const image = encoder.encode("1234");

  const canvas = document.getElementById("myCanvas");
  canvas.width = image.width;
  canvas.height = image.height;
  
  // Create ImageData object
  const imageData = new ImageData(image.data, image.width, image.height);
  
  // Draw to canvas
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);

}




