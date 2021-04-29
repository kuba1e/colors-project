//global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes =document.querySelectorAll('.color h2');
const popUpContainer = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const slidersContainers = document.querySelectorAll('.sliders');
const lockButton = document.querySelectorAll('.lock')
let initialColors;

//saving the palletes with colors to the local storage
let savedPalletes = [];
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');
const clearLibraryBtn = document.querySelector('.clear-library');


//add event listener 
sliders.forEach(slider=>{
    slider.addEventListener('input', hslControls)
});

colorDivs.forEach((div,index)=>{
div.addEventListener('input', ()=>{
    updateTextUI(index);
})
});

currentHexes.forEach(hex =>{
    hex.addEventListener('click', ()=>{
        copyToClipBoard(hex)
    })
})
 
popUpContainer.addEventListener('transitionend', ()=>{
    console.log('Hey');
    setTimeout(()=>{
        popUpContainer.classList.remove('active');
        popUpContainer.children[0].classList.remove('active');
    }, 500)
})

adjustButton.forEach(but => { 
    but.addEventListener('click', ()=> {
    console.log("it works");
    slidersContainers.forEach( slider =>{
        slider.classList.toggle('active');
})
})});

closeAdjustments.forEach(closeButton =>{
    closeButton.addEventListener('click', ()=>{
        slidersContainers.forEach( slider =>{
            slider.classList.remove('active');
    })
    })
});

lockButton.forEach((button, index) =>{
    button.addEventListener('click', () =>{
        colorDivs[index].classList.toggle('locked');
        if(lockButton[index].children[0].classList.contains('fa-lock-open')){
            lockButton[index].children[0].classList.add('fa-lock');
            return;
        } else{
            lockButton[index].children[0].classList.add('fa-lock-open');
        }
    } )
});



generateBtn.addEventListener('click', randomColors);


submitSave.addEventListener('click', ()=>{
    const name = saveInput.value;
    if(!name){
        alert('Введите имя');
        return;
    };
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText)
    })
    //generate object
    let paletteNr;

    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    } else{
        paletteNr = savedPalletes.length;
    }


    const paletteObj = {name, colors, nr: paletteNr};

    savedPalletes.push(paletteObj)
    saveToLocal(paletteObj);
    saveInput.value ='';
    closePalette()

    //generate the palette for the library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const tittle = document.createElement('h4');
    tittle.innerText=paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor =>{
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor= smallColor;
        preview.appendChild(smallDiv);
    })
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText= 'Select';

    //attach event to the library
    paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalletes[paletteIndex].colors.forEach((color,index) =>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color,text);
            updateTextUI(index)
        });
        resetInputs();

    });

    //append to the library
    palette.appendChild(tittle);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

});


/*
clearLibraryBtn.addEventListener('click', (e)=>{
    localStorage.clear();
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    libraryConrainer.appendChild(palette);

    console.log(e.target)
})
*/

//functions
//color generator
function generateHex(){
    const hexColor = chroma.random();
    return hexColor;
};

function hex(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    const popUpChild = popUpContainer.children[0];
    popUpContainer.classList.add('active');
    popUpChild.classList.add('active');
};

function randomColors(){

    initialColors = [];
    //
    colorDivs.forEach((div,index,)=>{
        const hexText = div.children[0];
        const randomColor = generateHex();
        if(colorDivs[index].classList.contains('locked')){
            initialColors.push(hexText.innerText);
            return;
        } else{
            initialColors.push(chroma(randomColor).hex());
        };
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
        //reset inputs 
    });

    resetInputs();

    adjustButton.forEach((button, index) =>{
        checkTextContrast(initialColors[index], button)
        checkTextContrast(initialColors[index], lockButton[index])
    })

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
    } else {
        text.style.color = 'white';
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
    let color = chroma(bgColor)
    .set('hsl.s',saturation.value)
    .set('hsl.l',brightness.value)
    .set('hsl.h',hue.value)
    colorDivs[index].style.backgroundColor = color;
    //colorize inputs

    colorizeSliders(color, hue, brightness, saturation)

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

function resetInputs(){
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider =>{
        if(slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        };

        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue*100)/100;
        };

        if(slider.name === 'saturation'){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue*100)/100;
        };
    });
};




//implement Save to palette and local storage

function openPalette (){
    const popUp = saveContainer.children[0];
    popUp.classList.add('active');
    saveContainer.classList.add('active');}

function closePalette(){
    const popUp = saveContainer.children[0];
    popUp.classList.remove('active');
    saveContainer.classList.remove('active');
}

function saveToLocal(e){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes =[];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'))
    }
    localPalettes.push(e);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));

}

function openLibrary(){
    const popUp = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popUp.classList.add('active');

}

function closeLibrary(){
    const popUp = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popUp.classList.remove('active');
}






function getLocal(){
    if(localStorage.getItem('palettes')===null){
        localPalettes= [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalletes = [...paletteObjects];

        paletteObjects.forEach(paletteObj =>{

            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const tittle = document.createElement('h4');
            tittle.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');

            console.log(paletteObj);

            paletteObj.colors.forEach(smallColor =>{
                    const smallDiv = document.createElement('div');
                    smallDiv.style.backgroundColor= smallColor;
                    preview.appendChild(smallDiv);
                });

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText= 'Select';

    //attach event to the library
            paletteBtn.addEventListener('click', e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                console.log(paletteIndex)
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color,index) =>{
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color,text);
                    updateTextUI(index)
                });
                resetInputs();
                });

                //append to the library
                palette.appendChild(tittle);
                palette.appendChild(preview);
                palette.appendChild(paletteBtn);
                libraryContainer.children[0].appendChild(palette);
            
        });
    }};


saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

getLocal();
randomColors();
