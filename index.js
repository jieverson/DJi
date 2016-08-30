var canvas = document.querySelector('canvas')
canvas.width = canvas.scrollWidth
canvas.height = canvas.scrollHeight
var ctx = canvas.getContext('2d')

var context = new AudioContext()
var analyser = context.createAnalyser()
var biquadFilter = context.createBiquadFilter()

biquadFilter.type = "lowpass"
biquadFilter.frequency.value = 20000
biquadFilter.Q.value = 20

var audio = new Audio()
audio.loop = true
audio.crossOrigin = 'anonymous'

var source = context.createMediaElementSource(audio)
source.connect(biquadFilter)
biquadFilter.connect(analyser)
analyser.connect(context.destination)

nextSound()

var width = canvas.width
var height = canvas.height
function loop(){
    window.requestAnimationFrame(loop)
    var freq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(freq)

    var data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    
    ctx.clearRect(0, 0, width, height)
    
    for(var i = 0; i < freq.length; i++){
        var f = freq[i]
        draw(f,i,height,'#E6193C')
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = '#558B3D'
    ctx.beginPath()

    var x = 0
    ctx.moveTo(x, data[0] / 128.0 * height / 2)
    for(var i = 1; i < data.length; i++) {
        var v = data[i] / 128
        var y = v * height / 2
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
    var http = new XMLHttpRequest()
    http.onreadystatechange = function() { 
        if(http.responseText){
            var result = JSON.parse(http.responseText)
            console.log('Sounds: ' + result.length)
            var music = result[parseInt(Math.random() * result.length)]
            
            document.querySelector('#author').hidden = false
            var link = document.querySelector('#author a')
            link.text = music.title
            link.href = music.permalink_url

            audio.src = music.stream_url + '?client_id=4aec52a7c2e04ee6517c889ebaafcd43'
            audio.play()
        }
    }
    http.open("GET", 'http://api.soundcloud.com/tracks?limit=100&genres=rock&client_id=4aec52a7c2e04ee6517c889ebaafcd43', true)
    http.send()
}

function changeFrequency(range){
    biquadFilter.frequency.value = range.value
}

function upload(){
    var input = document.querySelector('input[type="file"]')
    input.click()
}

function file_uploaded(){
    document.querySelector('#author').hidden = true
    var input = document.querySelector('input[type="file"]')
    var url = URL.createObjectURL(input.files[0])
    audio.src = url
    audio.play()
}

loop()