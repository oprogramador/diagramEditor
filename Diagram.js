/****************************************
 *
 * Author: Piotr Sroczkowski
 *
 ****************************************/

function Diagram(elementId, templateId, templateLineId, formId, buttonsId) {
    this.add = add;
    this.setMood = setMood;

    var lastId = -1;
    var currentGroup = null;
    var lastGroup = null;
    var lastX = null;
    var lastY = null;
    var mood = 'replace';
    var joinings = {};

    selectButton($('#'+buttonsId+' [name=replace]')[0]);

    function serialize() {
        var data = {
            lastId: lastId,
            currentGroup: currentGroup,
            lastGroup: lastGroup,
            lastX: lastX,
            lastY: lastY,
            mood: mood,
            joinings: joinings,
            html: document.body.innerHTML,
        };
        return JSON.stringify(data);
    }

    function unserialize(data) {
        debugger;
        data = JSON.parse(data);
        document.body.innerHTML = data.html;
        lastId = data.lastId;
        currentGroup = data.currentGroup;
        lastGroup = data.lastGroup;
        lastX = data.lastX;
        lastY = data.lastY;
        mood = data.mood;
        joinings = data.joinings;
    }

    document.body.onchange = function(value) {
        value = JSON.parse(value);
        //$('#svgSerialization').remove();
        //$('body').append('<div id="svgSerialization" style="display:none">'+s+'</div>');
        if(value.msg === 'serialize') return serialize();
        if(value.msg === 'unserialize') return unserialize(value.data);
    }

    $(document.body).on('click', '[id^=svg-g-]', function(e) {
        var id = this.id.split('-')[2];
        choose(id);
    });

    $(document.body).on('mousedown', '[id^=svg-g-]', function(e) {
        var id = this.id.split('-')[2];
        mousedown(id, e.clientX, e.clientY);
    });

    $(document.body).on('mouseup', '#'+elementId, function(e) {
        mouseup(e.clientX, e.clientY);
    });

    $(document.body).on('mousemove', '#'+elementId, function(e) {
        mousemove(e.clientX, e.clientY);
    });

    $(document.body).on('dragstart', '[id^=svg-g-]', function(e) {
        return false;
    });

    $(document.body).on('keyup', '#'+formId+' [name=text]', function(e) {
        if(currentGroup !== null) $('#svg-g-'+currentGroup+' text').html(this.value);
    });

    $(document.body).on('change', '#'+formId+' [name=background]', function(e) {
        if(currentGroup !== null) $('#svg-g-'+currentGroup+' [istrueshape=true]').css('fill', this.value);
    });


    $(document.body).on('change', '#'+formId+' [name=shape]', function(e) {
        if(currentGroup !== null) changeShape(currentGroup, this.value);
    });

    $(document.body).on('click', '#'+buttonsId+' [name=add]', function(e) {
        add();
    });

    $(document.body).on('click', '#'+buttonsId+' [name=clear]', function(e) {
        clear();
    });

    $(document.body).on('click', '#'+buttonsId+' [name=export]', function(e) {
        exportGraphics();
    });

    $(document.body).on('click', '#'+buttonsId+' [name=replace]', function(e) {
        setMood('replace');
        selectButton(this);
    });

    $(document.body).on('click', '#'+buttonsId+' [name=join]', function(e) {
        setMood('join');
        selectButton(this);
    });

    $(document.body).on('click', '#'+buttonsId+' [name=select]', function(e) {
        setMood('select');
        selectButton(this);
    });

    $(document.body).on('click', '#'+buttonsId+' [name=remove]', function(e) {
        setMood('remove');
        selectButton(this);
    });

    $(document.body).on('click', '#'+formId+' [name=left]', function(e) {
        tryMove(-50, 0);
    });

    $(document.body).on('click', '#'+formId+' [name=right]', function(e) {
        tryMove(50, 0);
    });

    $(document.body).on('click', '#'+formId+' [name=up]', function(e) {
        tryMove(0, -50);
    });

    $(document.body).on('click', '#'+formId+' [name=down]', function(e) {
        tryMove(0, 50);
    });

    $(document.body).on('click', '#'+formId+' [name=plus]', function(e) {
        tryResize(Math.pow(2, 0.25));
    });

    $(document.body).on('click', '#'+formId+' [name=minus]', function(e) {
        tryResize(Math.pow(2, -0.25));
    });

    function tryResize(k) {
        if(mood === 'select' && currentGroup !== null) resize(currentGroup, k);
    }

    function exportGraphics() {
        var xml = new XMLSerializer().serializeToString($('#'+elementId)[0]);
        var data = 'data:image/svg+xml;base64,'+btoa(xml);
        var name = 'Image'+Date.now()+'.png';
        $('#'+elementId).after('<div><a href="'+data+'" download="'+name+'">'+name+'</a></div>');
    }

    function resizeElement(element, k) {
        if(element.nodeName === 'ellipse') {
            element.setAttribute('rx', parseFloat(element.getAttribute('rx'))*k);
            element.setAttribute('ry', parseFloat(element.getAttribute('ry'))*k);
        }
        if(['g', 'rect', 'text'].indexOf(element.nodeName) >= 0) {
            element.setAttribute('width', parseFloat(element.getAttribute('width'))*k);
            element.setAttribute('height', parseFloat(element.getAttribute('height'))*k);
        }
        if(['g', 'rect'].indexOf(element.nodeName) >= 0) {
            var dx = parseFloat(element.getAttribute('width'))*(1-k)/2;
            var dy = parseFloat(element.getAttribute('height'))*(1-k)/2;
            element.setAttribute('x', parseFloat(element.getAttribute('x'))+dx);
            element.setAttribute('y', parseFloat(element.getAttribute('y'))+dy);
        }
    }

    function resize(id, k) {
        var group = $('#svg-g-'+id);
        var children = group.children();
        resizeElement(group[0], k);
        for(var i=0; i<children.length; i++) {
            resizeElement(children[i], k);
        }
    }

    function tryMove(x, y) {
        if(mood === 'select' && currentGroup !== null) moveGroup(currentGroup, x, y);
    }

    function switchButtonsOff() {
        $('#'+buttonsId+' button').removeClass('selected_btn');
    }

    function changeShape(id, shape) {
        $('#svg-g-'+id+' [istrueshape=true]').css('display', 'none');
        $('#svg-g-'+id+' '+shape).css('display', 'block');
        $('#svg-g-'+id).attr('shape', shape);
    }

    function selectButton(button) {
        switchButtonsOff();
        switchOffGraphically();
        $(button).addClass('selected_btn');
    }

    function clear() {
        $('[id^=svg-]').remove();
        joinings = {};
    }

    function add() {
        var template = $('#'+templateId)[0];
        var element = $('#'+elementId)[0];
        var el = template.cloneNode();
        el.innerHTML = template.innerHTML;
        lastId++;
        el.id = 'svg-g-'+lastId;
        element.appendChild(el);
        if(isCollision(lastId, 0, 0)) {
            alert('To add a new field, release the space in the left-top corner');
            element.removeChild(el);
            lastId--;
        }
        refresh();
        $('#svg-g-'+lastId).attr('shape', 'rect');
    }

    function addLine(a, b) {
        var line = $('#'+templateLineId).clone();
        line.attr('id', getLineId(a, b));
        $('#'+elementId).prepend(line);
        updateLine(a, b);
        refresh();
    }

    function updateLine(a, b) {
        console.log('lineId='+getLineId(a, b));
        var line = $('#'+getLineId(a, b)+' line')[0];
        a = $('#svg-g-'+a)[0];
        b = $('#svg-g-'+b)[0];
        line.setAttribute('x1', parseInt(a.getAttribute('x')) + parseInt(a.getAttribute('width'))/2);
        line.setAttribute('x2', parseInt(b.getAttribute('x')) + parseInt(b.getAttribute('width'))/2);
        line.setAttribute('y1', parseInt(a.getAttribute('y')) + parseInt(a.getAttribute('height'))/2);
        line.setAttribute('y2', parseInt(b.getAttribute('y')) + parseInt(b.getAttribute('height'))/2);
    }

    function select() {
        $('#'+elementId).attr('cursor', 'move');
    }

    function switchOffGraphically() {
        $('[id^=svg-g-] [istrueshape=true]').css('stroke-width', 3);
    }

    function chooseGraphically(id) {
        switchOffGraphically();
        $('#svg-g-'+id+' [istrueshape=true]').css('stroke-width', 8);
    }

    function removeLine(a, b) {
        $('#'+getLineId(a, b)).remove();
    }

    function removeGroup(id) {
        $('#svg-g-'+id).remove();
        delete joinings[id];
        var keys = Object.keys(joinings);
        for(var i in keys) {
            delete joinings[keys[i]][id];
            removeLine(id, keys[i]);
        }
    }

    function updateForm(id) {
        var form = $('#'+formId);
        form.find('[name=text]').val($('#svg-g-'+id+' text').html());
        form.find('[name=shape]').val($('#svg-g-'+id).attr('shape'));
        form.find('[name=background]').val($('#svg-g-'+id+' [istrueshape=true]').css('fill'));
    }

    function choose(id) {
        if(mood === 'select') {
            currentGroup = id;
            updateForm(id);
            chooseGraphically(id);
        } else if(mood === 'join') {
            if(lastGroup === null) {
                chooseGraphically(id);
                lastGroup = id;
            }
            else {
                switchOffGraphically();
                join(lastGroup, id);
            }
        } else if(mood === 'remove') {
            removeGroup(id);
        }
    }

    function mousedown(id, x, y) {
        if(mood === 'replace') {
            lastGroup = id;
            lastX = x;
            lastY = y;
        }
    }

    function mouseup(x, y) {
        if(mood === 'replace') {
            if(lastX !== null) moveGroup(lastGroup, x-lastX, y-lastY);
            lastGroup = null;
            lastX = null;
            lastY = null;
        }
    }

    function mousemove(x, y) {
        if(mood === 'replace') {
            if(lastX !== null) {
                moveGroup(lastGroup, x-lastX, y-lastY);
                lastX = x;
                lastY = y;
            }
        }
    }

    function moveGroup(id, dx, dy) {
        if(isBoardCollision(id, dx, dy)) return;
        if(isCollision(id, dx, dy)) return;
        var group = $('#svg-g-'+id);
        group[0].setAttribute('x', parseInt(group[0].getAttribute('x'))+dx);
        group[0].setAttribute('y', parseInt(group[0].getAttribute('y'))+dy);
        var children = group.children();
        for(var i=0; i<children.length; i++) {
            var attrNames = {x: 'x', y: 'y'};
            if(['ellipse'].indexOf(children[i].nodeName) >= 0) attrNames = {x: 'cx', y: 'cy'}; 
            children[i].setAttribute(attrNames.x, parseInt(children[i].getAttribute(attrNames.x))+dx);
            children[i].setAttribute(attrNames.y, parseInt(children[i].getAttribute(attrNames.y))+dy);
        }
        moveAllJoinings(id);
    }

    function moveAllJoinings(id) {
        if(typeof(joinings[id]) === 'undefined') return;
        var keys = Object.keys(joinings[id]);
        for(var i in keys) updateLine(id, keys[i]);
    }

    function removeLine(a, b) {
        $('#'+getLineId(a, b)).remove();
    }

    function removeJoining(a, b) {
        delete joinings[a][b];
        delete joinings[b][a];
        removeLine(a, b);
        console.log('joinings='+JSON.stringify(joinings));
    }

    function join(a, b) {
        if(a !== b) {
            if(typeof(joinings[a]) === 'undefined') joinings[a] = {};
            if(typeof(joinings[a][b]) === 'undefined') {
                addLine(a, b);
                joinings[a][b] = null;
                if(typeof(joinings[b]) === 'undefined') joinings[b] = {};
                joinings[b][a] = null;
            } else removeJoining(a, b);
        }
        console.log('joinings='+JSON.stringify(joinings));
        lastGroup = null;
    }

    function setMood(m) {
        mood = m;
        currentGroup = null;
        lastGroup = null;
        lastX = null;
        lastY = null;
    }

    function toPair(a, b) {
        return a<=b ? a+'-'+b : b+'-'+a;
    }

    function getLineId(a, b) {
        return 'svg-line-'+toPair(a, b);
    }

    function refresh() {
        $('body').html($('body').html());
    }

    function doVectorColide(a, b) {
        return !(a.x > b.x + b.w || a.y > b.y + b.h || a.x + a.w < b.x || a.y + a.h < b.y);
    }

    function isRectInside(a, b) {
        return a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
    }

    function isCollision(id, dx, dy) {
        var elem = $('#svg-g-'+id)[0];
        var children = $('[id^=svg-g-]');
        for(var i=0; i<children.length; i++) {
            var elemHere = children[i];
            if(elem.id === elemHere.id) continue;
            var a = {
                x: parseInt(elem.getAttribute('x')) + dx,
                y: parseInt(elem.getAttribute('y')) + dy,
                w: parseInt(elem.getAttribute('width')),
                h: parseInt(elem.getAttribute('height'))
            };
            var b = {
                x: parseInt(elemHere.getAttribute('x')),
                y: parseInt(elemHere.getAttribute('y')),
                w: parseInt(elemHere.getAttribute('width')),
                h: parseInt(elemHere.getAttribute('height'))
            };
            var isCollisionHere = doVectorColide(a, b);
            if(isCollisionHere) return true;
        }
        return false;
    }

    function isBoardCollision(id, dx, dy) {
        var elem = $('#svg-g-'+id)[0];
        var a = {
            x: parseInt(elem.getAttribute('x')) + dx,
            y: parseInt(elem.getAttribute('y')) + dy,
            w: parseInt(elem.getAttribute('width')),
            h: parseInt(elem.getAttribute('height'))
        };
        elemB = $('#'+elementId)[0];
        var b = {
            x: 0,
            y: 0,
            w: parseInt(elemB.getAttribute('width')),
            h: parseInt(elemB.getAttribute('height'))
        };
        return !isRectInside(a, b);
    }
}
