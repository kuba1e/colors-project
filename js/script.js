//global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes =document.querySelectorAll('.color h2');
let initialColors;

//add event listener 
sliders.forEach(slider=>{
    slider.addEventListener('input', hslControls)
});

colorDivs.forEach((div,index)=>{
div.addEventListener('input', ()=>{
    updateTextUI(index);

})


});

//functions
//color generator
function generateHex(){
    const hexColor = chroma.random();
    return hexColor;
};


function randomColors(){

    initialColors = [];
    //
    colorDivs.forEach((div,index,)=>{
        const hexText = div.children[0];
        const randomColor = generateHex();
        initialColors.push(chroma(randomColor).hex());

        console.log(initialColors);

        //add the color to the background 
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor,hexText);
        //initial colorize sliders 
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation)
        

    });
};

function colorizeSliders(color, hue, brightness, saturation){
    //scale saturation
    const noSat = color.set('hsl.s',0);
    const fullSat = color.set('hsl.s',1);
    const scaleSat  = chroma.scale([noSat, color,fullSat]);
    //scale brightness
    const midBright = color.set('hsl.l',0.5);
    const scaleBright = chroma.scale(['black', midBright,'white']);

    //update input colors
    saturation.style.backgroundImage =`linear-gradient(to right, ${scaleSat(0)},${scaleSat(1)})`;

    brightness.style.backgroundImage =`linear-gradient(to right, ${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;

    hue.style.backgroundImage =`linear-gradient(to right,  #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;

};

function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = 'black';
    } else if (luminance < 0.5){
        text.style.color = 'white';
    } else {
        text.style.color = 'gray';
    };

};

function hslControls(e){
    
    const index = e.target.getAttribute('data-bright')||
    e.target.getAttribute('data-sat')||
    e.target.getAttribute('data-hue');

    let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    console.log(bgColor);

    let color = chroma(bgColor)
    .set('hsl.s',saturation.value)
    .set('hsl.l',brightness.value)
    .set('hsl.h',hue.value)

    colorDivs[index].style.backgroundColor = color;

}

function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const hexText = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    hexText.innerText = color.hex();
//check contrast
checkTextContrast(color,hexText);

for (icon of icons){
    checkTextContrast(color,icon);
}
};




randomColors();
