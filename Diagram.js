function Diagram(elementId, templateId, templateLineId) {
    this.add = add;
    this.setMood = setMood;

    var lastId = -1;
    var currentGroup = null;
    var lastGroup = null;
    var lastX = null;
    var lastY = null;
    var mood = 'replace';
    var joinings = {};

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

    function add() {
        var template = $('#'+templateId)[0];
        var element = $('#'+elementId)[0];
        var el = template.cloneNode();
        el.innerHTML = template.innerHTML;
        lastId++;
        el.id = 'svg-g-'+lastId;
        element.appendChild(el);
        refresh();
    }

    function addLine(a, b) {
        var line = $('#'+templateLineId).clone();
        line.attr('id', getLineId(a, b));
        $('#'+elementId).append(line);
        updateLine(a, b);
        refresh();
    }

    function updateLine(a, b) {
        console.log('lineId='+getLineId(a, b));
        var line = $('#'+getLineId(a, b))[0];
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

    function choose(id) {
        if(mood === 'select') {
            currentGroup = id;
        } else if(mood === 'join') {
            if(lastGroup === null) lastGroup = id;
            else join(lastGroup, id);
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
        var group = $('#svg-g-'+lastGroup);
        group[0].setAttribute('x', parseInt(group[0].getAttribute('x'))+dx);
        group[0].setAttribute('y', parseInt(group[0].getAttribute('y'))+dy);
        var children = group.children();
        for(var i=0; i<children.length; i++) {
            children[i].setAttribute('x', parseInt(children[i].getAttribute('x'))+dx);
            children[i].setAttribute('y', parseInt(children[i].getAttribute('y'))+dy);
        }
        moveAllJoinings(id);
    }

    function moveAllJoinings(id) {
        if(typeof(joinings[id]) === 'undefined') return;
        var keys = Object.keys(joinings[id]);
        for(var i in keys) updateLine(id, keys[i]);
    }

    function join(a, b) {
        if(a !== b) {
            if(typeof(joinings[a]) === 'undefined') joinings[a] = {};
            if(typeof(joinings[a][b]) === 'undefined') addLine(a, b);
            joinings[a][b] = null;
            if(typeof(joinings[b]) === 'undefined') joinings[b] = {};
            joinings[b][a] = null;
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
        for(var i=0; i<lastId+1; i++) if(i!=id) {
            var a = {
                x: parseInt(elem.getAttribute('x')) + dx,
                y: parseInt(elem.getAttribute('y')) + dy,
                w: parseInt(elem.getAttribute('width')),
                h: parseInt(elem.getAttribute('height'))
            };
            var elemHere = $('#svg-g-'+i)[0];
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
