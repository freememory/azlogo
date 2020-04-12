"use strict";

const canvas = document.getElementById('logo');

const cartesianToCanvasPoint = ({x,y}) => {
    const midWidth = canvas.width / 2;
    const midHeight = canvas.height / 2;
    /*
    In order to understand this, picture the following:
    0                      400                       800
    -------------------------------------------------->
    |                       |
    |                       |
    |                       |
    |                       |
    |------------------------------------------------->400
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
    constructor(canvasContext, color) {
        this.ctx = canvasContext;
        this.color = color;
        this.mode = "down";
        this.init();
    }

    init = () => {
        this.ctx.strokeStyle = this.color;
        this.facing = 90;
        this.position = {x: 0, y: 0};
    }

    rotate = (amount) => {        
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
}

class Logo {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(this.canvasId);   
        this.ctx = this.canvas.getContext('2d'); 
        this.drawAxes();
        this.turtle = new Turtle(this.ctx, 'black');
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2);
    }

    drawAxes = () => {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    draw = ({x,y}) => {
        if(this.turtle.mode === 'down')
            this.ctx.lineTo(x, y);
        else
            this.ctx.moveTo(x, y);
        
        if(this.turtle.mode === 'down')
            this.ctx.stroke();
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
            }
            line++;
        }
    }
}