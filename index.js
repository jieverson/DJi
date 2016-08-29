let canvas = document.querySelector('canvas')
canvas.width = canvas.scrollWidth
canvas.height = canvas.scrollHeight
let ctx = canvas.getContext('2d')

let context = new AudioContext()
let analyser = context.createAnalyser()
analyser.connect(context.destination)

let audio = new Audio()
audio.loop = true
audio.crossOrigin = 'anonymous'

nextSound()

let source = context.createMediaElementSource(audio)
source.connect(analyser)

let width = canvas.width
let height = canvas.height
function loop(){
    window.requestAnimationFrame(loop)
    let freq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(freq)
    
    ctx.clearRect(0, 0, width, height)
    
    for(let i = 0; i < freq.length; i++){
        var f = freq[i]
        draw(f,i,height,'#E6193C')
    }
}
function draw(freq, index, height, color){
    ctx.fillStyle = color
    ctx.fillRect(index, (height - freq) / 2, 1, freq)
}

function nextSound(){
    let http = new XMLHttpRequest()
    http.onreadystatechange = () => { 
        if(http.responseText){
            var result = JSON.parse(http.responseText)
            var music = result[parseInt(Math.random() * result.length)]
            audio.src = music.stream_url + '?client_id=4aec52a7c2e04ee6517c889ebaafcd43'
            audio.play()
        }
    }
    http.open("GET", 'http://api.soundcloud.com/tracks?client_id=4aec52a7c2e04ee6517c889ebaafcd43', true) 
    http.send()
}

function upload(){
    let input = document.querySelector('input[type="file"]')
    input.click()
}

function file_uploaded(){
    let input = document.querySelector('input[type="file"]')
    var url = URL.createObjectURL(input.files[0]) 
    audio.src = url
    audio.play();
}

function initialize_audio(){
    audio.src = './audio.mp3'
    audio.play();
}

loop()