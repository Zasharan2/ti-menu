var codeInput = document.getElementById("codeInput");
var codeOutput = document.getElementById("codeOutput");
var convertButton = document.getElementById("convertButton");
var copyButton = document.getElementById("copyButton");

codeInput.addEventListener('keydown', function(ev) {
    if (ev.key == 'Tab') {
        ev.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) + "  " + this.value.substring(end);

        // put caret at right position again
        this.selectionStart = this.selectionEnd;
        this.selectionEnd = start + 2;
    }
});

convertButton.addEventListener("click", function(ev) {
    parseCode(codeInput.value);
});

copyButton.addEventListener("click", function(ev) {
    navigator.clipboard.writeText(finalTICode);
});

var idCounter = 0;

class TINode {
    constructor(type) {
        this.type = type;

        this.id;
        this.value = "";

        this.children = [];
        this.parent;
    }

    parse() {
        switch (this.type) {
            case "PROGRAM": {
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "TITLE": {
                // title
                finalTICode += 'Menu("' + this.value + '","';
                for (var i = 0; i < this.children.length; i++) {
                    finalTICode += this.children[i].value + '",' + this.children[i].id + ',"';
                }
                finalTICode = finalTICode.substring(0, finalTICode.length - 2);
                finalTICode += ")\n";
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "OPTION": {
                finalTICode += 'Lbl ' + this.id + '\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "INPUT": {
                finalTICode += 'Input ' + this.value + '\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "DISPLAY": {
                finalTICode += 'Disp ' + this.value + '\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "WAITSTOP": {
                finalTICode += 'Pause \nStop\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "WAIT": {
                finalTICode += 'Pause \n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "STOP": {
                finalTICode += 'Stop\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "NOTE": {
                var text = this.value;
                text = text.replace(/\\n/g, '\n'); // newline support
                text = text.match(/.{1,26}/g);
                if (text.length <= 10) {
                    for (var i = 0; i < text.length; i++) {
                        finalTICode += 'Output(' + (i + 1) + ',1,"' + text[i] + '")\n';
                    }
                    finalTICode += 'Pause \nClrHome\n';
                } else {
                    finalTICode += '0\u{2192}P\n';
                    finalTICode += '-1\u{2192}K\n';
                    finalTICode += 'While K\u{2260}105\n';
                    finalTICode += 'getKey\u{2192}K\n';
                    //→
                    finalTICode += 'If K=24\nThen\nClrHome\nP-1\u{2192}P\nEnd\n';
                    finalTICode += 'If K=26\nThen\nClrHome\nP+1\u{2192}P\nEnd\n';
                    finalTICode += 'If P>' + Math.floor(text.length / 10) + '\nThen\n0\u{2192}P\nEnd\n';
                    finalTICode += 'If P<0\nThen\n' + Math.floor(text.length / 10) + '\u{2192}P\nEnd\n';

                    for (var j = 0; j <= Math.floor(text.length / 10); j++) {
                        finalTICode += 'If P=' + j + '\nThen\n'
                        for (var i = 0; i < 10; i++) {
                            if (i + (10*j) >= text.length) { break; }
                            finalTICode += 'Output(' + (i + 1) + ',1,"' + text[i + (10*j)] + '")\n';
                        }
                        finalTICode += 'End\n';
                    }

                    finalTICode += 'End\nClrHome\n';
                }
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "INJECT": {
                finalTICode += this.value;
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "IF": {
                finalTICode += 'If ' + this.value + '\nThen\n';

                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                
                finalTICode += 'End\n';
                break;
            }
            case "ELSE": {
                // remove 'End\n' from if
                finalTICode = finalTICode.substring(0, finalTICode.length - 4);

                finalTICode += 'Else\n';

                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }

                finalTICode += 'End\n';
                break;
            }
            case "MATH": {
                var eqText = this.value;
                eqText = eqText.replace('=', '\u{2192}');
                eqText = eqText.split('\u{2192}');
                var first = eqText[0];
                var last = eqText[1];
                eqText = last + '\u{2192}' + first;

                finalTICode += eqText + '\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            case "FOR": {
                finalTICode += 'For(' + this.value + ')\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }

                finalTICode += 'End\n';
                break;
            }
            case "WHILE": {
                finalTICode += 'While ' + this.value + '\n';
                
                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }

                finalTICode += 'End\n';
                break;
            }
            case "CLEAR": {
                finalTICode += 'ClrHome\n';

                // recurse
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].parse();
                }
                break;
            }
            default: {
                break;
            }
        }
    }
}

const keywords = ["TITLE", "OPTION", "INPUT", "DISPLAY", "WAITSTOP", "NOTE", "INJECT", "IF", "ELSE", "MATH", "FOR", "WHILE", "CLEAR", "WAIT", "STOP"];

var progNode;

var depth = 0;

var finalTICode;

function parseCode(codeText) {
    finalTICode = "ClrHome\n";

    codeText = codeText.split("\n");

    convertToAST(codeText);

    progNode.parse();

    codeOutput.innerText = finalTICode;
}

// abstract syntax tree
function convertToAST(codeText) {
    progNode = new TINode("PROGRAM");
    var runningParent = progNode;

    idCounter = 0;

    for (var i = 0; i < codeText.length; i++) {
        var includesKeyword = false;
        for (var j = 0; j < keywords.length; j++) {
            if (codeText[i].includes(keywords[j])) {
                includesKeyword = true;
                runningParent.children.push(new TINode(keywords[j]));
                runningParent.children[runningParent.children.length - 1].parent = runningParent;

                // value holding keywords
                if (keywords[j] == "TITLE" || keywords[j] == "OPTION" || keywords[j] == "INPUT" || keywords[j] == "DISPLAY" || keywords[j] == "NOTE" || keywords[j] == "IF" || keywords[j] == "MATH" || keywords[j] == "FOR" || keywords[j] == "WHILE") {
                    runningParent.children[runningParent.children.length - 1].value = codeText[i].substring(codeText[i].indexOf(keywords[j]) + keywords[j].length + 1, codeText[i].length);
                }

                // remove quotes
                if (keywords[j] == "TITLE" || keywords[j] == "OPTION" || keywords[j] == "NOTE") {
                    var tempVal = runningParent.children[runningParent.children.length - 1].value
                    runningParent.children[runningParent.children.length - 1].value = tempVal.substring(tempVal.indexOf('"') + 1, tempVal.indexOf('"', tempVal.indexOf('"') + 1));
                }

                // assign id
                runningParent.children[runningParent.children.length - 1].id = idCounter;
                idCounter++;
            }
        }
        // add comment check here
        if (!includesKeyword) {
            if (codeText[i].includes("{")) {
                runningParent = runningParent.children[runningParent.children.length - 1];
            } else if (codeText[i].includes("}")) {
                runningParent = runningParent.parent;
            } else {
                if (runningParent.type == "INJECT") {
                    runningParent.value += codeText[i].trimStart() + "\n";
                } else {
                    // 

                }
            }
        }
    }
}
