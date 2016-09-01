let canvas = document.querySelector('canvas')
let width = canvas.width = canvas.scrollWidth
let height = canvas.height = canvas.scrollHeight
let ctx = canvas.getContext('2d')

let context = new AudioContext()
let analyser = context.createAnalyser()

let biquadFilter = context.createBiquadFilter()
biquadFilter.type = "lowpass"
biquadFilter.frequency.value = 20000
biquadFilter.Q.value = 20

let audio = new Audio()
audio.loop = true
audio.crossOrigin = 'anonymous'

let source = context.createMediaElementSource(audio)
source.connect(biquadFilter)
biquadFilter.connect(analyser)
analyser.connect(context.destination)

nextSound()
loop()

function nextSound(){
    let http = new XMLHttpRequest()
    http.onload = () => { 
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

function loop(){
    window.requestAnimationFrame(loop)
    let freq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(freq)

    let data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    
    ctx.clearRect(0, 0, width, height)
    
    freq.forEach((f, i) => draw(f,i,height,'#E6193C'))

    ctx.lineWidth = 1
    ctx.strokeStyle = '#558B3D'
    ctx.beginPath()

    ctx.moveTo(0, data[0] / 128 * height / 2)
    data.forEach((d, x) => {
        let v = d / 128
        let y = v * height / 2
        ctx.lineTo(x, y)
    })
    ctx.lineTo(width, height / 2)
    ctx.stroke()
}

function draw(freq, index, height, color){
    ctx.fillStyle = color
    ctx.fillRect(index, (height - freq) / 2, 1, freq)
}

function changeFrequency(range){
    biquadFilter.frequency.value = range.value
}

function upload(){
    let input = document.querySelector('input[type="file"]')
    input.click()
}

function file_uploaded(input){
    document.querySelector('#author').hidden = true
    let url = URL.createObjectURL(input.files[0])
    audio.src = url
    audio.play()
}