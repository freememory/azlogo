"use strict";

/**
 * This software is not copyrighted. It was developed and given freely by freememory on GitHub. Instead of
 * a copyright notice he offers the following blessing:
 * 
 * May your life be filled with wonder.
 * May you experience the joy of knowledge.
 * May your curiosity be ever unquenched.
 * 
 * 13Apr2020, during COVID19 quarantine
 */

const canvas = document.getElementById('logo');

const cartesianToCanvasPoint = ({x,y}) => {
    const midWidth = canvas.width / 2;
    const midHeight = canvas.height / 2;
    /*
    In order to understand this, picture the following:
    0                      400                       800 (canvas coords)
    -------------------------------------------------->
    |                       |
    |                       |
    |                       |
    |                       |
    |------------------------------------------------->400 (cartesian coords)
    |                       |
    |                       |   
    |                       |
    v                       v
    800                     -400
    */
    return {x: midWidth + x, y: midHeight - y};
}

const radians = (degrees) => {
    return degrees * Math.PI / 180;
}

class Turtle {
    constructor(canvasContext) {
        this.ctx = canvasContext;
        this.mode = "down";
        this.color = "black";
    }

    init = () => {
        this.facing = 90;
        this.position = {x: 0, y: 0};        
        this.setColor();
    }

    setColor = (color = undefined) => {
        this.color = color || this.color;
        this.ctx.beginPath();
        const lastPos = cartesianToCanvasPoint(this.position)
        this.ctx.moveTo(lastPos.x, lastPos.y);
        this.ctx.strokeStyle = this.color;
    }

    rotate = (amount) => {        
        if(isNaN(amount))
            return;

        let facingUpdate = this.facing + (amount % 360);
        if(facingUpdate < 0)
            facingUpdate += 360;

        if(facingUpdate >= 360)
            facingUpdate -= 360;

        this.facing = facingUpdate;
    }

    left = (amount) => {
        this.rotate(amount);
    }

    right = (amount) => {
        this.rotate(-amount);
    }

    move = (amount) => {
        if(isNaN(amount))
            return;

        const newX = this.position.x + 
            (amount * Math.cos(radians(this.facing)));
        const newY = this.position.y + 
            (amount * Math.sin(radians(this.facing)));
        this.position = {x: newX, y: newY}
        return cartesianToCanvasPoint(this.position);
    }

    forward = (amount) => {
        return this.move(amount);
    }

    back = (amount) => {
        return this.move(-amount);
    }    

    setPos = (x,y) => {
        const newX = !isNaN(x) ? x : this.position.x,
            newY = !isNaN(y) ? y : this.position.y;
        
        this.position = {x: newX, y: newY};
        this.setColor();
    }

    render = () => {
        const el = document.getElementById('turtle');
        const pos = cartesianToCanvasPoint(this.position);

        el.style.width = '32px';

        if(pos.x > canvas.width || pos.x < 0 || pos.y > canvas.height || pos.y < 0)
            el.style = 'none';
        else 
        {
            el.style.position = 'absolute';
            el.style.left = pos.x - 9 + 'px';
            el.style.top = pos.y - 10 + 'px';
            el.style.transform = `rotate(${-this.facing}deg)`;
        }
    }
}

class Logo {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(this.canvasId);   
        this.ctx = this.canvas.getContext('2d'); 
        this.turtle = new Turtle(this.ctx);
        this.init();
    }

    init = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawAxes();
        this.ctx.beginPath();
        this.turtle.color = 'black';
        this.turtle.init();
        this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2);
    }

    drawAxes = () => {
        // Y axis
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();

        // X axis
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();

        // Add the text
        this.ctx.fillText("90", this.canvas.width / 2, 12);
        this.ctx.fillText("0 (360)", this.canvas.width - 30, this.canvas.height / 2);
        this.ctx.fillText("270", this.canvas.width / 2, this.canvas.height - 8);
        this.ctx.fillText("180", 0, this.canvas.height / 2);
    }

    draw = ({x,y}) => {   
        if(this.turtle.mode === 'down')
            this.ctx.lineTo(x, y);
        else
            this.ctx.moveTo(x, y);
        
        if(this.turtle.mode === 'down')
            this.ctx.stroke();
    }

    saveAsImage = () => {
        const link = document.createElement('a');
        link.download = `azlogo${new Date().toISOString()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        link.parentNode.removeChild(link);
    }

    parse = (lines, line = 0) => {        
        while(line < lines.length) {
            let currentLine = lines[line].toLowerCase();
            let split = currentLine.split(" ");
            let command = split.shift();
            switch(command)
            {
                case "fd":
                case "forward":
                    this.draw(this.turtle.forward(...split));
                    break;
                case "bk":
                case "back":
                    this.draw(this.turtle.back(...split));
                    break;
                case "rt":
                case "right":
                    this.turtle.right(...split);
                    break;
                case "lt":
                case "left":
                    this.turtle.left(...split);
                    break;
                case "repeat":
                    let endLine = -1;
                    for(let i = 0; i < parseInt(split[0]); i++)
                        endLine = this.parse(lines, line + 1)                    
                    line  = endLine;
                    break;
                case "end":
                    return line;                                        
                case "up":
                    this.turtle.mode = 'up';
                    break;
                case "dn":
                case "down":
                    this.turtle.mode = 'down';     
                    break;                                                       
                case "color":
                    this.turtle.setColor(...split);
                    break;
                case "home":
                    this.turtle.setPos(0,0)
                    break;
                case "setpos":
                    this.turtle.setPos(...split.map(x => parseInt(x)));                    
                    break;
                default:
                    console.error(`Unknown command ${command}`);
            }
            line++;
        }
    }
}