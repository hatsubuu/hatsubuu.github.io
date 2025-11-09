let synth
let osc, env


let markov
let markovSize
let notes
let curNote
let tempo = 100
let noteWidth = 30

let audioStarted = false
let extraFrames = 0

const bgCol = 16
const minn = 50
const maxn = 80
const leftWall = 300
let minY, maxY

let offsetTime = 0
let startTime = 0

let mode
let modeColor

function getNotes(str){
    let spl = str.split(' ')
    let n = []
    for(let i=0; i<spl.length; i+=2){
        n.push([parseInt(spl[i]), parseInt(spl[i+1])])
    }
    return n
}
function notesToStr(narr){
    let n = []
    for(let i=0; i<narr.length; i++){
        n.push(narr[i][0])
        n.push(narr[i][1])
    }
    return n.join(' ')
}

function getStarts(){
    let possibleStarts = []
    for(let key in markov){
        let total = 0
        for(let nextNote in markov[key]){
            total += markov[key][nextNote]
        }
        if(total>100){
            possibleStarts.push(key)
        }
    }
    return possibleStarts
    
}

let datasets = []

function preload(){
    // markov = loadJSON('data/mode1len6.json')
    datasets.push('data/mode1len6.json')
    datasets.push('data/mode2len6.json')
    datasets.push('data/mode3len6.json')
    datasets.push('data/mode4len6.json')
    datasets.push('data/mode5len6.json')
    datasets.push('data/mode6len6.json')
    datasets.push('data/mode7len6.json')
    datasets.push('data/mode8len6.json')
    mode = Math.floor(random(8))
    markov = loadJSON(datasets[mode])
    modeColor = [
        color(230, 115, 115),
        color(230, 201, 115),
        color(172, 230, 115),
        color(115, 230, 143),
        color(115, 230, 230),
        color(115, 143, 230),
        color(172, 115, 230),
        color(230, 115, 201)
    ][mode]
}

function setup(){
    // put setup code here
    audioStarted = false

    

    tempo = floor(random(80, 100))

    extraFrames = frameCount
    notes = getNotes(random(getStarts()))
    curNote = -1
    markovSize = notes.length
    
    var cnv = createCanvas(1000, 400)
    cnv.parent('sketch-holder')
    background(bgCol)

    minY = height*0.1
    maxY = height*0.9

    synth = new p5.PolySynth()

    synth.setADSR(0.1, 0.1, 0.5, 0.1)
    synth.disconnect()

    osc = new p5.Oscillator('triangle')
    env = new p5.Envelope()
    env.setRange(1)
    osc.disconnect()
    
    reverb = new p5.Reverb()
    synth.connect(reverb)
    osc.connect(reverb)
    reverb.set(3, 2)
    reverb.drywet(0.9)
    
    // for(let i=0; i<notes.length; i++){
    //     polySynth.play(midiToFreq(notes[i][0]), 0.2, i, 0.5)
    // }
    //polySynth.play('G3', 0.5, 0, 1)
     

    noLoop()
}

function mouseClicked(){
    if(isLooping()){
        setup()
    }else{
        userStartAudio()
        osc.start()
        audioStarted = true
        loop()
    }
}

function draw(){
    // put drawing code here

    let curTime = (frameCount-extraFrames)/60
    let offset = noteWidth*(curTime)/(60/tempo)
    let curX = leftWall-offset

    while(noteWidth*notes.length < width+offset){
        let seg = notesToStr(notes.slice(-markovSize))
        if(markov.hasOwnProperty(seg)){
            let possibleNext = []
            for(let key in markov[seg]){
                for(let i=0; i<markov[seg][key]; i++){
                    possibleNext.push(key)
                }
            }
            let next = random(possibleNext)
            notes.push(getNotes(next)[0])
        }else{
            let next = getNotes(random(getStarts()))
            notes = notes.concat(next)
            break
        }
    }

    background(bgCol)
    
    for(let i=0; i<notes.length; i++){
        let note = notes[i]
        if(audioStarted && curX < leftWall && curNote < i){
            // play note
            osc.freq(midiToFreq(note[0])/2)
            env.setADSR(0.1, note[1]*60/tempo-0.1, 0.1, 0.1)
            env.play(osc)
            //synth.play(midiToFreq(note[0]), 0.5, 0.05, note[1]*60/tempo-0.1)
            curNote++
        }
        

        let pitch = note[0]
        let time = note[1]


        if(curX+noteWidth*time < 0){
            // off screen
            curX += noteWidth*time
            continue
        }

        let yPos = maxY - (maxY-minY)*(pitch-minn)/(maxn-minn)
        fill(modeColor)
        strokeWeight(0)
        let rectHeight = (maxY-minY)/(maxn-minn)
        rect(curX, yPos, noteWidth*time-1, rectHeight)
        
        curX += noteWidth*time
        
    }
    stroke(modeColor)
    strokeWeight(4)
    line(leftWall, minY, leftWall, maxY)



}
