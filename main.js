import { StegoDecoder } from "./decode.js";
import { StegoEncoder } from "./encode.js";

const encoder = new StegoEncoder();
const decoder = new StegoDecoder();

let page = document.getElementsByClassName("page");

let image_placeholder = document.getElementsByClassName("upload-placeholder");
let image_scroll = document.getElementsByClassName("image-scroll");

const submit_button = document.getElementsByClassName("submit-button");

const encode_page = document.getElementById("encode");
const decode_page = document.getElementById("decode");
const preview_image = document.getElementById("final-image");

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
        case "secret":
            encoder.setSecretImage({
                data: pixels,
                width: canvas.width,
                height: canvas.height
            });
        case "stego":
            decoder.setStegoImage({
                data: pixels,
                width: canvas.width,
                height: canvas.height
            });
    }
}

function enableButton() {
    if (encode_page.hidden == false) {
        let counter = 0;
        for (let i = 0; i < 2; i++) {
            if (image_placeholder[i].getAttribute("src") != "") {
                counter++;
            }
        }

        if (counter == 2) {
            submit_button[0].disabled = false;
            submit_button[0].classList.remove("empty");
        }
    }

    else {
        if (image_placeholder[2].getAttribute("src") != null) {
            submit_button[1].disabled = false;
            submit_button[1].classList.remove("empty");
        }
    }
}

function resetPlaceholders(){
    let encode_password = document.getElementById("encode-password");
    let decode_password = document.getElementById("decode-password");

    for (let i = 0; i < image_placeholder.length; i++) {
        image_placeholder[i].src = "";
        image_placeholder[i].classList.remove("show");
        image_scroll[i].classList.remove("show");
    }

    for (let i = 0; i < submit_button.length; i++) {
        submit_button[i].disabled = false;
        submit_button[i].classList.add("empty");    
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
    });
});

document.getElementById("upload-cover").addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
        const img = new Image();

        img.onload = function(){
            processImage(img, encoder, "cover")
            updateImagePlaceholder(file, img, 0);
            enableButton();            
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
            enableButton();            
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
            enableButton();            
        }

        img.src = URL.createObjectURL(file);

    };
});

document.getElementById("encode-button").onclick = () => {
    let password_input = document.getElementById("encode-password");
    console.log(password_input.value);
    const image = encoder.encode(password_input.value, 1);

    encode_page.hidden = true;
    preview_image.classList.remove("hide");

    const canvas = document.getElementById("myCanvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const imageData = new ImageData(image.data, image.width, image.height);

    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
}


document.getElementById("decode-button").onclick = () => {
    let password_input = document.getElementById("decode-password");
    console.log(password_input.value);

    decode_page.hidden = true;
    preview_image.classList.remove("hide");
    
    const image = decoder.decode(password_input.value, 1);

    const canvas = document.getElementById("final-image");
    canvas.width = image.width;
    canvas.height = image.height;

    const imageData = new ImageData(image.data, image.width, image.height);

    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
}

