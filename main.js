import { StegoDecoder } from "./decode.js";
import { StegoEncoder } from "./encode.js";

const encoder = new StegoEncoder();
const decoder = new StegoDecoder();

const encode_password = document.getElementById("encode-password");
const decode_password = document.getElementById("decode-password");

const alert = document.getElementById("alert");

let page = document.getElementsByClassName("page");

let image_placeholder = document.getElementsByClassName("upload-placeholder");
let image_scroll = document.getElementsByClassName("image-scroll");

const submit_button = document.getElementsByClassName("submit-button");

const encode_page = document.getElementById("encode");
const decode_page = document.getElementById("decode");
const preview_image = document.getElementById("final-image");

let lsb = 0;

function checkAllInputsEntered() {
    let errors = "";

    if (encode_page.hidden == false){
        
        if (encode_password.value == "") {
            errors = " Password is empty! ";
        }
        else if (image_placeholder[0].src == "" || image_placeholder[1].src == "") {
            errors = "One or both of the images was not uploaded! ";
        }

        if (errors != "") {
            alert.hidden = false;
            alert.textContent = errors;
            return false;            
        }

    }
 
    else if (decode_page.hidden == false) {
        if (decode_password.value == "") {
            errors = " Password is empty! ";
        }
        else if (image_placeholder[2].src == "") {
            errors = "Stego Image was not uploaded! ";
        }

        if (errors != "") {
            alert.hidden = false;
            alert.textContent = errors;
            return false;            
        }
    }


    alert.hidden = true;

    return true;
}

function updateImagePlaceholder(file, img, index) {
    image_placeholder[index].src = URL.createObjectURL(file);
    image_placeholder[index].width = img.width;
    image_placeholder[index].height = img.height;
    image_placeholder[index].classList.add("show");
    image_scroll[index].classList.add("show");
}

function processImage(img, encoder, type) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data; // extract pixels

    switch (type) {
        case "cover":
            encoder.setCoverImage({
                data: pixels,
                width: canvas.width,
                height: canvas.height
            });
            break;
        case "secret":
            encoder.setSecretImage({
                data: pixels,
                width: canvas.width,
                height: canvas.height
            });
            break;
        case "stego":
            decoder.setStegoImage({
                data: pixels,
                width: canvas.width,
                height: canvas.height
            });
            break;
    }
}

function resetPlaceholders(){
    alert.textContent = "";
    let encode_password = document.getElementById("encode-password");
    let decode_password = document.getElementById("decode-password");

    for (let i = 0; i < image_placeholder.length; i++) {
        image_placeholder[i].src = "";
        image_placeholder[i].classList.remove("show");
        image_scroll[i].classList.remove("show");
    }

    encode_password.value = "";
    decode_password.value = "";

}

document.getElementById("nav-encode").onclick = () => {
    encode_page.hidden = false;
    decode_page.hidden = true;
    preview_image.classList.add("hide");

    encoder.reset();
    resetPlaceholders();
}

document.getElementById("nav-decode").onclick = () => {
    encode_page.hidden = true;
    decode_page.hidden = false;
    preview_image.classList.add("hide");

    encoder.reset();
    resetPlaceholders();
}

document.querySelectorAll(".input-slider").forEach(slider => {
    const label = slider.nextElementSibling;
    slider.addEventListener("input", function() {
        label.textContent = this.value;
        lsb = this.value;
    });
});

document.getElementById("upload-cover").addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
        const img = new Image();

        img.onload = function(){
            processImage(img, encoder, "cover")
            updateImagePlaceholder(file, img, 0);
        }

        img.src = URL.createObjectURL(file);

    };
});

document.getElementById("upload-secret").addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
        const img = new Image();

        img.onload = function(){
            processImage(img, encoder, "secret")
            updateImagePlaceholder(file, img, 1);
        }

        img.src = URL.createObjectURL(file);

    };
});

document.getElementById("upload-stego").addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
        const img = new Image();

        img.onload = function(){
            processImage(img, encoder, "stego")
            updateImagePlaceholder(file, img, 2);
        }

        img.src = URL.createObjectURL(file);

    };
});

document.getElementById("encode-button").onclick = () => {
    if (checkAllInputsEntered() == false) {
        return;
    }

    if (encoder.getCoverImage().width <= encoder.getSecretImage().width && encoder.getCoverImage().height <= encoder.getSecretImage().height) {
        alert.textContent = "Secret Image dimensions is bigger than the Cover Image";
        alert.hidden = false;
        return;
    }

    let password_input = document.getElementById("encode-password");

    encode_page.hidden = true;
    preview_image.classList.remove("hide");

    const image = encoder.encode(password_input.value, lsb);

    const canvas = document.getElementById("final-image");
    canvas.width = image.width;
    canvas.height = image.height;

    const imageData = new ImageData(image.data, image.width, image.height);

    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
}


document.getElementById("decode-button").onclick = () => {
    if (checkAllInputsEntered() == false) {
        return;
    }

    let password_input = document.getElementById("decode-password");

    decode_page.hidden = true;
    preview_image.classList.remove("hide");

    const image = decoder.decode(password_input.value, lsb);

    const canvas = document.getElementById("final-image");


    canvas.width = image.width;
    canvas.height = image.height;

    const imageData = new ImageData(image.data, image.width, image.height);

    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);

        

}

