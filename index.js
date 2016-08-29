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

    let data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    
    ctx.clearRect(0, 0, width, height)
    
    for(let i = 0; i < freq.length; i++){
        let f = freq[i]
        draw(f,i,height,'#E6193C')
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = '#558B3D'
    ctx.beginPath()

    let x = 0
    ctx.moveTo(x, data[0] / 128.0 * height / 2)
    for(let i = 1; i < data.length; i++) {
        let v = data[i] / 128
        let y = v * height / 2
        ctx.lineTo(x, y)
        x++
    }
    ctx.lineTo(width, height / 2)
    ctx.stroke()
}
function draw(freq, index, height, color){
    ctx.fillStyle = color
    ctx.fillRect(index, (height - freq) / 2, 1, freq)
}

function nextSound(){
    let http = new XMLHttpRequest()
    http.onreadystatechange = () => { 
        if(http.responseText){
            let result = JSON.parse(http.responseText)
            console.log('Sounds: ' + result.length)
            let music = result[parseInt(Math.random() * result.length)]
            
            document.querySelector('#author').hidden = false
            let link = document.querySelector('#author a')
            link.text = music.title
            link.href = music.permalink_url

            audio.src = music.stream_url + '?client_id=4aec52a7c2e04ee6517c889ebaafcd43'
            audio.play()
        }
    }
    http.open("GET", 'http://api.soundcloud.com/tracks?limit=100&genres=rock&client_id=4aec52a7c2e04ee6517c889ebaafcd43', true) 
    http.send()
}

function upload(){
    let input = document.querySelector('input[type="file"]')
    input.click()
}

function file_uploaded(){
    document.querySelector('#author').hidden = true
    let input = document.querySelector('input[type="file"]')
    let url = URL.createObjectURL(input.files[0]) 
    audio.src = url
    audio.play()
}

loop()