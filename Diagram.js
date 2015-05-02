function Diagram(elementId, templateId) {
    this.add = add;
    this.setMood = setMood;

    var lastId = -1;
    var currentGroup = null;
    var lastGroup = null;
    var lastX = null;
    var lastY = null;
    var mood = 'replace';
    var joinings = new Set();

    $(document.body).on('click', '[id^=svg-g-]', function(e) {
        var id = this.id.split('-')[2];
        console.log('click '+id);
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

    function select() {
        $('#'+elementId).attr('cursor', 'move');
    }

    function choose(id) {
        console.log($('#svg-g-'+id).html());
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
    }

    function join(a, b) {
        if(a !== b) joinings.add(toPair(a, b));
        joinings.forEach(function(i){
            console.log(i);
        });
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
        return a<=b ? a+','+b : b+','+a;
    }

    function refresh() {
        $('body').html($('body').html());
    }

    function doVectorColide(a, b) {
        console.log('a='+JSON.stringify(a));
        console.log('b='+JSON.stringify(b));
        console.log('a.x > b.x + b.w: '+(a.x > b.x + b.w));
        console.log('a.y > b.y + b.h: '+(a.y > b.y + b.h));
        console.log('a.x + a.w < b.x: '+(a.x + a.w < b.x));
        console.log('a.y + a.h < b.y: '+(a.y + a.h < b.y));
        return !(a.x > b.x + b.w || a.y > b.y + b.h || a.x + a.w < b.x || a.y + a.h < b.y);
    }

    function isRectInside(a, b) {
        return a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
    }

    function isCollision(id, dx, dy) {
        console.log('id='+id);
        var elem = $('#svg-g-'+id)[0];
        for(var i=0; i<lastId+1; i++) if(i!=id) {
            console.log('i='+i);
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
            console.log('isCollisionHere='+isCollisionHere);
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
